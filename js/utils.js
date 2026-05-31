/**
 * Project: FitTrack - Developed by Nhom 9
 */

const UTILS = {
  // ==========================================
  // SPINNER CONTROL (#globalSpinner)
  // ==========================================
  showSpinner() {
    const spinner = document.getElementById('globalSpinner');
    if (spinner) {
      spinner.classList.remove('d-none');
      spinner.classList.add('d-flex');
    }
  },

  hideSpinner() {
    const spinner = document.getElementById('globalSpinner');
    if (spinner) {
      spinner.classList.add('d-none');
      spinner.classList.remove('d-flex');
    }
  },

  // ==========================================
  // SESSION PERSISTENCE
  // ==========================================
  setCurrentUser(user) {
    localStorage.setItem('fittrack_user', JSON.stringify(user));
  },

  getCurrentUser() {
    const data = localStorage.getItem('fittrack_user');
    if (!data) return null;
    try {
      return JSON.parse(data);
    } catch (e) {
      console.error('Session parse failed:', e);
      return null;
    }
  },

  clearSession() {
    localStorage.removeItem('fittrack_user');
  },

  // ==========================================
  // THEME MANAGEMENT (DARK / LIGHT)
  // ==========================================
  initTheme() {
    const savedTheme = localStorage.getItem('fittrack_theme') || 'dark'; // Default to dark for rich modern look
    this.setTheme(savedTheme);
  },

  setTheme(theme) {
    document.documentElement.setAttribute('data-bs-theme', theme);
    localStorage.setItem('fittrack_theme', theme);
    
    // Toggle active classes on any theme toggle elements if they exist
    const themeIcon = document.getElementById('themeIcon');
    if (themeIcon) {
      if (theme === 'dark') {
        themeIcon.className = 'bi bi-moon-stars-fill text-warning';
      } else {
        themeIcon.className = 'bi bi-sun-fill text-warning';
      }
    }
  },

  toggleTheme() {
    const currentTheme = document.documentElement.getAttribute('data-bs-theme') || 'dark';
    const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
    this.setTheme(newTheme);
    this.showToast(`Đã chuyển sang giao diện ${newTheme === 'dark' ? 'Tối' : 'Sáng'}!`, 'success');
  },

  // ==========================================
  // PREMIUM CUSTOM TOAST NOTIFICATION
  // ==========================================
  /**
   * Display a clean, elegant floating alert toast
   * @param {string} message - Text to show
   * @param {'success'|'danger'|'warning'|'info'} type - Toast flavor
   */
  showToast(message, type = 'success') {
    let container = document.getElementById('toastContainer');
    if (!container) {
      container = document.createElement('div');
      container.id = 'toastContainer';
      container.style.position = 'fixed';
      container.style.bottom = '24px';
      container.style.right = '24px';
      container.style.zIndex = '9999';
      container.style.display = 'flex';
      container.style.flexDirection = 'column';
      container.style.gap = '12px';
      document.body.appendChild(container);
    }

    const toast = document.createElement('div');
    toast.className = `custom-toast border-0 rounded-3 shadow-lg p-3 d-flex align-items-center animate-slide-in`;
    
    // Theme colors based on HSL spec
    let bg = '#198754';
    let icon = 'bi-check-circle-fill';
    if (type === 'danger') {
      bg = '#dc3545';
      icon = 'bi-exclamation-octagon-fill';
    } else if (type === 'warning') {
      bg = '#ffc107';
      icon = 'bi-exclamation-triangle-fill';
    } else if (type === 'info') {
      bg = '#0dcaf0';
      icon = 'bi-info-circle-fill';
    }

    toast.style.background = bg;
    toast.style.color = type === 'warning' ? '#111' : '#fff';
    toast.style.minWidth = '280px';
    toast.style.maxWidth = '360px';
    toast.style.transition = 'all 0.4s ease';

    toast.innerHTML = `
      <i class="bi ${icon} me-3 fs-5"></i>
      <div class="flex-grow-1 fw-semibold">${message}</div>
      <button type="button" class="btn-close ${type === 'warning' ? '' : 'btn-close-white'} ms-2" style="font-size: 0.75rem;" aria-label="Close"></button>
    `;

    container.appendChild(toast);

    // Dismiss hook
    const dismiss = () => {
      toast.style.opacity = '0';
      toast.style.transform = 'translateY(15px)';
      setTimeout(() => toast.remove(), 400);
    };

    toast.querySelector('.btn-close').addEventListener('click', dismiss);

    // Auto dismiss after 4 seconds
    setTimeout(dismiss, 4000);
  }
};

// Export to window
window.UTILS = UTILS;

// Run initial theme check
document.addEventListener('DOMContentLoaded', () => {
  UTILS.initTheme();
});
