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
      this.renderModuleOverview();
      this.renderAdminOverview();
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
      this.renderAdminOverview();
      this.renderServiceManagement();
      this.renderModuleOverview();
      
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

  formatDateTime(value) {
    if (!value) return 'Chưa có thời gian';
    const date = new Date(value);
    if (isNaN(date.getTime())) return value;
    return date.toLocaleString('vi-VN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  },

  formatMoney(value) {
    const amount = Number(value) || 0;
    return amount.toLocaleString('vi-VN') + 'đ';
  },

  getAdminMetrics() {
    const users = this.students || [];
    const students = users.filter(user => user.role !== 'admin');
    const admins = users.filter(user => user.role === 'admin');

    const workouts = users.flatMap(user =>
      (user.workouts || []).map(workout => ({ user, workout }))
    );
    const pendingWorkouts = workouts.filter(row => row.workout.status !== 'Đã duyệt');

    const pendingPackages = students.filter(user =>
      user.requestedPackage && user.packageStatus === 'Chờ duyệt'
    );

    const coachRequests = users.flatMap(user =>
      (user.coachRequests || []).map((request, index) => ({ user, request, index }))
    );
    const pendingCoaches = coachRequests.filter(row => row.request.status === 'Chờ duyệt');

    const payments = users.flatMap(user =>
      (user.paymentHistory || []).map(payment => ({ user, payment }))
    );
    const revenue = payments.reduce((sum, row) => sum + (Number(row.payment.amount) || 0), 0);

    return {
      users,
      students,
      admins,
      workouts,
      pendingWorkouts,
      pendingPackages,
      coachRequests,
      pendingCoaches,
      payments,
      revenue
    };
  },

  renderAdminOverview() {
    const metrics = this.getAdminMetrics();
    const setText = (id, value) => {
      const element = document.getElementById(id);
      if (element) element.innerText = value;
    };

    setText('adminTotalUsers', metrics.users.length);
    setText('adminTotalStudents', metrics.students.length);
    setText('adminTotalAdmins', metrics.admins.length);
    setText('adminTotalWorkouts', metrics.workouts.length);
    setText('adminPendingWorkouts', metrics.pendingWorkouts.length);
    setText('adminPendingPackages', metrics.pendingPackages.length);
    setText('adminPendingCoaches', metrics.pendingCoaches.length);
    setText('adminRevenueTotal', this.formatMoney(metrics.revenue));

    const recentContainer = document.getElementById('adminRecentRequests');
    if (!recentContainer) return;

    const recentItems = [
      ...metrics.pendingWorkouts.map(row => ({
        type: 'Buổi tập',
        icon: 'bi-journal-check',
        color: 'success',
        title: row.workout.exerciseName || 'Buổi tập mới',
        user: row.user.fullName,
        date: row.workout.date,
        action: `FitTrackAdmin.openStudentFromOverview('${row.user.id}')`
      })),
      ...metrics.pendingPackages.map(user => ({
        type: 'Gói tập',
        icon: 'bi-tags-fill',
        color: 'warning',
        title: `Đăng ký gói ${user.requestedPackage}`,
        user: user.fullName,
        date: user.lastPayment?.createdAt || user.updatedAt,
        action: `FitTrackAdmin.openStudentFromOverview('${user.id}')`
      })),
      ...metrics.pendingCoaches.map(row => ({
        type: 'Thuê HLV',
        icon: 'bi-person-workspace',
        color: 'info',
        title: row.request.coachName || row.request.specialty || 'Yêu cầu HLV',
        user: row.user.fullName,
        date: row.request.createdAt,
        action: `FitTrackAdmin.openServiceTab()`
      }))
    ].sort((a, b) => new Date(b.date || 0) - new Date(a.date || 0)).slice(0, 8);

    if (recentItems.length === 0) {
      recentContainer.innerHTML = `
        <div class="text-center text-body-secondary py-4">
          <i class="bi bi-check2-circle fs-1 text-success d-block mb-2"></i>
          Hiện chưa có yêu cầu nào cần xử lý.
        </div>
      `;
      return;
    }

    recentContainer.innerHTML = recentItems.map(item => `
      <button type="button" class="btn text-start border border-secondary-subtle rounded-3 p-3 bg-secondary bg-opacity-10" onclick="${item.action}">
        <div class="d-flex justify-content-between align-items-start gap-3">
          <div class="d-flex gap-3">
            <span class="badge bg-${item.color} bg-opacity-10 text-${item.color} border border-${item.color} border-opacity-25 p-2">
              <i class="bi ${item.icon}"></i>
            </span>
            <div>
              <div class="fw-bold">${item.title}</div>
              <div class="small text-body-secondary">${item.type} - ${item.user}</div>
            </div>
          </div>
          <span class="small text-muted text-nowrap">${this.formatDateTime(item.date)}</span>
        </div>
      </button>
    `).join('');
  },

  renderServiceManagement() {
    const metrics = this.getAdminMetrics();
    this.renderPackageRequests(metrics.pendingPackages);
    this.renderCoachRequests(metrics.coachRequests);
    this.renderPaymentHistory(metrics.payments);
  },

  renderPackageRequests(packageRequests) {
    const container = document.getElementById('adminPackageRequestsList');
    if (!container) return;

    if (packageRequests.length === 0) {
      container.innerHTML = `
        <div class="text-center text-body-secondary py-4">
          <i class="bi bi-tags fs-1 d-block mb-2 opacity-50"></i>
          Không có yêu cầu gói tập đang chờ.
        </div>
      `;
      return;
    }

    container.innerHTML = packageRequests.map(user => `
      <div class="border border-secondary-subtle rounded-3 p-3 bg-secondary bg-opacity-10">
        <div class="d-flex justify-content-between align-items-start gap-3 flex-wrap">
          <div>
            <div class="fw-bold">${user.fullName}</div>
            <div class="small text-body-secondary">@${user.username} muốn đăng ký gói <strong>${user.requestedPackage}</strong></div>
          </div>
          <span class="badge bg-warning bg-opacity-10 text-warning border border-warning border-opacity-25">Chờ duyệt</span>
        </div>
        <div class="d-flex gap-2 mt-3">
          <button class="btn btn-sm btn-outline-danger rounded-3 fw-semibold" onclick="FitTrackAdmin.handleRejectPackage('${user.id}')">Từ chối</button>
          <button class="btn btn-sm btn-outline-success rounded-3 fw-semibold" onclick="FitTrackAdmin.handleApprovePackage('${user.id}')">Duyệt gói</button>
        </div>
      </div>
    `).join('');
  },

  renderCoachRequests(coachRequests) {
    const container = document.getElementById('adminCoachRequestsList');
    if (!container) return;

    if (coachRequests.length === 0) {
      container.innerHTML = `
        <div class="text-center text-body-secondary py-4">
          <i class="bi bi-person-workspace fs-1 d-block mb-2 opacity-50"></i>
          Chưa có yêu cầu thuê HLV nào.
        </div>
      `;
      return;
    }

    const sorted = [...coachRequests].sort((a, b) => new Date(b.request.createdAt || 0) - new Date(a.request.createdAt || 0));
    container.innerHTML = sorted.map(row => {
      const status = row.request.status || 'Chờ duyệt';
      const statusClass = status === 'Đã duyệt' ? 'success' : status === 'Từ chối' ? 'danger' : 'warning';
      const actions = status === 'Chờ duyệt' ? `
        <div class="d-flex gap-2 mt-3">
          <button class="btn btn-sm btn-outline-danger rounded-3 fw-semibold" onclick="FitTrackAdmin.handleRejectCoachRequest('${row.user.id}', ${row.index})">Từ chối</button>
          <button class="btn btn-sm btn-outline-success rounded-3 fw-semibold" onclick="FitTrackAdmin.handleApproveCoachRequest('${row.user.id}', ${row.index})">Duyệt thuê</button>
        </div>
      ` : '';

      return `
        <div class="border border-secondary-subtle rounded-3 p-3 bg-secondary bg-opacity-10">
          <div class="d-flex justify-content-between align-items-start gap-3 flex-wrap">
            <div>
              <div class="fw-bold">${row.request.coachName || 'HLV chưa rõ tên'}</div>
              <div class="small text-body-secondary">${row.request.specialty || 'Tư vấn tập luyện'} - ${row.user.fullName}</div>
              <div class="small text-muted mt-1">${this.formatDateTime(row.request.createdAt)} | ${this.formatMoney(row.request.price)}</div>
            </div>
            <span class="badge bg-${statusClass} bg-opacity-10 text-${statusClass} border border-${statusClass} border-opacity-25">${status}</span>
          </div>
          ${actions}
        </div>
      `;
    }).join('');
  },

  renderPaymentHistory(payments) {
    const tbody = document.getElementById('adminPaymentHistoryList');
    if (!tbody) return;

    if (payments.length === 0) {
      tbody.innerHTML = `
        <tr>
          <td colspan="5" class="text-center text-body-secondary py-4">
            Chưa có giao dịch thanh toán nào.
          </td>
        </tr>
      `;
      return;
    }

    const sorted = [...payments].sort((a, b) => new Date(b.payment.createdAt || 0) - new Date(a.payment.createdAt || 0)).slice(0, 12);
    tbody.innerHTML = sorted.map(row => `
      <tr>
        <td class="small text-body-secondary">${this.formatDateTime(row.payment.createdAt)}</td>
        <td>
          <div class="fw-bold">${row.user.fullName}</div>
          <div class="small text-muted">@${row.user.username}</div>
        </td>
        <td>${row.payment.title || row.payment.packageName || row.payment.serviceName || row.payment.type || 'Dịch vụ FitTrack'}</td>
        <td><span class="badge bg-primary bg-opacity-10 text-primary border border-primary border-opacity-10">${row.payment.methodName || row.payment.method || 'Chưa rõ'}</span></td>
        <td class="text-end fw-bold text-success">${this.formatMoney(row.payment.amount)}</td>
      </tr>
    `).join('');
  },

  renderModuleOverview() {
    const container = document.getElementById('adminModuleOverview');
    if (!container) return;

    const metrics = this.getAdminMetrics();
    const modules = [
      {
        name: 'Trang chủ',
        href: 'index.html',
        icon: 'bi-house-door-fill',
        color: 'primary',
        summary: `${metrics.users.length} tài khoản đang đồng bộ MockAPI`,
        admin: 'Đăng nhập, dashboard học viên, điều hướng'
      },
      {
        name: 'Buổi tập',
        href: 'nhat-ky.html',
        icon: 'bi-journal-text',
        color: 'success',
        summary: `${metrics.pendingWorkouts.length} buổi chờ duyệt`,
        admin: 'Duyệt/xóa buổi tập trong tab Người dùng'
      },
      {
        name: 'Gói tập',
        href: 'goi-tap.html',
        icon: 'bi-tags-fill',
        color: 'warning',
        summary: `${metrics.pendingPackages.length} yêu cầu chờ duyệt`,
        admin: 'Duyệt gói trong tab Dịch vụ & Thanh toán'
      },
      {
        name: 'Thuê HLV',
        href: 'thue-hlv.html',
        icon: 'bi-person-workspace',
        color: 'info',
        summary: `${metrics.pendingCoaches.length} yêu cầu chờ duyệt`,
        admin: 'Duyệt thuê HLV và kiểm tra thanh toán'
      },
      {
        name: 'Dinh dưỡng',
        href: 'dinh-duong.html',
        icon: 'bi-egg-fried',
        color: 'success',
        summary: 'Nội dung tham khảo healthy food',
        admin: 'Kiểm tra giao diện và liên kết trang'
      },
      {
        name: 'Thanh toán',
        href: 'thanh-toan.html',
        icon: 'bi-cart-check-fill',
        color: 'primary',
        summary: `${metrics.payments.length} giao dịch đã ghi nhận`,
        admin: 'Đối chiếu lịch sử thanh toán'
      },
      {
        name: 'Hỗ trợ',
        href: 'ho-tro.html',
        icon: 'bi-headset',
        color: 'secondary',
        summary: 'Kênh hỗ trợ người tập',
        admin: 'Mở nhanh trang hỗ trợ'
      }
    ];

    container.innerHTML = modules.map(module => `
      <div class="col-md-6 col-xl-4">
        <div class="card bg-secondary bg-opacity-10 border border-secondary-subtle rounded-3 p-4 h-100">
          <div class="d-flex justify-content-between align-items-start gap-3 mb-3">
            <span class="badge bg-${module.color} bg-opacity-10 text-${module.color} border border-${module.color} border-opacity-25 p-2">
              <i class="bi ${module.icon} fs-5"></i>
            </span>
            <a class="btn btn-sm btn-outline-primary rounded-3" href="${module.href}">
              <i class="bi bi-box-arrow-up-right"></i>
            </a>
          </div>
          <h5 class="fw-bold mb-1">${module.name}</h5>
          <p class="small text-body-secondary mb-3">${module.summary}</p>
          <div class="small border-top border-secondary-subtle pt-3">
            <span class="text-muted">Admin quản lý:</span><br>
            <strong>${module.admin}</strong>
          </div>
        </div>
      </div>
    `).join('');
  },

  openStudentFromOverview(userId) {
    const studentsTab = document.getElementById('students-tab');
    if (studentsTab) bootstrap.Tab.getOrCreateInstance(studentsTab).show();
    this.selectStudent(userId);
  },

  openServiceTab() {
    const servicesTab = document.getElementById('services-tab');
    if (servicesTab) bootstrap.Tab.getOrCreateInstance(servicesTab).show();
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
    
    // Fill password field
    const passwordField = document.getElementById('selectedStudentPassword');
    if (passwordField) {
      passwordField.value = student.password || '';
      // Reset to password type when switching students
      passwordField.type = 'password';
      const toggleBtn = document.getElementById('togglePasswordBtn');
      if (toggleBtn) {
        toggleBtn.innerHTML = '<i class="bi bi-eye-fill"></i>';
      }
    }

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
            <i class="bi bi-journal-x fs-3 d-block mb-2 text-muted"></i> Học viên này chưa có buổi tập nào trên MockAPI.
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
          <button class="btn btn-sm btn-outline-warning border-warning-subtle flex-grow-1 rounded-3 text-warning py-1.5 fw-semibold" onclick="FitTrackAdmin.toggleWorkoutStatus('${w.workoutId}', 'Chờ duyệt')">
            <i class="bi bi-arrow-counterclockwise me-1"></i> Hủy duyệt
          </button>
        `;
      } else {
        actionBtn = `
          <button class="btn btn-sm btn-indigo flex-grow-1 rounded-3 py-1.5 text-white fw-semibold" onclick="FitTrackAdmin.toggleWorkoutStatus('${w.workoutId}', 'Đã duyệt')">
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
        <td class="text-center">
          <div class="d-flex gap-2 align-items-center justify-content-center">
            ${actionBtn}
            <button class="btn btn-sm btn-outline-danger border-danger-subtle px-2.5 py-1.5 rounded-3" title="Xóa vĩnh viễn buổi tập" onclick="FitTrackAdmin.handleAdminDeleteWorkout('${w.workoutId}')">
              <i class="bi bi-trash3-fill"></i>
            </button>
          </div>
        </td>
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
  },

  async handleAdminDeleteWorkout(workoutId) {
    if (!this.selectedStudent) return;

    // Find exercise name for confirmation alert
    const targetWorkout = this.selectedStudent.workouts.find(w => w.workoutId === workoutId);
    if (!targetWorkout) return;

    if (!confirm(`Bạn có chắc chắn muốn xóa vĩnh viễn buổi tập "${targetWorkout.exerciseName}" của học viên ${this.selectedStudent.fullName} không?`)) {
      return;
    }

    // Filter out the workout
    this.selectedStudent.workouts = this.selectedStudent.workouts.filter(w => w.workoutId !== workoutId);

    UTILS.showSpinner();
    try {
      // Sync workout deletion to MockAPI using PUT
      await API.updateUserWorkings(this.selectedStudent.id, this.selectedStudent);
      UTILS.showToast(`Đã xóa vĩnh viễn buổi tập "${targetWorkout.exerciseName}" của học viên thành công!`, 'success');
      
      // Reload lists and re-select
      await this.fetchStudents();
      this.selectStudent(this.selectedStudent.id);
    } catch (error) {
      console.error(error);
      UTILS.showToast('Gặp lỗi khi xóa buổi tập trên MockAPI!', 'danger');
    } finally {
      UTILS.hideSpinner();
    }
  },

  async updateCoachRequestStatus(userId, requestIndex, nextStatus) {
    const student = this.students.find(s => s.id === userId);
    if (!student || !Array.isArray(student.coachRequests) || !student.coachRequests[requestIndex]) {
      UTILS.showToast('Không tìm thấy yêu cầu thuê HLV tương ứng!', 'danger');
      return;
    }

    const request = student.coachRequests[requestIndex];
    const isApprove = nextStatus === 'Đã duyệt';
    const confirmMessage = isApprove
      ? `Bạn có chắc chắn duyệt yêu cầu thuê ${request.coachName || 'HLV'} cho học viên ${student.fullName} không?`
      : `Bạn có chắc chắn từ chối yêu cầu thuê ${request.coachName || 'HLV'} của học viên ${student.fullName} không?`;

    if (!confirm(confirmMessage)) return;

    student.coachRequests[requestIndex] = {
      ...request,
      status: nextStatus,
      reviewedAt: new Date().toISOString()
    };

    if (isApprove) {
      student.activePackage = student.activePackage === 'VIP' ? student.activePackage : 'VIP';
    }

    const stillPendingCoach = student.coachRequests.some(item => item.status === 'Chờ duyệt');
    if (!stillPendingCoach && student.requestedPackage === 'VIP' && student.packageStatus === 'Chờ duyệt') {
      student.requestedPackage = null;
      student.packageStatus = null;
    }

    UTILS.showSpinner();
    try {
      await API.updateUserWorkings(userId, student);
      UTILS.showToast(isApprove ? 'Đã duyệt yêu cầu thuê HLV thành công!' : 'Đã từ chối yêu cầu thuê HLV.', isApprove ? 'success' : 'info');
      await this.fetchStudents();
      if (this.selectedStudent && this.selectedStudent.id === userId) {
        this.selectStudent(userId);
      }
    } catch (error) {
      console.error(error);
      UTILS.showToast('Gặp lỗi khi cập nhật yêu cầu thuê HLV trên MockAPI!', 'danger');
    } finally {
      UTILS.hideSpinner();
    }
  },

  async handleApproveCoachRequest(userId, requestIndex) {
    await this.updateCoachRequestStatus(userId, requestIndex, 'Đã duyệt');
  },

  async handleRejectCoachRequest(userId, requestIndex) {
    await this.updateCoachRequestStatus(userId, requestIndex, 'Từ chối');
  },

  /**
   * Toggle password visibility (show/hide)
   */
  togglePasswordVisibility() {
    const passwordField = document.getElementById('selectedStudentPassword');
    const toggleBtn = document.getElementById('togglePasswordBtn');
    
    if (!passwordField || !toggleBtn) return;

    if (passwordField.type === 'password') {
      passwordField.type = 'text';
      toggleBtn.innerHTML = '<i class="bi bi-eye-slash-fill"></i>';
    } else {
      passwordField.type = 'password';
      toggleBtn.innerHTML = '<i class="bi bi-eye-fill"></i>';
    }
  },

  /**
   * Delete a student account permanently
   */
  async handleDeleteAccount() {
    if (!this.selectedStudent) return;

    // Prevent self-deletion
    if (this.selectedStudent.id === this.adminUser.id) {
      UTILS.showToast('Bạn không thể xóa tài khoản của chính mình!', 'warning');
      return;
    }

    if (!confirm(`Bạn muốn xóa tài khoản ${this.selectedStudent.fullName} (@${this.selectedStudent.username}) vĩnh viễn chứ?`)) {
      return;
    }

    UTILS.showSpinner();
    try {
      // Delete account from MockAPI
      await API.deleteUser(this.selectedStudent.id);
      
      UTILS.showToast(`Đã xóa vĩnh viễn tài khoản @${this.selectedStudent.username} khỏi hệ thống!`, 'success');
      
      // Reload lists
      await this.fetchStudents();
      
      // Clear selection
      this.selectedStudent = null;
      document.getElementById('noStudentSelectedMsg').classList.remove('d-none');
      document.getElementById('studentDetailsWorkspace').classList.add('d-none');
    } catch (error) {
      console.error(error);
      UTILS.showToast('Gặp lỗi khi xóa tài khoản trên MockAPI!', 'danger');
    } finally {
      UTILS.hideSpinner();
    }
  }
};

// Expose admin context globally for action buttons
window.FitTrackAdmin = FitTrackAdmin;
