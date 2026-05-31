/**
 * Project: FitTrack - Developed by Nhom 9
 */

document.addEventListener('DOMContentLoaded', () => {
  // Initialize dashboard controls
  FitTrackApp.init();
});

const FitTrackApp = {
  currentUser: null,
  exercises: [],
  filteredWorkouts: [],
  authModal: null,
  workoutModal: null,

  /**
   * Application Bootstrapper
   */
  async init() {
    // Instantiate Bootstrap Modals for manual manipulation
    const authModalEl = document.getElementById('authModal');
    if (authModalEl) this.authModal = new bootstrap.Modal(authModalEl);
    
    const workoutModalEl = document.getElementById('workoutModal');
    if (workoutModalEl) this.workoutModal = new bootstrap.Modal(workoutModalEl);

    // Initial Theme & Theme Toggle Listener
    const btnThemeToggle = document.getElementById('btnThemeToggle');
    if (btnThemeToggle) {
      btnThemeToggle.addEventListener('click', () => UTILS.toggleTheme());
    }

    // Attach Event Listeners
    this.bindEvents();

    // Check existing authentication session
    this.checkSession();
  },

  /**
   * Bind event handlers to forms and UI filters
   */
  bindEvents() {
    // Auth Forms
    const formRegister = document.getElementById('formRegister');
    if (formRegister) {
      formRegister.addEventListener('submit', (e) => this.handleRegister(e));
    }

    const formLogin = document.getElementById('formLogin');
    if (formLogin) {
      formLogin.addEventListener('submit', (e) => this.handleLogin(e));
    }

    const btnLogout = document.getElementById('btnLogout');
    if (btnLogout) {
      btnLogout.addEventListener('click', () => this.handleLogout());
    }

    // Workout Logger Form
    const formWorkoutLog = document.getElementById('formWorkoutLog');
    if (formWorkoutLog) {
      formWorkoutLog.addEventListener('submit', (e) => this.handleSaveWorkout(e));
    }

    // Dynamic Calorie Multiplier Calculation
    const workoutExerciseSelect = document.getElementById('workoutExerciseSelect');
    const workoutDuration = document.getElementById('workoutDuration');
    
    if (workoutExerciseSelect && workoutDuration) {
      const calculateCaloriesLive = () => {
        const exerciseId = workoutExerciseSelect.value;
        const mins = parseInt(workoutDuration.value) || 0;
        
        if (!exerciseId || mins <= 0) {
          document.getElementById('workoutCaloriesDisplay').value = 0;
          return;
        }

        const selectedEx = this.exercises.find(ex => ex.id === exerciseId);
        if (selectedEx) {
          const calMin = parseFloat(selectedEx.caloriesPerMinute) || 0;
          document.getElementById('workoutCaloriesDisplay').value = Math.round(mins * calMin);
        }
      };

      workoutExerciseSelect.addEventListener('change', calculateCaloriesLive);
      workoutDuration.addEventListener('input', calculateCaloriesLive);
    }

    // Filter Listeners
    const filterMuscleGroup = document.getElementById('filterMuscleGroup');
    const filterExerciseName = document.getElementById('filterExerciseName');

    if (filterMuscleGroup && filterExerciseName) {
      filterMuscleGroup.addEventListener('change', () => this.applyFilters());
      filterExerciseName.addEventListener('change', () => this.applyFilters());
    }

    // Account Settings Modal Prefilling
    const settingsModalEl = document.getElementById('settingsModal');
    if (settingsModalEl) {
      settingsModalEl.addEventListener('show.bs.modal', () => {
        document.getElementById('settingsUsername').value = this.currentUser.username;
        document.getElementById('settingsRole').value = this.currentUser.role === 'admin' ? 'Quản trị viên (Admin)' : 'Học viên (Student)';
        document.getElementById('settingsFullName').value = this.currentUser.fullName;
        document.getElementById('settingsPassword').value = this.currentUser.password;

        // Populate package selector
        const pkgSection = document.getElementById('settingsPackageSection');
        if (pkgSection) {
          if (this.currentUser.role === 'admin') {
            pkgSection.classList.add('d-none');
          } else {
            pkgSection.classList.remove('d-none');
            const activePkg = this.currentUser.activePackage || 'Starter';
            const reqPkg = this.currentUser.requestedPackage;
            const reqStatus = this.currentUser.packageStatus;
            
            const pkgSelect = document.getElementById('settingsPackageSelect');
            if (reqPkg && reqStatus === 'Chờ duyệt') {
              pkgSelect.value = reqPkg;
              document.getElementById('settingsPackageStatusHint').innerHTML = 
                `<span class="text-warning fw-bold"><i class="bi bi-hourglass-split me-1"></i>Đang chờ duyệt gói: ${reqPkg}</span> (Gói hiện tại: ${activePkg})`;
            } else {
              pkgSelect.value = activePkg;
              document.getElementById('settingsPackageStatusHint').innerHTML = 
                `* Gói đang dùng: <strong>${activePkg}</strong>. Thay đổi lựa chọn để gửi yêu cầu đăng ký gói tập mới.`;
            }
          }
        }
      });
    }

    // Account Settings Form submit
    const formAccountSettings = document.getElementById('formAccountSettings');
    if (formAccountSettings) {
      formAccountSettings.addEventListener('submit', (e) => this.handleSaveSettings(e));
    }
  },

  /**
   * Manage initial session load state
   */
  async checkSession() {
    UTILS.showSpinner();
    try {
      // Fetch Master Exercises list from DB
      this.exercises = await API.getExercises();
      this.populateWorkoutSelector();
      
      const loggedUser = UTILS.getCurrentUser();
      if (loggedUser) {
        // Fetch fresh user data from server to ensure workouts array is up-to-date
        const allUsers = await API.getUsers();
        const freshUser = allUsers.find(u => u.id === loggedUser.id);
        
        if (freshUser) {
          this.currentUser = freshUser;
          UTILS.setCurrentUser(freshUser);
          this.showDashboard();
        } else {
          // If session user no longer exists, wipe local storage
          UTILS.clearSession();
          this.showAnonymousLanding();
        }
      } else {
        this.showAnonymousLanding();
      }
    } catch (error) {
      console.error('Bootstrapping error:', error);
      UTILS.showToast('Không thể kết nối đến máy chủ MockAPI. Vui lòng tải lại trang!', 'danger');
      this.showAnonymousLanding();
    } finally {
      UTILS.hideSpinner();
    }
  },

  /**
   * Transition views
   */
  showAnonymousLanding() {
    document.getElementById('anonymousView').classList.remove('d-none');
    document.getElementById('dashboardView').classList.add('d-none');
    document.getElementById('userProfileWidget').classList.add('d-none');
    document.getElementById('guestActions').classList.remove('d-none');
    document.getElementById('adminMenuLink').classList.add('d-none');
    
    // Hide conditional journal link
    const navJournal = document.getElementById('navJournalLink');
    if (navJournal) navJournal.classList.add('d-none');

    // Show landing page links
    const navPackages = document.getElementById('navPackagesLink');
    if (navPackages) navPackages.classList.remove('d-none');
    const navNutrition = document.getElementById('navNutritionLink');
    if (navNutrition) navNutrition.classList.remove('d-none');
    const navSupport = document.getElementById('navSupportLink');
    if (navSupport) navSupport.classList.remove('d-none');
  },

  showDashboard() {
    document.getElementById('anonymousView').classList.add('d-none');
    document.getElementById('dashboardView').classList.remove('d-none');
    document.getElementById('guestActions').classList.add('d-none');
    
    // Show conditional journal link
    const navJournal = document.getElementById('navJournalLink');
    if (navJournal) navJournal.classList.remove('d-none');

    // Hide landing page links for authenticated users to avoid cluttering
    const navPackages = document.getElementById('navPackagesLink');
    if (navPackages) navPackages.classList.add('d-none');
    const navNutrition = document.getElementById('navNutritionLink');
    if (navNutrition) navNutrition.classList.add('d-none');
    const navSupport = document.getElementById('navSupportLink');
    if (navSupport) navSupport.classList.add('d-none');
    
    // Configure user profile controls
    const profileWidget = document.getElementById('userProfileWidget');
    profileWidget.classList.remove('d-none');
    profileWidget.classList.add('d-flex');
    
    document.getElementById('headerFullName').innerText = this.currentUser.fullName;
    document.getElementById('headerRole').innerText = this.currentUser.role === 'admin' ? 'Quản trị viên' : 'Thành viên';
    document.getElementById('welcomeUserFullName').innerText = this.currentUser.fullName;

    // Show Admin Link if authenticated role is administrator
    const adminLink = document.getElementById('adminMenuLink');
    if (this.currentUser.role === 'admin') {
      adminLink.classList.remove('d-none');
    } else {
      adminLink.classList.add('d-none');
    }

    // Refresh calculations and UI lists
    this.renderStats();
    this.renderWeeklyChart();
    this.populateFilters();
    this.applyFilters();
  },

  // ==========================================
  // AUTHENTICATION LOGIC FLOWS
  // ==========================================

  async handleRegister(e) {
    e.preventDefault();
    
    const fullName = document.getElementById('registerFullName').value.trim();
    const username = document.getElementById('registerUsername').value.trim();
    const password = document.getElementById('registerPassword').value;
    
    // All users registering via the form register as a 'student' by default
    const role = 'student';

    if (!fullName || !username || !password) {
      UTILS.showToast('Vui lòng điền đầy đủ tất cả thông tin đăng ký!', 'warning');
      return;
    }

    UTILS.showSpinner();
    try {
      const newUser = await API.register({
        fullName,
        username,
        password,
        role,
        workouts: []
      });

      this.currentUser = newUser;
      UTILS.setCurrentUser(newUser);
      
      this.authModal.hide();
      document.getElementById('formRegister').reset();
      
      this.showDashboard();
      UTILS.showToast(`Chào mừng ${fullName} gia nhập đại gia đình FitTrack!`, 'success');
    } catch (error) {
      UTILS.showToast(error.message || 'Đăng ký thất bại. Vui lòng kiểm tra lại!', 'danger');
    } finally {
      UTILS.hideSpinner();
    }
  },

  async handleLogin(e) {
    e.preventDefault();

    const username = document.getElementById('loginUsername').value.trim();
    const password = document.getElementById('loginPassword').value;

    if (!username || !password) {
      UTILS.showToast('Vui lòng nhập đầy đủ tài khoản và mật khẩu!', 'warning');
      return;
    }

    UTILS.showSpinner();
    try {
      const user = await API.login(username, password);
      
      this.currentUser = user;
      UTILS.setCurrentUser(user);
      
      this.authModal.hide();
      document.getElementById('formLogin').reset();
      
      this.showDashboard();
      UTILS.showToast(`Chào mừng ${user.fullName} đã quay trở lại!`, 'success');
    } catch (error) {
      UTILS.showToast(error.message || 'Đăng nhập thất bại. Vui lòng kiểm tra lại thông tin!', 'danger');
    } finally {
      UTILS.hideSpinner();
    }
  },

  handleLogout() {
    UTILS.clearSession();
    this.currentUser = null;
    this.showAnonymousLanding();
    UTILS.showToast('Đã đăng xuất tài khoản thành công. Hẹn gặp lại bạn!', 'info');
  },

  // ==========================================
  // DASHBOARD CALCULATIONS & RENDERERS
  // ==========================================

  /**
   * Render total sessions, minutes, and cumulative calories burned
   */
  renderStats() {
    const workouts = this.currentUser.workouts || [];
    
    const totalSessions = workouts.length;
    
    const totalMins = workouts.reduce((sum, item) => sum + (parseInt(item.duration) || 0), 0);
    
    const totalCals = workouts.reduce((sum, item) => sum + (parseInt(item.totalCalories) || 0), 0);

    document.getElementById('statTotalWorkouts').innerText = totalSessions;
    document.getElementById('statTotalDuration').innerHTML = `${totalMins} <span class="fs-5">phút</span>`;
    document.getElementById('statTotalCalories').innerHTML = `${totalCals.toLocaleString('vi-VN')} <span class="fs-5">kcal</span>`;
  },

  /**
   * Pure HTML/CSS progress chart calculation & representation
   */
  renderWeeklyChart() {
    const workouts = this.currentUser.workouts || [];
    
    // Group workouts for the current week (Monday - Sunday)
    const today = new Date();
    const currentDay = today.getDay(); // 0 is Sunday, 1 is Monday...
    const diff = today.getDate() - currentDay + (currentDay === 0 ? -6 : 1); // adjust when day is Sunday
    const monday = new Date(today.setDate(diff));
    monday.setHours(0, 0, 0, 0);
    
    const sunday = new Date(monday);
    sunday.setDate(monday.getDate() + 6);
    sunday.setHours(23, 59, 59, 999);

    // Format week range label
    const formatDate = (d) => `${d.getDate()}/${d.getMonth() + 1}`;
    document.getElementById('chartWeekRange').innerText = `Tuần: ${formatDate(monday)} - ${formatDate(sunday)}`;

    // Calorie tally array per day (Mon -> Sun)
    const calPerDay = [0, 0, 0, 0, 0, 0, 0];

    workouts.forEach(w => {
      const wDate = new Date(w.date);
      if (wDate >= monday && wDate <= sunday) {
        let dayIndex = wDate.getDay(); // 0: Sun, 1: Mon, etc.
        let chartIndex = dayIndex === 0 ? 6 : dayIndex - 1; // Mon: 0 ... Sun: 6
        calPerDay[chartIndex] += parseInt(w.totalCalories) || 0;
      }
    });

    // Find the highest calorie day to base scaling on
    const maxCal = Math.max(...calPerDay);

    const dayIds = ['mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun'];

    dayIds.forEach((day, index) => {
      const dailyCal = calPerDay[index];
      const percent = maxCal > 0 ? (dailyCal / maxCal) * 100 : 0;
      
      const bar = document.getElementById(`bar-${day}`);
      const tooltip = document.getElementById(`tooltip-${day}`);
      
      if (bar && tooltip) {
        bar.style.height = `${percent}%`;
        tooltip.innerText = `${dailyCal} kcal`;
      }
    });
  },

  /**
   * Populate master dropdown for Workout logger Modal
   */
  populateWorkoutSelector() {
    const select = document.getElementById('workoutExerciseSelect');
    if (!select) return;

    // Reset except prompt
    select.innerHTML = '<option value="" disabled selected>-- Chọn bài tập trong danh mục --</option>';
    
    this.exercises.forEach(ex => {
      const option = document.createElement('option');
      option.value = ex.id;
      option.innerText = `${ex.exerciseName} (${ex.caloriesPerMinute} kcal/phút)`;
      select.appendChild(option);
    });
  },

  /**
   * Build filter Select options dynamically based on existing muscle groups and exercises
   */
  populateFilters() {
    const filterMuscle = document.getElementById('filterMuscleGroup');
    const filterExercise = document.getElementById('filterExerciseName');
    
    if (!filterMuscle || !filterExercise) return;

    // Save current values to restore if possible
    const currentMuscle = filterMuscle.value;
    const currentExercise = filterExercise.value;

    // Populate Muscle Groups
    const muscleGroups = [...new Set(this.exercises.map(ex => ex.muscleGroup).filter(Boolean))];
    filterMuscle.innerHTML = '<option value="">Tất cả Nhóm cơ</option>';
    muscleGroups.forEach(m => {
      const opt = document.createElement('option');
      opt.value = m;
      opt.innerText = m;
      filterMuscle.appendChild(opt);
    });
    filterMuscle.value = currentMuscle;

    // Populate Exercise Names
    const exerciseNames = [...new Set(this.exercises.map(ex => ex.exerciseName).filter(Boolean))];
    filterExercise.innerHTML = '<option value="">Tất cả Bài tập</option>';
    exerciseNames.forEach(n => {
      const opt = document.createElement('option');
      opt.value = n;
      opt.innerText = n;
      filterExercise.appendChild(opt);
    });
    filterExercise.value = currentExercise;
  },

  /**
   * Filter and render Workout table entries
   */
  applyFilters() {
    const filterMuscle = document.getElementById('filterMuscleGroup').value;
    const filterExercise = document.getElementById('filterExerciseName').value;
    const workouts = this.currentUser.workouts || [];

    this.filteredWorkouts = workouts.filter(w => {
      // Find matching exercise profile for this logged item to extract its muscle group
      const exProfile = this.exercises.find(ex => ex.id === w.exerciseId || ex.exerciseName === w.exerciseName);
      
      const muscleMatch = !filterMuscle || (exProfile && exProfile.muscleGroup === filterMuscle);
      const nameMatch = !filterExercise || w.exerciseName === filterExercise;

      return muscleMatch && nameMatch;
    });

    // Sort by date descending
    this.filteredWorkouts.sort((a, b) => new Date(b.date) - new Date(a.date));

    this.renderWorkoutsTable();
  },

  /**
   * Render workout log history table
   */
  renderWorkoutsTable() {
    const tbody = document.getElementById('workoutHistoryTableBody');
    if (!tbody) return;

    if (this.filteredWorkouts.length === 0) {
      tbody.innerHTML = `
        <tr>
          <td colspan="8" class="text-center py-4 text-body-secondary">
            <i class="bi bi-folder-x fs-4 d-block mb-2"></i> Không có dữ liệu nhật ký phù hợp.
          </td>
        </tr>
      `;
      return;
    }

    tbody.innerHTML = '';
    
    this.filteredWorkouts.forEach((w) => {
      const exProfile = this.exercises.find(ex => ex.id === w.exerciseId || ex.exerciseName === w.exerciseName);
      const muscle = exProfile ? exProfile.muscleGroup : 'N/A';
      
      // Formatting date nice
      const dateObj = new Date(w.date);
      const formattedDate = isNaN(dateObj.getTime()) ? w.date : `${dateObj.getDate().toString().padStart(2, '0')}/${(dateObj.getMonth() + 1).toString().padStart(2, '0')}/${dateObj.getFullYear()}`;

      const statusBadge = w.status === 'Đã duyệt'
        ? `<span class="badge bg-success bg-opacity-10 text-success border border-success border-opacity-25 py-1.5 px-2.5"><i class="bi bi-patch-check-fill me-1"></i>Đã duyệt</span>`
        : `<span class="badge bg-warning bg-opacity-10 text-warning border border-warning border-opacity-25 py-1.5 px-2.5"><i class="bi bi-hourglass-split me-1"></i>Chờ duyệt</span>`;

      const tr = document.createElement('tr');
      tr.innerHTML = `
        <td class="fw-semibold">${formattedDate}</td>
        <td>
          <div class="fw-bold text-success">${w.exerciseName}</div>
        </td>
        <td class="d-none d-md-table-cell"><span class="badge bg-secondary bg-opacity-10 text-secondary border border-secondary border-opacity-10">${muscle}</span></td>
        <td><i class="bi bi-stopwatch text-info me-1"></i>${w.duration} phút</td>
        <td class="fw-bold text-danger"><i class="bi bi-fire me-1"></i>${w.totalCalories} kcal</td>
        <td>${statusBadge}</td>
        <td class="d-none d-lg-table-cell text-body-secondary small text-truncate" style="max-width: 200px;" title="${w.notes || ''}">${w.notes || '<span class="text-muted italic">Không có ghi chú</span>'}</td>
        <td class="text-center">
          <button class="btn btn-sm btn-outline-danger border-danger-subtle px-2.5 rounded-3" onclick="FitTrackApp.handleDeleteWorkout('${w.workoutId}')" title="Xóa nhật ký">
            <i class="bi bi-trash3-fill"></i>
          </button>
        </td>
      `;
      tbody.appendChild(tr);
    });
  },

  // ==========================================
  // LOG WORKOUT INTERACTIONS
  // ==========================================

  async handleSaveWorkout(e) {
    e.preventDefault();

    const exerciseId = document.getElementById('workoutExerciseSelect').value;
    const date = document.getElementById('workoutDate').value;
    const duration = parseInt(document.getElementById('workoutDuration').value) || 0;
    const notes = document.getElementById('workoutNotes').value.trim();

    if (!exerciseId || !date || duration <= 0) {
      UTILS.showToast('Vui lòng lựa chọn bài tập, điền ngày tập và số phút tập hợp lệ!', 'warning');
      return;
    }

    const selectedEx = this.exercises.find(ex => ex.id === exerciseId);
    if (!selectedEx) {
      UTILS.showToast('Bài tập đã chọn không tồn tại trong danh mục hệ thống!', 'danger');
      return;
    }

    const calMin = parseFloat(selectedEx.caloriesPerMinute) || 0;
    const totalCalories = Math.round(duration * calMin);

    const newWorkout = {
      workoutId: Date.now().toString(),
      date,
      exerciseId: selectedEx.id,
      exerciseName: selectedEx.exerciseName,
      duration,
      totalCalories,
      status: 'Chờ duyệt', // Default status for student workouts
      notes
    };

    UTILS.showSpinner();
    try {
      // Sync workouts back to database
      const workouts = [...(this.currentUser.workouts || []), newWorkout];
      const updatedUser = {
        ...this.currentUser,
        workouts
      };

      const result = await API.updateUserWorkings(this.currentUser.id, updatedUser);
      
      this.currentUser = result;
      UTILS.setCurrentUser(result);

      this.workoutModal.hide();
      document.getElementById('formWorkoutLog').reset();
      document.getElementById('workoutCaloriesDisplay').value = 0;

      // Re-render
      this.renderStats();
      this.renderWeeklyChart();
      this.populateFilters();
      this.applyFilters();

      UTILS.showToast(`Đã ghi nhận buổi tập ${selectedEx.exerciseName} thành công!`, 'success');
    } catch (error) {
      UTILS.showToast('Không thể đồng bộ dữ liệu tập luyện lên MockAPI!', 'danger');
    } finally {
      UTILS.hideSpinner();
    }
  },

  async handleDeleteWorkout(workoutId) {
    if (!confirm('Bạn có chắc chắn muốn xóa nhật ký buổi tập này không?')) return;

    UTILS.showSpinner();
    try {
      const workouts = (this.currentUser.workouts || []).filter(w => w.workoutId !== workoutId);
      const updatedUser = {
        ...this.currentUser,
        workouts
      };

      const result = await API.updateUserWorkings(this.currentUser.id, updatedUser);
      
      this.currentUser = result;
      UTILS.setCurrentUser(result);

      // Re-render
      this.renderStats();
      this.renderWeeklyChart();
      this.populateFilters();
      this.applyFilters();

      UTILS.showToast('Đã xóa nhật ký buổi tập thành công!', 'success');
    } catch (error) {
      UTILS.showToast('Không thể xóa dữ liệu trên MockAPI!', 'danger');
    } finally {
      UTILS.hideSpinner();
    }
  },

  /**
   * Submit and synchronize account settings updates
   */
  async handleSaveSettings(e) {
    e.preventDefault();

    const fullName = document.getElementById('settingsFullName').value.trim();
    const password = document.getElementById('settingsPassword').value;

    if (!fullName || !password) {
      UTILS.showToast('Vui lòng điền đầy đủ họ tên và mật khẩu!', 'warning');
      return;
    }

    const currentActivePkg = this.currentUser.activePackage || 'Starter';
    const currentReqPkg = this.currentUser.requestedPackage;
    const currentReqStatus = this.currentUser.packageStatus;

    let updatedUser = {
      ...this.currentUser,
      fullName,
      password
    };

    let pkgToastMsg = '';

    // If student, check package switching dropdown
    if (this.currentUser.role !== 'admin') {
      const selectedPkg = document.getElementById('settingsPackageSelect').value;
      if (selectedPkg !== currentActivePkg) {
        if (selectedPkg === 'Starter') {
          updatedUser.activePackage = 'Starter';
          updatedUser.requestedPackage = null;
          updatedUser.packageStatus = null;
          pkgToastMsg = ' và chuyển về gói Starter';
        } else {
          // Switching to Pro or VIP (needs admin approval)
          if (currentReqPkg !== selectedPkg || currentReqStatus !== 'Chờ duyệt') {
            updatedUser.requestedPackage = selectedPkg;
            updatedUser.packageStatus = 'Chờ duyệt';
            pkgToastMsg = ` và gửi yêu cầu đăng ký gói ${selectedPkg}`;
          }
        }
      }
    }

    UTILS.showSpinner();
    try {
      const result = await API.updateUserWorkings(this.currentUser.id, updatedUser);
      
      this.currentUser = result;
      UTILS.setCurrentUser(result);

      // Dismiss modal
      const settingsModalEl = document.getElementById('settingsModal');
      const settingsModal = bootstrap.Modal.getInstance(settingsModalEl);
      if (settingsModal) settingsModal.hide();

      // Dynamic reload welcome greetings and profile tags
      document.getElementById('headerFullName').innerText = result.fullName;
      document.getElementById('welcomeUserFullName').innerText = result.fullName;

      UTILS.showToast(`Đã cập nhật cài đặt tài khoản${pkgToastMsg} thành công!`, 'success');
    } catch (error) {
      console.error(error);
      UTILS.showToast('Lỗi khi đồng bộ thông tin cài đặt lên MockAPI!', 'danger');
    } finally {
      UTILS.hideSpinner();
    }
  },

  /**
   * Handle gym/workout package selection
   * If not logged in, ask to login. If logged in, save request to MockAPI for Admin approval.
   */
  async handleSelectPackage(packageName) {
    if (!this.currentUser) {
      UTILS.showToast('Vui lòng đăng nhập tài khoản để đăng ký gói tập!', 'warning');
      
      // Auto toggle auth modal and select Login tab
      if (this.authModal) {
        this.authModal.show();
        window.switchAuthTab('login');
      }
      return;
    }

    const currentActivePkg = this.currentUser.activePackage || 'Starter';
    const currentReqPkg = this.currentUser.requestedPackage;
    const currentReqStatus = this.currentUser.packageStatus;

    if (currentActivePkg === packageName) {
      UTILS.showToast(`Bạn đã kích hoạt thành công và đang sử dụng gói ${packageName}!`, 'info');
      return;
    }

    if (currentReqPkg === packageName && currentReqStatus === 'Chờ duyệt') {
      UTILS.showToast(`Yêu cầu đăng ký gói ${packageName} của bạn đang chờ quản trị viên phê duyệt!`, 'warning');
      return;
    }

    // Free Starter auto-activation
    if (packageName === 'Starter') {
      const updatedUser = {
        ...this.currentUser,
        activePackage: 'Starter',
        requestedPackage: null,
        packageStatus: null
      };

      UTILS.showSpinner();
      try {
        const result = await API.updateUserWorkings(this.currentUser.id, updatedUser);
        this.currentUser = result;
        UTILS.setCurrentUser(result);
        UTILS.showToast('Đã chuyển đổi về gói Starter mặc định thành công!', 'success');
      } catch (error) {
        UTILS.showToast('Không thể kích hoạt gói Starter. Vui lòng tải lại trang!', 'danger');
      } finally {
        UTILS.hideSpinner();
      }
      return;
    }

    // Pro and VIP need Admin approval
    const updatedUser = {
      ...this.currentUser,
      requestedPackage: packageName,
      packageStatus: 'Chờ duyệt'
    };

    UTILS.showSpinner();
    try {
      const result = await API.updateUserWorkings(this.currentUser.id, updatedUser);
      this.currentUser = result;
      UTILS.setCurrentUser(result);
      UTILS.showToast(`Yêu cầu đăng ký gói ${packageName} thành công! Đã gửi lên Admin chờ duyệt.`, 'success');
    } catch (error) {
      UTILS.showToast('Lỗi khi gửi yêu cầu đăng ký lên MockAPI!', 'danger');
    } finally {
      UTILS.hideSpinner();
    }
  }
};

// Global hooks for auth controls trigger from landing buttons
window.switchAuthTab = (tabName) => {
  const triggerEl = document.querySelector(`#authTabs button[id="tab${tabName.charAt(0).toUpperCase() + tabName.slice(1)}"]`);
  if (triggerEl) {
    const tabObj = new bootstrap.Tab(triggerEl);
    tabObj.show();
  }
};

// Expose app context globally for inline events
window.FitTrackApp = FitTrackApp;
