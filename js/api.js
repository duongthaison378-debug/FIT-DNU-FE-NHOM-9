/**
 * Project: FitTrack - Developed by Nhom 9
 * MockAPI Integration - All requests synced with MockAPI
 */

const BASE_URL = 'https://69f9a93bc509a40d3aa2f648.mockapi.io/api/vl';

console.log('🔗 MockAPI BASE_URL:', BASE_URL);

const API = {
  /**
   * Helper to handle fetch requests with logging
   */
  async request(endpoint, options = {}) {
    const url = `${BASE_URL}${endpoint}`;
    const method = options.method || 'GET';
    
    console.log(`📤 [${method}] ${endpoint}`);
    
    // Set headers
    options.headers = {
      'Content-Type': 'application/json',
      ...options.headers,
    };

    try {
      const response = await fetch(url, options);
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(`HTTP Error ${response.status}: ${JSON.stringify(data)}`);
      }
      
      console.log(`✅ [${method}] ${endpoint}:`, data);
      return data;
    } catch (error) {
      console.error(`❌ API Request Failure on ${endpoint}:`, error.message);
      throw error;
    }
  },

  // ==========================================
  // MODULE AUTH & WORKOUT LOGS
  // ==========================================

  /**
   * Register a new user
   * @param {Object} userData - { username, password, fullName, role, workouts }
   */
  async register(userData) {
    try {
      console.log('📝 Registering user:', userData.username);
      
      // Check if username already exists first
      const users = await this.getUsers();
      const exists = users.some(u => u.username.toLowerCase() === userData.username.toLowerCase());
      if (exists) {
        throw new Error('Tài khoản này đã tồn tại trên hệ thống!');
      }
      
      // Default values if not provided
      const payload = {
        role: 'student',
        workouts: [],
        activePackage: 'Starter',
        ...userData,
        createdAt: new Date().toISOString()
      };
      
      const result = await this.request('/users', {
        method: 'POST',
        body: JSON.stringify(payload)
      });
      
      console.log('✅ User registered successfully:', result);
      return result;
    } catch (error) {
      console.error('❌ Registration error:', error.message);
      throw error;
    }
  },

  /**
   * Login user by validating credentials
   */
  async login(username, password) {
    try {
      console.log('🔐 Logging in user:', username);
      
      const users = await this.getUsers();
      const user = users.find(u => u.username === username && u.password === password);
      if (!user) {
        throw new Error('Tên đăng nhập hoặc mật khẩu không chính xác!');
      }
      
      console.log('✅ Login successful for:', user.fullName);
      return user;
    } catch (error) {
      console.error('❌ Login error:', error.message);
      throw error;
    }
  },

  /**
   * Get all registered users
   */
  async getUsers() {
    try {
      console.log('📥 Fetching all users...');
      const users = await this.request('/users');
      console.log(`✅ Retrieved ${users.length} users from MockAPI`);
      return Array.isArray(users) ? users : [];
    } catch (error) {
      console.warn('⚠️ MockAPI error, using localStorage fallback:', error.message);
      return JSON.parse(localStorage.getItem('fittrack_users') || '[]');
    }
  },

  /**
   * Sync and overwrite user's workout log
   * @param {string|number} userId
   * @param {Object} fullUserData
   */
  async updateUserWorkings(userId, fullUserData) {
    try {
      console.log('💾 Updating user workouts for ID:', userId);
      
      const result = await this.request(`/users/${userId}`, {
        method: 'PUT',
        body: JSON.stringify(fullUserData)
      });
      
      console.log('✅ User updated on MockAPI:', result);
      
      // Also backup to localStorage
      let users = JSON.parse(localStorage.getItem('fittrack_users') || '[]');
      const idx = users.findIndex(u => u.id === userId || u.id == userId);
      if (idx >= 0) {
        users[idx] = fullUserData;
      } else {
        users.push(fullUserData);
      }
      localStorage.setItem('fittrack_users', JSON.stringify(users));
      console.log('✅ User also backed up to localStorage');
      
      return result;
    } catch (error) {
      console.warn('⚠️ MockAPI error, using localStorage fallback');
      
      // Fallback: save to localStorage
      let users = JSON.parse(localStorage.getItem('fittrack_users') || '[]');
      const idx = users.findIndex(u => u.id === userId || u.id == userId);
      if (idx >= 0) {
        users[idx] = { ...users[idx], ...fullUserData };
      } else {
        users.push({ ...fullUserData, id: Date.now() });
      }
      localStorage.setItem('fittrack_users', JSON.stringify(users));
      console.log('✅ User saved to localStorage');
      
      return fullUserData;
    }
  },

  // ==========================================
  // MODULE EXERCISE MASTER DATA (CRUD)
  // ==========================================

  /**
   * Fetch all master exercises
   */
  async getExercises() {
    try {
      console.log('📥 Fetching exercises from MockAPI...');
      let exercises = await this.request('/exercises');
      console.log(`✅ Retrieved ${exercises.length} exercises from MockAPI`);
      
      // Cache to localStorage
      localStorage.setItem('fittrack_exercises', JSON.stringify(exercises));
      
      return exercises;
    } catch (error) {
      console.warn('⚠️ MockAPI error, trying localStorage fallback');
      
      // Try to get from localStorage first
      let cachedExercises = JSON.parse(localStorage.getItem('fittrack_exercises') || '[]');
      
      // Auto-seed typical exercises if list is completely empty
      if (!cachedExercises || cachedExercises.length === 0) {
        console.log('🌱 No exercises found. Running auto-seeding logic...');
        const seedData = [
          { id: '1', exerciseName: 'Chạy bộ (Running)', muscleGroup: 'Đùi / Tim mạch', caloriesPerMinute: 10, description: 'Chạy bộ ngoài trời hoặc trên máy chạy để nâng cao sức bền.' },
          { id: '2', exerciseName: 'Hít đất (Push-ups)', muscleGroup: 'Ngực / Tay sau', caloriesPerMinute: 8, description: 'Bài tập cơ bản bằng trọng lượng cơ thể giúp phát triển cơ ngực.' },
          { id: '3', exerciseName: 'Squat (Gánh đùi)', muscleGroup: 'Đùi trước / Mông', caloriesPerMinute: 7, description: 'Bài tập giúp tăng lực vùng đùi trước và mông đùi săn chắc.' },
          { id: '4', exerciseName: 'Hít xà đơn (Pull-ups)', muscleGroup: 'Lưng / Bắp tay', caloriesPerMinute: 9, description: 'Bài tập xà đơn tăng cường sức mạnh toàn cơ lưng xô.' },
          { id: '5', exerciseName: 'Plank (Gồng bụng)', muscleGroup: 'Cơ bụng / Core', caloriesPerMinute: 4, description: 'Bài tập gồng giữ người thẳng để kiến tạo vùng cơ bụng khỏe.' }
        ];
        
        localStorage.setItem('fittrack_exercises', JSON.stringify(seedData));
        console.log('✅ Seeded 5 exercises to localStorage');
        return seedData;
      }
      
      return cachedExercises;
    }
  },

  /**
   * Add a new exercise
   */
  async addExercise(data) {
    try {
      console.log('➕ Adding exercise:', data.exerciseName);
      
      const result = await this.request('/exercises', {
        method: 'POST',
        body: JSON.stringify(data)
      });
      
      console.log('✅ Exercise added to MockAPI:', result);
      
      // Update localStorage cache
      let exercises = JSON.parse(localStorage.getItem('fittrack_exercises') || '[]');
      exercises.push(result);
      localStorage.setItem('fittrack_exercises', JSON.stringify(exercises));
      
      return result;
    } catch (error) {
      console.warn('⚠️ MockAPI error, saving to localStorage');
      
      // Fallback: save to localStorage
      const newExercise = { ...data, id: Date.now() };
      let exercises = JSON.parse(localStorage.getItem('fittrack_exercises') || '[]');
      exercises.push(newExercise);
      localStorage.setItem('fittrack_exercises', JSON.stringify(exercises));
      
      return newExercise;
    }
  },

  /**
   * Update an existing exercise
   */
  async updateExercise(id, data) {
    try {
      console.log('✏️ Updating exercise:', id);
      
      const result = await this.request(`/exercises/${id}`, {
        method: 'PUT',
        body: JSON.stringify(data)
      });
      
      console.log('✅ Exercise updated on MockAPI:', result);
      
      // Update localStorage
      let exercises = JSON.parse(localStorage.getItem('fittrack_exercises') || '[]');
      const idx = exercises.findIndex(e => e.id == id);
      if (idx >= 0) exercises[idx] = result;
      localStorage.setItem('fittrack_exercises', JSON.stringify(exercises));
      
      return result;
    } catch (error) {
      console.warn('⚠️ MockAPI error, updating localStorage');
      
      // Fallback: update localStorage
      let exercises = JSON.parse(localStorage.getItem('fittrack_exercises') || '[]');
      const idx = exercises.findIndex(e => e.id == id);
      if (idx >= 0) {
        exercises[idx] = { ...exercises[idx], ...data };
      }
      localStorage.setItem('fittrack_exercises', JSON.stringify(exercises));
      
      return exercises[idx];
    }
  },

  /**
   * Delete an exercise
   */
  async deleteExercise(id) {
    try {
      console.log('🗑️ Deleting exercise:', id);
      
      const result = await this.request(`/exercises/${id}`, {
        method: 'DELETE'
      });
      
      console.log('✅ Exercise deleted from MockAPI');
      
      // Update localStorage
      let exercises = JSON.parse(localStorage.getItem('fittrack_exercises') || '[]');
      exercises = exercises.filter(e => e.id != id);
      localStorage.setItem('fittrack_exercises', JSON.stringify(exercises));
      
      return result;
    } catch (error) {
      console.warn('⚠️ MockAPI error, deleting from localStorage');
      
      // Fallback: delete from localStorage
      let exercises = JSON.parse(localStorage.getItem('fittrack_exercises') || '[]');
      exercises = exercises.filter(e => e.id != id);
      localStorage.setItem('fittrack_exercises', JSON.stringify(exercises));
      
      return { success: true };
    }
  },

  /**
   * Delete a user account
   */
  async deleteUser(userId) {
    try {
      console.log('👤 Deleting user:', userId);
      
      const result = await this.request(`/users/${userId}`, {
        method: 'DELETE'
      });
      
      console.log('✅ User deleted from MockAPI');
      
      // Update localStorage
      let users = JSON.parse(localStorage.getItem('fittrack_users') || '[]');
      users = users.filter(u => u.id != userId);
      localStorage.setItem('fittrack_users', JSON.stringify(users));
      
      return result;
    } catch (error) {
      console.warn('⚠️ MockAPI error, deleting from localStorage');
      
      // Fallback: delete from localStorage
      let users = JSON.parse(localStorage.getItem('fittrack_users') || '[]');
      users = users.filter(u => u.id != userId);
      localStorage.setItem('fittrack_users', JSON.stringify(users));
      
      return { success: true };
    }
  }
};

// Export to window object for ease of vanilla integration
window.API = API;
