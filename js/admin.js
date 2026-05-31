/**
 * Project: FitTrack - Developed by Nhom 9
 */

document.addEventListener('DOMContentLoaded', () => {
  FitTrackAdmin.init();
});

const FitTrackAdmin = {
  adminUser: null,
  exercises: [],
  students: [], // Stores all users (students and admins alike) for management
  selectedStudent: null, // Tracks selected user profile
  crudModal: null,

  /**
   * Initialize Admin Application
   */
  async init() {
    // 1. Double verification check on JS runtime
    const currentUser = UTILS.getCurrentUser();
    if (!currentUser || currentUser.role !== 'admin') {
      UTILS.showToast('Truy cập bị từ chối! Bạn không phải Quản trị viên.', 'danger');
      setTimeout(() => {
        window.location.replace('index.html');
      }, 1000);
      return;
    }

    this.adminUser = currentUser;

    // Display admin name in navbar
    const headerName = document.getElementById('adminHeaderFullName');
    if (headerName) headerName.innerText = currentUser.fullName;

    // Instantiate CRUD modal
    const crudModalEl = document.getElementById('exerciseCrudModal');
    if (crudModalEl) this.crudModal = new bootstrap.Modal(crudModalEl);

    // Initial Theme Toggler
    const btnThemeToggle = document.getElementById('btnThemeToggle');
    if (btnThemeToggle) {
      btnThemeToggle.addEventListener('click', () => UTILS.toggleTheme());
    }

    // Bind Forms
    const formExerciseCrud = document.getElementById('formExerciseCrud');
    if (formExerciseCrud) {
      formExerciseCrud.addEventListener('submit', (e) => this.handleSaveExercise(e));
    }

    // Bind Student Lookup Search Bar
    const searchStudentInput = document.getElementById('searchStudentInput');
    if (searchStudentInput) {
      searchStudentInput.addEventListener('input', (e) => {
        this.renderStudentsList(e.target.value.trim());
      });
    }

    // Fetch lists from database
    await this.fetchExercises();
    await this.fetchStudents();
  },

  /**
   * Load master exercises list from MockAPI
   */
  async fetchExercises() {
    UTILS.showSpinner();
    try {
      this.exercises = await API.getExercises();
      this.renderTable();
    } catch (error) {
      UTILS.showToast('Không thể tải danh mục bài tập mẫu từ máy chủ!', 'danger');
    } finally {
      UTILS.hideSpinner();
    }
  },

  /**
   * Fetch all registered accounts (students & admins)
   */
  async fetchStudents() {
    try {
      const users = await API.getUsers();
      // Store all registered users to allow admin to manage all account permissions
      this.students = users;
      this.renderStudentsList();
      
      // If a user was previously selected, reload their fresh profile data
      if (this.selectedStudent) {
        const freshSelected = this.students.find(s => s.id === this.selectedStudent.id);
        if (freshSelected) {
          this.selectedStudent = freshSelected;
          
          // Re-trigger selectStudent to sync panels
          this.selectStudent(freshSelected.id);
        }
      }
    } catch (error) {
      console.error('Failed to load accounts list:', error);
      UTILS.showToast('Không thể tải danh sách tài khoản từ hệ thống!', 'danger');
    }
  },

  /**
   * Render master list grid rows (Exercises CRUD)
   */
  renderTable() {
    const tbody = document.getElementById('adminExercisesTableBody');
    if (!tbody) return;

    if (this.exercises.length === 0) {
      tbody.innerHTML = `
        <tr>
          <td colspan="6" class="text-center py-4 text-body-secondary">
            <i class="bi bi-inbox fs-3 d-block mb-2 text-muted"></i> Danh sách bài tập mẫu rỗng.
          </td>
        </tr>
      `;
      return;
    }

    tbody.innerHTML = '';
    
    this.exercises.forEach(ex => {
      const tr = document.createElement('tr');
      tr.innerHTML = `
        <td class="fw-semibold text-muted">#${ex.id}</td>
        <td>
          <div class="fw-bold text-primary">${ex.exerciseName}</div>
        </td>
        <td><span class="badge bg-primary bg-opacity-10 text-primary border border-primary border-opacity-10">${ex.muscleGroup}</span></td>
        <td class="fw-bold text-danger"><i class="bi bi-fire me-1"></i>${ex.caloriesPerMinute} kcal/phút</td>
        <td class="d-none d-lg-table-cell text-body-secondary small text-truncate" style="max-width: 320px;" title="${ex.description || ''}">${ex.description || '<span class="text-muted italic">Chưa có mô tả</span>'}</td>
        <td class="text-center">
          <div class="d-flex gap-2 justify-content-center">
            <button class="btn btn-sm btn-outline-primary border-primary-subtle px-2.5 rounded-3" onclick="FitTrackAdmin.openEditModal('${ex.id}')" title="Sửa bài tập">
              <i class="bi bi-pencil-square"></i>
            </button>
            <button class="btn btn-sm btn-outline-danger border-danger-subtle px-2.5 rounded-3" onclick="FitTrackAdmin.handleDeleteExercise('${ex.id}')" title="Xóa bài tập">
              <i class="bi bi-trash3-fill"></i>
            </button>
          </div>
        </td>
      `;
      tbody.appendChild(tr);
    });
  },

  // ==========================================
  // STUDENT & ROLE MANAGEMENT WORKSPACE
  // ==========================================

  /**
   * Render left column student & admin card lists
   */
  renderStudentsList(filterQuery = '') {
    const listContainer = document.getElementById('adminStudentsList');
    if (!listContainer) return;

    const filtered = this.students.filter(s => {
      const query = filterQuery.toLowerCase();
      return s.fullName.toLowerCase().includes(query) || s.username.toLowerCase().includes(query);
    });

    const badge = document.getElementById('studentCountBadge');
    if (badge) badge.innerText = filtered.length;

    if (filtered.length === 0) {
      listContainer.innerHTML = `
        <div class="text-center text-muted py-4 small">
          <i class="bi bi-person-exclamation fs-4 d-block mb-2 text-warning"></i> Không tìm thấy tài khoản phù hợp
        </div>
      `;
      return;
    }

    listContainer.innerHTML = '';
    filtered.forEach(s => {
      const totalSessions = s.workouts ? s.workouts.length : 0;
      const isSelected = this.selectedStudent && this.selectedStudent.id === s.id;
      
      // Visual indicators for role
      const roleMarker = s.role === 'admin' 
        ? `<span class="badge bg-info text-white ms-2" style="font-size: 0.65rem;">Admin</span>`
        : `<span class="badge bg-secondary bg-opacity-10 text-secondary border border-secondary border-opacity-10 ms-2" style="font-size: 0.65rem;">Học viên</span>`;

      const itemBtn = document.createElement('button');
      itemBtn.type = 'button';
      itemBtn.className = `list-group-item list-group-item-action border border-secondary-subtle rounded-3 p-3 text-start mb-2 ${isSelected ? 'active border-primary bg-primary bg-opacity-10 text-white' : 'glass-card'}`;
      itemBtn.style.transition = 'var(--transition-smooth)';
      
      itemBtn.innerHTML = `
        <div class="d-flex justify-content-between align-items-center">
          <div class="fw-bold ${isSelected ? 'text-primary' : ''}">${s.fullName} ${roleMarker}</div>
          <span class="badge ${isSelected ? 'bg-primary text-white' : 'bg-secondary bg-opacity-10 text-secondary'} rounded-pill small">${totalSessions} buổi</span>
        </div>
        <div class="small text-muted mt-1">@${s.username}</div>
      `;
      
      itemBtn.addEventListener('click', () => this.selectStudent(s.id));
      listContainer.appendChild(itemBtn);
    });
  },

  /**
   * Load account and expose permission & workouts details panel
   */
  selectStudent(studentId) {
    const student = this.students.find(s => s.id === studentId);
    if (!student) return;

    this.selectedStudent = student;
    
    // Toggle containers visibility
    document.getElementById('noStudentSelectedMsg').classList.add('d-none');
    
    const workspace = document.getElementById('studentDetailsWorkspace');
    workspace.classList.remove('d-none');

    // Fill details header
    document.getElementById('selectedStudentName').innerText = student.fullName;
    document.getElementById('selectedStudentUsername').innerText = student.username;

    // Fill current role badge
    const roleBadge = document.getElementById('selectedUserRoleBadge');
    if (roleBadge) {
      if (student.role === 'admin') {
        roleBadge.innerText = 'Quản trị viên (Admin)';
        roleBadge.className = 'badge bg-info text-white fw-bold fs-7 mt-1';
      } else {
        roleBadge.innerText = 'Học viên (Student)';
        roleBadge.className = 'badge bg-primary text-white fw-bold fs-7 mt-1';
      }
    }

    // Generate dynamic Promote/Demote privilege controls
    const roleActionContainer = document.getElementById('roleActionContainer');
    if (roleActionContainer) {
      if (student.id === this.adminUser.id) {
        // Self Demotion Protection
        roleActionContainer.innerHTML = `
          <button class="btn btn-sm btn-outline-secondary px-3 py-2 rounded-3 fw-semibold" disabled title="Bạn không thể tự thu hồi quyền quản trị của bản thân!">
            <i class="bi bi-shield-slash me-1"></i> Tự khóa quyền (Bị cấm)
          </button>
        `;
      } else if (student.role === 'admin') {
        // Demote other admins
        roleActionContainer.innerHTML = `
          <button class="btn btn-sm btn-outline-danger border-danger-subtle px-3 py-2 rounded-3 fw-semibold" onclick="FitTrackAdmin.toggleUserRole('${student.id}', 'student')">
            <i class="bi bi-shield-slash-fill me-1"></i> Thu hồi quyền Admin
          </button>
        `;
      } else {
        // Promote standard student
        roleActionContainer.innerHTML = `
          <button class="btn btn-sm btn-indigo px-3 py-2 rounded-3 fw-semibold" onclick="FitTrackAdmin.toggleUserRole('${student.id}', 'admin')">
            <i class="bi bi-shield-lock-fill me-1"></i> Cấp quyền Admin
          </button>
        `;
      }
    }

    // Toggle workouts log tables vs info alerts dynamically
    const workoutsWorkspace = document.getElementById('workoutsLogWorkspace');
    const adminAlertPlaceholder = document.getElementById('adminUserAlertPlaceholder');
    const pkgPanel = document.getElementById('packageControlPanel');

    if (student.role === 'admin') {
      workoutsWorkspace.classList.add('d-none');
      adminAlertPlaceholder.classList.remove('d-none');
      if (pkgPanel) pkgPanel.classList.add('d-none');
    } else {
      workoutsWorkspace.classList.remove('d-none');
      adminAlertPlaceholder.classList.add('d-none');
      
      // Show and populate package control panel for students
      if (pkgPanel) {
        pkgPanel.classList.remove('d-none');
        
        const activePkg = student.activePackage || 'Starter';
        const reqPkg = student.requestedPackage;
        const reqStatus = student.packageStatus;

        // Prefill manual override dropdown
        const directSelect = document.getElementById('adminDirectPackageSelect');
        if (directSelect) directSelect.value = activePkg;

        const packageStatusContainer = document.getElementById('packageStatusContainer');
        const packageActionContainer = document.getElementById('packageActionContainer');

        if (reqPkg && reqStatus === 'Chờ duyệt') {
          packageStatusContainer.innerHTML = `
            <span class="badge bg-warning bg-opacity-10 text-warning border border-warning border-opacity-25 py-1.5 px-2.5">
              <i class="bi bi-hourglass-split me-1"></i>Yêu cầu: Gói ${reqPkg}
            </span>
            <div class="small text-muted mt-1">Gói hiện tại: ${activePkg}</div>
          `;

          packageActionContainer.innerHTML = `
            <div class="d-flex gap-2 justify-content-sm-end">
              <button class="btn btn-sm btn-outline-danger px-2.5 py-1.5 rounded-3 fw-semibold" onclick="FitTrackAdmin.handleRejectPackage('${student.id}')">
                Từ chối
              </button>
              <button class="btn btn-sm btn-outline-success px-3 py-1.5 rounded-3 fw-semibold" onclick="FitTrackAdmin.handleApprovePackage('${student.id}')">
                Duyệt gói ${reqPkg}
              </button>
            </div>
          `;
        } else {
          packageStatusContainer.innerHTML = `
            <span class="badge bg-success bg-opacity-10 text-success border border-success border-opacity-25 py-1.5 px-2.5">
              <i class="bi bi-patch-check-fill me-1"></i>Gói đang dùng: Gói ${activePkg}
            </span>
          `;

          if (activePkg !== 'Starter') {
            packageActionContainer.innerHTML = `
              <button class="btn btn-sm btn-outline-danger px-3 py-1.5 rounded-3 fw-semibold" onclick="FitTrackAdmin.handleCancelPackage('${student.id}')">
                Hủy gói dịch vụ
              </button>
            `;
          } else {
            packageActionContainer.innerHTML = `
              <span class="small text-muted italic">Sử dụng gói miễn phí</span>
            `;
          }
        }
      }
      
      this.renderStudentWorkouts();
    }
  },

  /**
   * Promote or demote user accounts role
   */
  async toggleUserRole(userId, newRole) {
    const user = this.students.find(s => s.id === userId);
    if (!user) return;

    if (userId === this.adminUser.id) {
      UTILS.showToast('Bạn không thể tự thay đổi phân quyền của chính mình!', 'warning');
      return;
    }

    const roleName = newRole === 'admin' ? 'Quản trị viên' : 'Học viên';
    if (!confirm(`Bạn có chắc chắn muốn chuyển đổi tài khoản @${user.username} thành [${roleName}] không?`)) {
      return;
    }

    user.role = newRole;

    UTILS.showSpinner();
    try {
      // Sync role change to MockAPI using PUT
      const result = await API.updateUserWorkings(userId, user);
      
      UTILS.showToast(`Đã thay đổi quyền tài khoản @${user.username} thành công!`, 'success');
      
      // Reload database values
      await this.fetchStudents();

      // Focus back on this student
      this.selectStudent(userId);
    } catch (error) {
      console.error(error);
      UTILS.showToast('Gặp lỗi khi lưu phân quyền mới lên MockAPI!', 'danger');
    } finally {
      UTILS.hideSpinner();
    }
  },

  /**
   * Draw selected student's logged workouts grid
   */
  renderStudentWorkouts() {
    const tbody = document.getElementById('adminStudentWorkoutsTableBody');
    if (!tbody) return;

    const workouts = this.selectedStudent.workouts || [];
    
    // Sync totals header
    document.getElementById('selectedStudentStats').innerText = `${workouts.length} buổi tập đã ghi nhận`;

    if (workouts.length === 0) {
      tbody.innerHTML = `
        <tr>
          <td colspan="6" class="text-center py-5 text-body-secondary">
            <i class="bi bi-journal-x fs-3 d-block mb-2 text-muted"></i> Học viên này chưa có nhật ký buổi tập nào trên MockAPI.
          </td>
        </tr>
      `;
      return;
    }

    // Sort workouts by date descending
    const sortedWorkouts = [...workouts].sort((a, b) => new Date(b.date) - new Date(a.date));

    tbody.innerHTML = '';
    sortedWorkouts.forEach(w => {
      // Date parsing
      const dateObj = new Date(w.date);
      const formattedDate = isNaN(dateObj.getTime()) ? w.date : `${dateObj.getDate().toString().padStart(2, '0')}/${(dateObj.getMonth() + 1).toString().padStart(2, '0')}/${dateObj.getFullYear()}`;

      // Status visual badges
      const statusBadge = w.status === 'Đã duyệt'
        ? `<span class="badge bg-success bg-opacity-10 text-success border border-success border-opacity-25 py-1.5 px-2.5"><i class="bi bi-patch-check-fill me-1"></i>Đã duyệt</span>`
        : `<span class="badge bg-warning bg-opacity-10 text-warning border border-warning border-opacity-25 py-1.5 px-2.5"><i class="bi bi-hourglass-split me-1"></i>Chờ duyệt</span>`;

      // Status approval toggles
      let actionBtn = '';
      if (w.status === 'Đã duyệt') {
        actionBtn = `
          <button class="btn btn-sm btn-outline-warning border-warning-subtle w-100 rounded-3 text-warning py-1.5 fw-semibold" onclick="FitTrackAdmin.toggleWorkoutStatus('${w.workoutId}', 'Chờ duyệt')">
            <i class="bi bi-arrow-counterclockwise me-1"></i> Hủy duyệt
          </button>
        `;
      } else {
        actionBtn = `
          <button class="btn btn-sm btn-indigo w-100 rounded-3 py-1.5 text-white fw-semibold" onclick="FitTrackAdmin.toggleWorkoutStatus('${w.workoutId}', 'Đã duyệt')">
            <i class="bi bi-patch-check-fill me-1"></i> Duyệt buổi
          </button>
        `;
      }

      const tr = document.createElement('tr');
      tr.innerHTML = `
        <td class="fw-semibold">${formattedDate}</td>
        <td>
          <div class="fw-bold text-success">${w.exerciseName}</div>
        </td>
        <td><i class="bi bi-stopwatch text-info me-1"></i>${w.duration} phút</td>
        <td class="fw-bold text-danger"><i class="bi bi-fire me-1"></i>${w.totalCalories} kcal</td>
        <td>${statusBadge}</td>
        <td class="text-center">${actionBtn}</td>
      `;
      tbody.appendChild(tr);
    });
  },

  /**
   * Switch the workout's approval state and PUT synchronize back to user
   */
  async toggleWorkoutStatus(workoutId, newStatus) {
    if (!this.selectedStudent) return;

    // Find matching session inside selected student's nested array
    const wIndex = this.selectedStudent.workouts.findIndex(w => w.workoutId === workoutId);
    if (wIndex === -1) {
      UTILS.showToast('Không tìm thấy buổi tập tương ứng!', 'danger');
      return;
    }

    // Toggle status locally
    this.selectedStudent.workouts[wIndex].status = newStatus;

    UTILS.showSpinner();
    try {
      // Overwrite the student profile with updated array via PUT
      await API.updateUserWorkings(this.selectedStudent.id, this.selectedStudent);
      
      UTILS.showToast(newStatus === 'Đã duyệt' ? 'Đã phê duyệt trạng thái buổi tập!' : 'Đã rút lại phê duyệt!', 'success');
      
      // Reload database values
      await this.fetchStudents();
    } catch (error) {
      UTILS.showToast('Gặp lỗi khi lưu trạng thái phê duyệt lên MockAPI!', 'danger');
    } finally {
      UTILS.hideSpinner();
    }
  },

  // ==========================================
  // MASTER EXERCISE CRUD CONTROLLERS
  // ==========================================

  openAddModal() {
    // Reset form inputs
    document.getElementById('formExerciseCrud').reset();
    document.getElementById('crudExerciseId').value = '';
    
    // Set text headers
    document.getElementById('exerciseCrudModalLabel').innerHTML = '<i class="bi bi-plus-circle text-primary me-2"></i>Thêm bài tập mẫu mới';
    
    this.crudModal.show();
  },

  openEditModal(id) {
    const exercise = this.exercises.find(ex => ex.id === id);
    if (!exercise) {
      UTILS.showToast('Không tìm thấy thông tin bài tập mẫu này!', 'danger');
      return;
    }

    // Populate inputs
    document.getElementById('crudExerciseId').value = exercise.id;
    document.getElementById('crudExerciseName').value = exercise.exerciseName;
    document.getElementById('crudMuscleGroup').value = exercise.muscleGroup;
    document.getElementById('crudCaloriesPerMinute').value = exercise.caloriesPerMinute;
    document.getElementById('crudDescription').value = exercise.description || '';

    // Set text headers
    document.getElementById('exerciseCrudModalLabel').innerHTML = '<i class="bi bi-pencil-square text-primary me-2"></i>Chỉnh sửa bài tập mẫu';

    this.crudModal.show();
  },

  async handleSaveExercise(e) {
    e.preventDefault();

    const id = document.getElementById('crudExerciseId').value;
    const exerciseName = document.getElementById('crudExerciseName').value.trim();
    const muscleGroup = document.getElementById('crudMuscleGroup').value.trim();
    const caloriesPerMinute = parseInt(document.getElementById('crudCaloriesPerMinute').value) || 0;
    const description = document.getElementById('crudDescription').value.trim();

    if (!exerciseName || !muscleGroup || caloriesPerMinute <= 0) {
      UTILS.showToast('Vui lòng nhập đầy đủ và hợp lệ các trường thông tin!', 'warning');
      return;
    }

    const payload = {
      exerciseName,
      muscleGroup,
      caloriesPerMinute,
      description
    };

    UTILS.showSpinner();
    try {
      if (id) {
        // Edit Mode
        await API.updateExercise(id, payload);
        UTILS.showToast(`Đã cập nhật bài tập "${exerciseName}" thành công!`, 'success');
      } else {
        // Add Mode
        await API.addExercise(payload);
        UTILS.showToast(`Đã thêm bài tập mẫu "${exerciseName}" thành công!`, 'success');
      }

      this.crudModal.hide();
      document.getElementById('formExerciseCrud').reset();

      // Refresh master grid
      await this.fetchExercises();
    } catch (error) {
      UTILS.showToast('Không thể lưu dữ liệu lên máy chủ MockAPI!', 'danger');
    } finally {
      UTILS.hideSpinner();
    }
  },

  async handleDeleteExercise(id) {
    const exercise = this.exercises.find(ex => ex.id === id);
    if (!exercise) return;

    if (!confirm(`Bạn có chắc chắn muốn xóa bài tập mẫu "${exercise.exerciseName}" khỏi danh mục hệ thống? Người tập sẽ không thể chọn môn này nữa.`)) {
      return;
    }

    UTILS.showSpinner();
    try {
      await API.deleteExercise(id);
      UTILS.showToast(`Đã xóa bài tập "${exercise.exerciseName}" thành công!`, 'success');
      
      // Refresh master list
      await this.fetchExercises();
    } catch (error) {
      UTILS.showToast('Không thể xóa bài tập mẫu trên MockAPI!', 'danger');
    } finally {
      UTILS.hideSpinner();
    }
  },

  async handleApprovePackage(userId) {
    const student = this.students.find(s => s.id === userId);
    if (!student) return;

    const requested = student.requestedPackage;
    if (!requested) return;

    if (!confirm(`Bạn có chắc chắn phê duyệt đăng ký gói [${requested}] cho học viên ${student.fullName} không?`)) {
      return;
    }

    student.activePackage = requested;
    student.requestedPackage = null;
    student.packageStatus = null;

    UTILS.showSpinner();
    try {
      await API.updateUserWorkings(userId, student);
      UTILS.showToast(`Đã phê duyệt gói tập ${requested} cho học viên ${student.fullName} thành công!`, 'success');
      
      // Reload lists and re-select
      await this.fetchStudents();
      this.selectStudent(userId);
    } catch (error) {
      console.error(error);
      UTILS.showToast('Gặp lỗi khi phê duyệt gói tập trên MockAPI!', 'danger');
    } finally {
      UTILS.hideSpinner();
    }
  },

  async handleRejectPackage(userId) {
    const student = this.students.find(s => s.id === userId);
    if (!student) return;

    const requested = student.requestedPackage;
    if (!requested) return;

    if (!confirm(`Bạn có chắc chắn từ chối yêu cầu đăng ký gói [${requested}] của học viên ${student.fullName} không?`)) {
      return;
    }

    student.requestedPackage = null;
    student.packageStatus = null;

    UTILS.showSpinner();
    try {
      await API.updateUserWorkings(userId, student);
      UTILS.showToast('Đã từ chối yêu cầu đăng ký gói tập thành công!', 'info');
      
      // Reload lists and re-select
      await this.fetchStudents();
      this.selectStudent(userId);
    } catch (error) {
      console.error(error);
      UTILS.showToast('Gặp lỗi khi cập nhật trạng thái từ chối trên MockAPI!', 'danger');
    } finally {
      UTILS.hideSpinner();
    }
  },

  async handleCancelPackage(userId) {
    const student = this.students.find(s => s.id === userId);
    if (!student) return;

    const currentPkg = student.activePackage;
    if (!currentPkg || currentPkg === 'Starter') return;

    if (!confirm(`Bạn có chắc chắn muốn hủy gói dịch vụ [${currentPkg}] của học viên ${student.fullName} và chuyển về gói mặc định Starter không?`)) {
      return;
    }

    student.activePackage = 'Starter';
    student.requestedPackage = null;
    student.packageStatus = null;

    UTILS.showSpinner();
    try {
      await API.updateUserWorkings(userId, student);
      UTILS.showToast(`Đã hủy gói dịch vụ thành công, học viên ${student.fullName} đã chuyển về gói Starter.`, 'success');
      
      // Reload lists and re-select
      await this.fetchStudents();
      this.selectStudent(userId);
    } catch (error) {
      console.error(error);
      UTILS.showToast('Gặp lỗi khi hủy gói dịch vụ trên MockAPI!', 'danger');
    } finally {
      UTILS.hideSpinner();
    }
  },

  async handleAdminChangePackage() {
    if (!this.selectedStudent) return;

    const select = document.getElementById('adminDirectPackageSelect');
    if (!select) return;
    
    const selectedPkg = select.value;
    const currentActivePkg = this.selectedStudent.activePackage || 'Starter';

    if (currentActivePkg === selectedPkg) {
      UTILS.showToast(`Học viên đang sử dụng gói ${selectedPkg} rồi!`, 'info');
      return;
    }

    if (!confirm(`Bạn có chắc chắn muốn thay đổi trực tiếp gói dịch vụ của học viên ${this.selectedStudent.fullName} sang [${selectedPkg}] không?`)) {
      return;
    }

    this.selectedStudent.activePackage = selectedPkg;
    // Clear any pending requested package because admin directly changed it
    this.selectedStudent.requestedPackage = null;
    this.selectedStudent.packageStatus = null;

    UTILS.showSpinner();
    try {
      await API.updateUserWorkings(this.selectedStudent.id, this.selectedStudent);
      UTILS.showToast(`Đã trực tiếp thay đổi gói dịch vụ sang ${selectedPkg} thành công!`, 'success');
      
      // Refresh students and re-select
      await this.fetchStudents();
      this.selectStudent(this.selectedStudent.id);
    } catch (error) {
      console.error(error);
      UTILS.showToast('Gặp lỗi khi trực tiếp thay đổi gói tập trên MockAPI!', 'danger');
    } finally {
      UTILS.hideSpinner();
    }
  }
};

// Expose admin context globally for action buttons
window.FitTrackAdmin = FitTrackAdmin;
