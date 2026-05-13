const workoutAPI = new APIResource("workouts");
const memberAPI = new APIResource("members");

function formatDate(value) {
  if (!value) return "-";
  const date = new Date(value);
  return date.toLocaleDateString("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
}

function formatDuration(value) {
  return `${value} phút`;
}

function formatCalories(value) {
  return `${value} kcal`;
}

function generateId() {
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
}

function setText(id, value) {
  const element = document.getElementById(id);
  if (element) element.textContent = value;
}

let searchTerm = "";

function getFavoriteType(workouts) {
  const count = workouts.reduce((acc, workout) => {
    acc[workout.type] = (acc[workout.type] || 0) + 1;
    return acc;
  }, {});
  const sorted = Object.entries(count).sort((a, b) => b[1] - a[1]);
  return sorted.length ? sorted[0][0] : "-";
}

function countCurrentMonth(workouts) {
  const current = new Date();
  return workouts.filter((workout) => {
    const date = new Date(workout.date);
    return (
      date.getFullYear() === current.getFullYear() &&
      date.getMonth() === current.getMonth()
    );
  }).length;
}

async function renderWorkoutSummary() {
  const workouts = await workoutAPI.layDanhSach();
  setText("totalWorkouts", workouts.length);
  setText(
    "totalDuration",
    workouts.reduce((sum, workout) => sum + Number(workout.duration || 0), 0),
  );
  setText(
    "totalCalories",
    workouts.reduce((sum, workout) => sum + Number(workout.calories || 0), 0),
  );
  setText("favoriteType", getFavoriteType(workouts));
  setText("monthlyWorkouts", countCurrentMonth(workouts));
  setText(
    "todayLabel",
    new Date().toLocaleDateString("vi-VN", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    }),
  );
}

function renderWorkoutItem(workout) {
  return `
    <div class="list-item">
      <h3>${formatDate(workout.date)} — ${workout.type}</h3>
      <div class="item-meta">
        <span class="badge">${formatDuration(workout.duration)}</span>
        <span class="badge">${formatCalories(workout.calories)}</span>
      </div>
      <p>${workout.notes || "Không có ghi chú"}</p>
    </div>
  `;
}

async function renderWorkoutList() {
  const workouts = await workoutAPI.layDanhSach();
  const listElement = document.getElementById("workoutList");
  if (!listElement) return;

  const filteredWorkouts = searchTerm
    ? workouts.filter(
        (workout) =>
          workout.type.toLowerCase().includes(searchTerm.toLowerCase()) ||
          (workout.notes &&
            workout.notes.toLowerCase().includes(searchTerm.toLowerCase())),
      )
    : workouts;

  listElement.innerHTML = filteredWorkouts.length
    ? filteredWorkouts.map(renderWorkoutItem).join("")
    : searchTerm
      ? '<p class="empty-state">Không tìm thấy buổi tập nào phù hợp với từ khóa tìm kiếm.</p>'
      : '<p class="empty-state">Chưa có buổi tập nào. Hãy thêm buổi tập đầu tiên!</p>';
}

async function handleFormSubmit(event) {
  event.preventDefault();
  const date = document.getElementById("date").value;
  const type = document.getElementById("type").value;
  const duration = document.getElementById("duration").value;
  const calories = document.getElementById("calories").value;
  const notes = document.getElementById("notes").value.trim();

  if (!date || !type || !duration || !calories) return;

  await workoutAPI.themMoi({
    date,
    type,
    duration: Number(duration),
    calories: Number(calories),
    notes,
  });

  event.target.reset();
  await renderWorkoutSummary();
  await renderWorkoutList();
}

function getQueryParam(name) {
  const params = new URLSearchParams(window.location.search);
  return params.get(name) || "";
}

async function initApp() {
  const form = document.getElementById("workoutForm");
  if (form) {
    form.addEventListener("submit", handleFormSubmit);
  }

  const searchInput = document.getElementById("searchInput");
  if (searchInput) {
    searchInput.addEventListener("input", (event) => {
      searchTerm = event.target.value.trim();
      renderWorkoutList();
    });
  }

  const searchButton = document.getElementById("searchButton");
  if (searchButton) {
    searchButton.addEventListener("click", () => renderWorkoutList());
  }

  const searchHomeInput = document.getElementById("searchHomeInput");
  const searchHomeButton = document.getElementById("searchHomeButton");
  if (searchHomeButton && searchHomeInput) {
    searchHomeButton.addEventListener("click", () => {
      const query = searchHomeInput.value.trim();
      if (query) {
        searchTerm = query;
        const searchInput = document.getElementById("searchInput");
        if (searchInput) {
          searchInput.value = query;
        }
        renderWorkoutList();
      }
    });
  }

  const initialSearch = getQueryParam("search");
  if (initialSearch) {
    searchTerm = initialSearch;
    if (searchInput) {
      searchInput.value = searchTerm;
    }
  }

  await renderWorkoutSummary();
  await renderWorkoutList();
}

async function handleSignup(event) {
  event.preventDefault();
  const name = document.getElementById("memberName").value.trim();
  const email = document.getElementById("memberEmail").value.trim();
  const phone = document.getElementById("memberPhone").value.trim();
  const password = document.getElementById("memberPassword").value;
  const confirmPassword = document.getElementById("memberConfirmPassword").value;
  const plan = document.getElementById("memberPlan").value;
  const notes = document.getElementById("memberNotes").value.trim();
  const messageElement = document.getElementById("signupMessage");

  if (!name || !email || !phone || !password || !confirmPassword) {
  if (messageElement) {
    messageElement.textContent =
      "Vui lòng điền đầy đủ thông tin bắt buộc.";
    messageElement.style.color = "#dc2626";
  }
  return;
}

if (password.length < 6) {
  messageElement.textContent =
    "Mật khẩu phải có ít nhất 6 ký tự.";
  messageElement.style.color = "#dc2626";
  return;
}

if (password !== confirmPassword) {
  messageElement.textContent =
    "Mật khẩu xác nhận không khớp.";
  messageElement.style.color = "#dc2626";
  return;
}

await memberAPI.themMoi({
  name,
  email,
  phone,
  password,
  plan,
  notes,
});

  if (messageElement) {
    messageElement.textContent = "Cảm ơn! Bạn đã đăng ký hội viên thành công.";
    messageElement.style.color = "#047857";
  }

  event.target.reset();
}

function initSignup() {
  const form = document.getElementById("signupForm");
  if (form) {
    form.addEventListener("submit", handleSignup);
  }
}

initSignup();
initApp();
