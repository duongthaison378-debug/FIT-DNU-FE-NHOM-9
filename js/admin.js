const workoutAPI = new APIResource("workouts");
let currentEditId = "";

function createButton(text, className, onClick) {
  const button = document.createElement("button");
  button.type = "button";
  button.className = `btn ${className}`;
  button.textContent = text;
  button.addEventListener("click", onClick);
  return button;
}

function getFavoriteType(workouts) {
  const count = workouts.reduce((acc, workout) => {
    acc[workout.type] = (acc[workout.type] || 0) + 1;
    return acc;
  }, {});
  const sorted = Object.entries(count).sort((a, b) => b[1] - a[1]);
  return sorted.length ? sorted[0][0] : "-";
}

async function renderAdminSummary() {
  const workouts = await workoutAPI.layDanhSach();
  setText("adminTotalWorkouts", workouts.length);
  setText("adminFavoriteType", getFavoriteType(workouts));
  setText(
    "adminTotalCalories",
    `${workouts.reduce((sum, item) => sum + Number(item.calories || 0), 0)} kcal`,
  );
  setText(
    "adminLatestDate",
    workouts.length ? formatDate(workouts[0].date) : "-",
  );
}

async function renderAdminTable() {
  const workouts = await workoutAPI.layDanhSach();
  const container = document.getElementById("adminList");
  if (!container) return;

  await renderAdminSummary();

  if (!workouts.length) {
    container.innerHTML =
      "<p>Chưa có buổi tập nào. Hãy thêm buổi tập trong trang chủ.</p>";
    return;
  }

  const table = document.createElement("table");
  table.innerHTML = `
    <thead>
      <tr>
        <th>Ngày</th>
        <th>Loại</th>
        <th>Thời lượng</th>
        <th>Calories</th>
        <th>Ghi chú</th>
        <th>Hành động</th>
      </tr>
    </thead>
  `;

  const body = document.createElement("tbody");
  workouts.forEach((workout) => {
    const row = document.createElement("tr");
    row.innerHTML = `
      <td>${formatDate(workout.date)}</td>
      <td>${workout.type}</td>
      <td>${formatDuration(workout.duration)}</td>
      <td>${formatCalories(workout.calories)}</td>
      <td>${workout.notes || "-"}</td>
      <td></td>
    `;

    const actionCell = row.querySelector("td:last-child");
    const editButton = createButton("Sửa", "secondary", () =>
      fillForm(workout),
    );
    const deleteButton = createButton("Xóa", "danger", async () => {
      if (confirm("Bạn có chắc muốn xóa buổi tập này?")) {
        await workoutAPI.xoa(workout.id);
        await renderAdminTable();
        resetAdminForm();
      }
    });

    const actionGroup = document.createElement("div");
    actionGroup.className = "action-group";
    actionGroup.append(editButton, deleteButton);
    actionCell.appendChild(actionGroup);
    body.appendChild(row);
  });

  table.appendChild(body);
  container.innerHTML = "";
  container.appendChild(table);
}

function fillForm(workout) {
  currentEditId = workout.id;
  document.getElementById("workoutId").value = workout.id;
  document.getElementById("adminDate").value = workout.date;
  document.getElementById("adminType").value = workout.type;
  document.getElementById("adminDuration").value = workout.duration;
  document.getElementById("adminCalories").value = workout.calories;
  document.getElementById("adminNotes").value = workout.notes || "";
}

function resetAdminForm() {
  currentEditId = "";
  const form = document.getElementById("adminForm");
  if (form) form.reset();
  document.getElementById("workoutId").value = "";
}

async function handleAdminSubmit(event) {
  event.preventDefault();
  const id = document.getElementById("workoutId").value;
  const date = document.getElementById("adminDate").value;
  const type = document.getElementById("adminType").value;
  const duration = document.getElementById("adminDuration").value;
  const calories = document.getElementById("adminCalories").value;
  const notes = document.getElementById("adminNotes").value.trim();

  if (!date || !type || !duration || !calories) return;

  const workoutData = {
    date,
    type,
    duration: Number(duration),
    calories: Number(calories),
    notes,
  };

  if (id) {
    await workoutAPI.capNhat(id, workoutData);
  } else {
    await workoutAPI.themMoi(workoutData);
  }

  await renderAdminTable();
  resetAdminForm();
}

function initAdminPage() {
  const form = document.getElementById("adminForm");
  if (form) form.addEventListener("submit", handleAdminSubmit);
  const resetButton = document.getElementById("resetForm");
  if (resetButton) resetButton.addEventListener("click", resetAdminForm);
  renderAdminTable();
}

initAdminPage();
