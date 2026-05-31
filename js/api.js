<<<<<<< HEAD
/**
 * Project: FitTrack - Developed by Nhom 9
 */

const BASE_URL = 'https://69f9a93bc509a40d3aa2f648.mockapi.io/api/vl';

const API = {
  /**
   * Helper to handle fetch requests cleanly
   */
  async request(endpoint, options = {}) {
    const url = `${BASE_URL}${endpoint}`;
    
    // Set headers
    options.headers = {
      'Content-Type': 'application/json',
      ...options.headers,
    };

    try {
      const response = await fetch(url, options);
      if (!response.ok) {
        const text = await response.text();
        throw new Error(`HTTP Error ${response.status}: ${text || response.statusText}`);
      }
      return await response.json();
    } catch (error) {
      console.error(`API Request Failure on ${endpoint}:`, error);
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
      ...userData
    };
    
    return this.request('/users', {
      method: 'POST',
      body: JSON.stringify(payload)
    });
  },

  /**
   * Login user by validating credentials
   */
  async login(username, password) {
    const users = await this.getUsers();
    const user = users.find(u => u.username === username && u.password === password);
    if (!user) {
      throw new Error('Tên đăng nhập hoặc mật khẩu không chính xác!');
    }
    return user;
  },

  /**
   * Get all registered users
   */
  async getUsers() {
    return this.request('/users');
  },

  /**
   * Sync and overwrite user's workout log
   * @param {string|number} userId
   * @param {Object} fullUserData
   */
  async updateUserWorkings(userId, fullUserData) {
    return this.request(`/users/${userId}`, {
      method: 'PUT',
      body: JSON.stringify(fullUserData)
    });
  },

  // ==========================================
  // MODULE EXERCISE MASTER DATA (CRUD)
  // ==========================================

  /**
   * Fetch all master exercises
   */
  async getExercises() {
    let exercises = await this.request('/exercises');
    
    // Auto-seed typical exercises if list is completely empty
    if (!exercises || exercises.length === 0) {
      console.log('No exercises found in MockAPI. Running auto-seeding logic...');
      const seedData = [
        { exerciseName: 'Chạy bộ (Running)', muscleGroup: 'Đùi / Tim mạch', caloriesPerMinute: 10, description: 'Chạy bộ ngoài trời hoặc trên máy chạy để nâng cao sức bền.' },
        { exerciseName: 'Hít đất (Push-ups)', muscleGroup: 'Ngực / Tay sau', caloriesPerMinute: 8, description: 'Bài tập cơ bản bằng trọng lượng cơ thể giúp phát triển cơ ngực.' },
        { exerciseName: 'Squat (Gánh đùi)', muscleGroup: 'Đùi trước / Mông', caloriesPerMinute: 7, description: 'Bài tập giúp tăng lực vùng đùi trước và mông đùi săn chắc.' },
        { exerciseName: 'Hít xà đơn (Pull-ups)', muscleGroup: 'Lưng / Bắp tay', caloriesPerMinute: 9, description: 'Bài tập xà đơn tăng cường sức mạnh toàn cơ lưng xô.' },
        { exerciseName: 'Plank (Gồng bụng)', muscleGroup: 'Cơ bụng / Core', caloriesPerMinute: 4, description: 'Bài tập gồng giữ người thẳng để kiến tạo vùng cơ bụng khỏe.' }
      ];
      
      const createdExercises = [];
      for (const item of seedData) {
        try {
          const res = await this.addExercise(item);
          createdExercises.push(res);
        } catch (err) {
          console.error('Failed to seed exercise:', item.exerciseName, err);
        }
      }
      return createdExercises.length > 0 ? createdExercises : [];
    }
    
    return exercises;
  },

  /**
   * Add a new exercise
   */
  async addExercise(data) {
    return this.request('/exercises', {
      method: 'POST',
      body: JSON.stringify(data)
    });
  },

  /**
   * Update an existing exercise
   */
  async updateExercise(id, data) {
    return this.request(`/exercises/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data)
    });
  },

  /**
   * Delete an exercise
   */
  async deleteExercise(id) {
    return this.request(`/exercises/${id}`, {
      method: 'DELETE'
    });
  }
};

// Export to window object for ease of vanilla integration
window.API = API;
=======
/* =========================================
   FITTRACK API.JS
========================================= */

/* =========================================
   MOCKAPI URL
========================================= */

const API_BASE_URL =
    "https://69f9a93bc509a40d3aa2f648.mockapi.io/api/v1";

/* =========================================
   API RESOURCE CLASS
========================================= */

class APIResource {

    constructor(resourceName) {

        this.resourceName =
            resourceName;

        this.baseUrl =
            `${API_BASE_URL}/${resourceName}`;

    }

    /* =====================================
       GET ALL
    ===================================== */

    async getAll() {

        try {

            const response =
                await fetch(
                    this.baseUrl
                );

            if (!response.ok) {

                throw new Error(
                    `Không thể tải ${this.resourceName}`
                );

            }

            return await response.json();

        }
        catch (error) {

            console.error(
                "GET ALL ERROR:",
                error
            );

            return [];

        }

    }

    /* =====================================
       GET BY ID
    ===================================== */

    async getById(id) {

        try {

            const response =
                await fetch(
                    `${this.baseUrl}/${id}`
                );

            if (!response.ok) {

                throw new Error(
                    `Không tìm thấy dữ liệu`
                );

            }

            return await response.json();

        }
        catch (error) {

            console.error(
                "GET BY ID ERROR:",
                error
            );

            return null;

        }

    }

    /* =====================================
       CREATE
    ===================================== */

    async create(data) {

        try {

            const response =
                await fetch(
                    this.baseUrl,
                    {
                        method: "POST",

                        headers: {

                            "Content-Type":
                                "application/json"

                        },

                        body:
                            JSON.stringify(data)

                    }
                );

            if (!response.ok) {

                throw new Error(
                    `Không thể thêm dữ liệu`
                );

            }

            return await response.json();

        }
        catch (error) {

            console.error(
                "CREATE ERROR:",
                error
            );

            return null;

        }

    }

    /* =====================================
       UPDATE
    ===================================== */

    async update(id, data) {

        try {

            const response =
                await fetch(
                    `${this.baseUrl}/${id}`,
                    {
                        method: "PUT",

                        headers: {

                            "Content-Type":
                                "application/json"

                        },

                        body:
                            JSON.stringify(data)

                    }
                );

            if (!response.ok) {

                throw new Error(
                    `Không thể cập nhật`
                );

            }

            return await response.json();

        }
        catch (error) {

            console.error(
                "UPDATE ERROR:",
                error
            );

            return null;

        }

    }

    /* =====================================
       DELETE
    ===================================== */

    async delete(id) {

        try {

            const response =
                await fetch(
                    `${this.baseUrl}/${id}`,
                    {
                        method: "DELETE"
                    }
                );

            if (!response.ok) {

                throw new Error(
                    `Không thể xóa`
                );

            }

            return true;

        }
        catch (error) {

            console.error(
                "DELETE ERROR:",
                error
            );

            return false;

        }

    }

}

/* =========================================
   WORKOUT API
========================================= */

const fittrackAPI =
    new APIResource(
        "FitTrack_1"
    );

/* =========================================
   USER API
========================================= */

const userAPI =
    new APIResource(
        "Users"
    );

/* =========================================
   TRAINER API
========================================= */

const trainerAPI =
    new APIResource(
        "Trainers"
    );

/* =========================================
   REGISTER USER
========================================= */

async function registerUser(userData) {

    const users =
        await userAPI.getAll();

    const existed =
        users.find(user =>

            user.email ===
            userData.email

        );

    if (existed) {

        alert(
            "❌ Email đã tồn tại"
        );

        return false;

    }

    const created =
        await userAPI.create(
            userData
        );

    if (created) {

        alert(
            "✅ Đăng ký thành công"
        );

        return true;

    }

    return false;

}

/* =========================================
   LOGIN USER
========================================= */

async function loginUser(
    email,
    password
) {

    const users =
        await userAPI.getAll();

    const foundUser =
        users.find(user =>

            user.email === email &&
            user.password === password

        );

    if (foundUser) {

        localStorage.setItem(

            "fittrackCurrentUser",

            JSON.stringify(
                foundUser
            )

        );

        return true;

    }

    return false;

}

/* =========================================
   LOGOUT USER
========================================= */

function logoutUser() {

    localStorage.removeItem(
        "fittrackCurrentUser"
    );

    window.location.href =
        "index.html";

}

/* =========================================
   GET CURRENT USER
========================================= */

function getCurrentUser() {

    return JSON.parse(

        localStorage.getItem(
            "fittrackCurrentUser"
        )

    );

}

/* =========================================
   PREMIUM
========================================= */

function activatePremium() {

    localStorage.setItem(

        "fittrackPremium",
        "true"

    );

    alert(
        "⭐ Premium Activated"
    );

}

/* =========================================
   CHECK PREMIUM
========================================= */

function isPremium() {

    return localStorage.getItem(
        "fittrackPremium"
    ) === "true";

}

/* =========================================
   HIRE TRAINER
========================================= */

async function hireTrainer(
    trainerName,
    packageName
) {

    const currentUser =
        getCurrentUser();

    if (!currentUser) {

        alert(
            "⚠ Vui lòng đăng nhập"
        );

        return false;

    }

    const hireData = {

        user:
            currentUser.email,

        trainer:
            trainerName,

        package:
            packageName,

        createdAt:
            new Date()
                .toISOString()

    };

    const result =
        await trainerAPI.create(
            hireData
        );

    if (result) {

        alert(
            `✅ Đã thuê HLV ${trainerName}`
        );

        return true;

    }

    return false;

}

/* =========================================
   LOAD TRAINER DATA
========================================= */

async function loadTrainerData() {

    const data =
        await trainerAPI.getAll();

    const container =
        document.getElementById(
            "trainerContainer"
        );

    if (!container) {

        return;

    }

    container.innerHTML = "";

    data.forEach(item => {

        container.innerHTML += `

            <div class="trainer-card">

                <h3>

                    👨‍🏫 ${item.trainer}

                </h3>

                <p>

                    👤 User:
                    ${item.user}

                </p>

                <p>

                    📦 Gói:
                    ${item.package}

                </p>

                <p>

                    🕒 ${item.createdAt}

                </p>

            </div>

        `;

    });

}

/* =========================================
   READY
========================================= */

console.log(
    "✅ FITTRACK API CONNECTED SUCCESSFULLY"
);
>>>>>>> 7a67f585ba4bc56f3e454ff426f2cc2583fdb848
