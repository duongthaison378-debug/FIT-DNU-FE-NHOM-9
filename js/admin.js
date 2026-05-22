// =========================================
// FITTRACK ADMIN.JS
// =========================================

// =========================================
// LOGIN CHECK
// =========================================

const currentUser =
    JSON.parse(
        localStorage.getItem(
            "fittrackCurrentUser"
        )
    );

if (
    !currentUser
) {

    alert(
        "Bạn cần đăng nhập"
    );

    window.location.href =
        "signup.html";

}

// =========================================
// ELEMENTS
// =========================================

const usersTable =
    document.getElementById(
        "usersTable"
    );

const workoutTable =
    document.getElementById(
        "workoutTable"
    );

const premiumTable =
    document.getElementById(
        "premiumTable"
    );

const postTable =
    document.getElementById(
        "postTable"
    );

const totalUsers =
    document.getElementById(
        "totalUsers"
    );

const totalWorkouts =
    document.getElementById(
        "totalWorkouts"
    );

const totalPremium =
    document.getElementById(
        "totalPremium"
    );

const totalTrainer =
    document.getElementById(
        "totalTrainer"
    );

// =========================================
// DATA
// =========================================

let users =
    JSON.parse(
        localStorage.getItem(
            "fittrackUsers"
        )
    ) || [];

let workouts =
    JSON.parse(
        localStorage.getItem(
            "fittrackWorkouts"
        )
    ) || [];

let premiums =
    JSON.parse(
        localStorage.getItem(
            "fittrackPremiums"
        )
    ) || [];

let posts =
    JSON.parse(
        localStorage.getItem(
            "fittrackPosts"
        )
    ) || [];

let schedules =
    JSON.parse(
        localStorage.getItem(
            "fittrackSchedules"
        )
    ) || [];

let trainers =
    JSON.parse(
        localStorage.getItem(
            "fittrackTrainers"
        )
    ) || [];

// =========================================
// SAVE DATA
// =========================================

function saveUsers() {

    localStorage.setItem(

        "fittrackUsers",

        JSON.stringify(users)

    );

}

function saveWorkouts() {

    localStorage.setItem(

        "fittrackWorkouts",

        JSON.stringify(workouts)

    );

}

function savePremiums() {

    localStorage.setItem(

        "fittrackPremiums",

        JSON.stringify(premiums)

    );

}

function savePosts() {

    localStorage.setItem(

        "fittrackPosts",

        JSON.stringify(posts)

    );

}

function saveSchedules() {

    localStorage.setItem(

        "fittrackSchedules",

        JSON.stringify(schedules)

    );

}

function saveTrainers() {

    localStorage.setItem(

        "fittrackTrainers",

        JSON.stringify(trainers)

    );

}

// =========================================
// UPDATE STATS
// =========================================

function updateStats() {

    if (
        totalUsers
    ) {

        totalUsers.innerText =
            users.length;

    }

    if (
        totalWorkouts
    ) {

        totalWorkouts.innerText =
            workouts.length;

    }

    if (
        totalPremium
    ) {

        totalPremium.innerText =
            premiums.length;

    }

    if (
        totalTrainer
    ) {

        totalTrainer.innerText =
            trainers.length;

    }

}

// =========================================
// USERS MANAGEMENT
// THAY TOÀN BỘ PHẦN USERS CŨ
// =========================================

// =========================================
// USERS DATA
// =========================================

let users =
    JSON.parse(
        localStorage.getItem(
            "fittrackUsers"
        )
    ) || [];

// =========================================
// ELEMENTS
// =========================================

const usersTable =
    document.getElementById(
        "usersTable"
    );

const totalUsers =
    document.getElementById(
        "totalUsers"
    );

// =========================================
// UPDATE STATS
// =========================================

function updateStats(){

    if(
        totalUsers
    ){

        totalUsers.innerText =
            users.length;

    }

}

// =========================================
// RENDER USERS
// =========================================

function renderUsers(){

    if(
        !usersTable
    ) return;

    usersTable.innerHTML = "";

    users.forEach(
        (user,index)=>{

            usersTable.innerHTML += `

                <tr>

                    <td>

                        ${index + 1}

                    </td>

                    <td>

                        <input
                            type="text"
                            value="${user.name}"
                            id="name-${index}"
                            class="table-input">

                    </td>

                    <td>

                        <input
                            type="email"
                            value="${user.email}"
                            id="email-${index}"
                            class="table-input">

                    </td>

                    <td>

                        <input
                            type="text"
                            value="${user.password}"
                            id="password-${index}"
                            class="table-input">

                    </td>

                    <td>

                        <select
                            id="role-${index}"
                            class="table-input">

                            <option
                            value="user"
                            ${user.role === "user"
                            ? "selected"
                            : ""}>

                                User

                            </option>

                            <option
                            value="admin"
                            ${user.role === "admin"
                            ? "selected"
                            : ""}>

                                Admin

                            </option>

                            <option
                            value="trainer"
                            ${user.role === "trainer"
                            ? "selected"
                            : ""}>

                                Trainer

                            </option>

                        </select>

                    </td>

                    <td>

                        <div
                        class="action-buttons">

                            <button
                            class="btn btn-blue"
                            onclick="saveUser(${index})">

                                Lưu

                            </button>

                            <button
                            class="btn btn-red"
                            onclick="deleteUser(${index})">

                                Xóa

                            </button>

                        </div>

                    </td>

                </tr>

            `;

        }
    );

    updateStats();

}

// =========================================
// ADD USER
// =========================================

function addUser(){

    const name =
        document.getElementById(
            "userName"
        ).value;

    const email =
        document.getElementById(
            "userEmail"
        ).value;

    const password =
        document.getElementById(
            "userPassword"
        ).value;

    const role =
        document.getElementById(
            "userRole"
        ).value;

    if(
        !name ||
        !email ||
        !password
    ){

        alert(
            "Vui lòng nhập đầy đủ thông tin"
        );

        return;

    }

    const emailExists =
        users.some(
            user =>
                user.email === email
        );

    if(
        emailExists
    ){

        alert(
            "Email đã tồn tại"
        );

        return;

    }

    users.push({

        name,
        email,
        password,
        role

    });

    localStorage.setItem(

        "fittrackUsers",

        JSON.stringify(users)

    );

    renderUsers();

    alert(
        "Thêm tài khoản thành công"
    );

    // RESET FORM

    document.getElementById(
        "userName"
    ).value = "";

    document.getElementById(
        "userEmail"
    ).value = "";

    document.getElementById(
        "userPassword"
    ).value = "";

}

// =========================================
// SAVE USER
// =========================================

function saveUser(index){

    const newName =
        document.getElementById(
            `name-${index}`
        ).value;

    const newEmail =
        document.getElementById(
            `email-${index}`
        ).value;

    const newPassword =
        document.getElementById(
            `password-${index}`
        ).value;

    const newRole =
        document.getElementById(
            `role-${index}`
        ).value;

    users[index] = {

        ...users[index],

        name: newName,
        email: newEmail,
        password: newPassword,
        role: newRole

    };

    localStorage.setItem(

        "fittrackUsers",

        JSON.stringify(users)

    );

    // UPDATE CURRENT USER

    const currentUser =
        JSON.parse(
            localStorage.getItem(
                "fittrackCurrentUser"
            )
        );

    if(
        currentUser &&
        currentUser.email === users[index].email
    ){

        localStorage.setItem(

            "fittrackCurrentUser",

            JSON.stringify(users[index])

        );

    }

    renderUsers();

    alert(
        "Cập nhật tài khoản thành công"
    );

}

// =========================================
// DELETE USER
// =========================================

function deleteUser(index){

    const confirmDelete =
        confirm(
            "Bạn có chắc muốn xóa tài khoản này?"
        );

    if(
        !confirmDelete
    ){

        return;

    }

    users.splice(index,1);

    localStorage.setItem(

        "fittrackUsers",

        JSON.stringify(users)

    );

    renderUsers();

    alert(
        "Xóa tài khoản thành công"
    );

}

// =========================================
// ADD USER BUTTON
// =========================================

const addUserBtn =
    document.getElementById(
        "addUserBtn"
    );

if(
    addUserBtn
){

    addUserBtn.addEventListener(
        "click",
        addUser
    );

}

// =========================================
// INIT
// =========================================

renderUsers();
updateStats();

function deleteUser(index) {

    users.splice(index, 1);

    saveUsers();

    renderUsers();

}

// =========================================
// WORKOUTS
// =========================================

function renderWorkouts() {

    if (
        !workoutTable
    ) return;

    workoutTable.innerHTML = "";

    workouts.forEach(
        (workout, index) => {

            workoutTable.innerHTML += `

                <tr>

                    <td>

                        ${workout.name}

                    </td>

                    <td>

                        ${workout.level}

                    </td>

                    <td>

                        <button
                            class="btn btn-red"
                            onclick="deleteWorkout(${index})">

                            Xóa

                        </button>

                    </td>

                </tr>

            `;

        }
    );

    updateStats();

}

function addWorkout() {

    const name =
        document.getElementById(
            "workoutName"
        ).value;

    const level =
        document.getElementById(
            "workoutLevel"
        ).value;

    workouts.push({

        name,
        level

    });

    saveWorkouts();

    renderWorkouts();

}

function deleteWorkout(index) {

    workouts.splice(index, 1);

    saveWorkouts();

    renderWorkouts();

}

// =========================================
// PREMIUM
// =========================================

function renderPremiums() {

    if (
        !premiumTable
    ) return;

    premiumTable.innerHTML = "";

    premiums.forEach(
        (premium, index) => {

            premiumTable.innerHTML += `

                <tr>

                    <td>

                        ${premium.name}

                    </td>

                    <td>

                        ${premium.price} VNĐ

                    </td>

                    <td>

                        <button
                            class="btn btn-red"
                            onclick="deletePremium(${index})">

                            Xóa

                        </button>

                    </td>

                </tr>

            `;

        }
    );

    updateStats();

}

function addPremium() {

    const name =
        document.getElementById(
            "premiumName"
        ).value;

    const price =
        document.getElementById(
            "premiumPrice"
        ).value;

    premiums.push({

        name,
        price

    });

    savePremiums();

    renderPremiums();

}

function deletePremium(index) {

    premiums.splice(index, 1);

    savePremiums();

    renderPremiums();

}

// =========================================
// POSTS
// =========================================

function renderPosts() {

    if (
        !postTable
    ) return;

    postTable.innerHTML = "";

    posts.forEach(
        (post, index) => {

            postTable.innerHTML += `

                <tr>

                    <td>

                        ${post.title}

                    </td>

                    <td>

                        ${post.content}

                    </td>

                    <td>

                        <button
                            class="btn btn-red"
                            onclick="deletePost(${index})">

                            Xóa

                        </button>

                    </td>

                </tr>

            `;

        }
    );

}

function addPost() {

    const title =
        document.getElementById(
            "postTitle"
        ).value;

    const content =
        document.getElementById(
            "postContent"
        ).value;

    posts.push({

        title,
        content

    });

    savePosts();

    renderPosts();

}

function deletePost(index) {

    posts.splice(index, 1);

    savePosts();

    renderPosts();

}

// =========================================
// SETTINGS
// =========================================

function saveSettings() {

    const siteTitle =
        document.getElementById(
            "siteTitle"
        ).value;

    const themeColor =
        document.getElementById(
            "themeColor"
        ).value;

    localStorage.setItem(

        "fittrackSiteTitle",

        siteTitle

    );

    localStorage.setItem(

        "fittrackThemeColor",

        themeColor

    );

    document.documentElement.style
        .setProperty(
            "--primary-color",
            themeColor
        );

    alert(
        "Lưu cài đặt thành công"
    );

}

// =========================================
// LOGOUT
// =========================================

const logoutBtn =
    document.getElementById(
        "logoutBtn"
    );

if (
    logoutBtn
) {

    logoutBtn.addEventListener(
        "click",
        () => {

            localStorage.removeItem(
                "fittrackCurrentUser"
            );

            alert(
                "Đăng xuất thành công"
            );

            window.location.href =
                "index.html";

        }
    );

}

// =========================================
// EVENT LISTENERS
// =========================================

const addUserBtn =
    document.getElementById(
        "addUserBtn"
    );

if (
    addUserBtn
) {

    addUserBtn.addEventListener(
        "click",
        addUser
    );

}

const addWorkoutBtn =
    document.getElementById(
        "addWorkoutBtn"
    );

if (
    addWorkoutBtn
) {

    addWorkoutBtn.addEventListener(
        "click",
        addWorkout
    );

}

const addPremiumBtn =
    document.getElementById(
        "addPremiumBtn"
    );

if (
    addPremiumBtn
) {

    addPremiumBtn.addEventListener(
        "click",
        addPremium
    );

}

const addPostBtn =
    document.getElementById(
        "addPostBtn"
    );

if (
    addPostBtn
) {

    addPostBtn.addEventListener(
        "click",
        addPost
    );

}

const saveSettingsBtn =
    document.getElementById(
        "saveSettingsBtn"
    );

if (
    saveSettingsBtn
) {

    saveSettingsBtn.addEventListener(
        "click",
        saveSettings
    );

}

// =========================================
// INIT
// =========================================

renderUsers();

renderWorkouts();

renderPremiums();

renderPosts();

updateStats();
// =========================================
// SCHEDULE
// =========================================

const scheduleTable =
    document.getElementById(
        "scheduleTable"
    );

function renderSchedules() {

    if (
        !scheduleTable
    ) return;

    scheduleTable.innerHTML = "";

    schedules.forEach(
        (schedule, index) => {

            scheduleTable.innerHTML += `

                <tr>

                    <td>

                        ${schedule.title}

                    </td>

                    <td>

                        ${schedule.date}

                    </td>

                    <td>

                        ${schedule.time}

                    </td>

                    <td>

                        <button
                            class="btn btn-red"
                            onclick="deleteSchedule(${index})">

                            Xóa

                        </button>

                    </td>

                </tr>

            `;

        }
    );

}

function deleteSchedule(index) {

    schedules.splice(index, 1);

    saveSchedules();

    renderSchedules();

}

// =========================================
// TRAINER
// =========================================

const trainerTable =
    document.getElementById(
        "trainerTable"
    );

function renderTrainers() {

    if (
        !trainerTable
    ) return;

    trainerTable.innerHTML = "";

    trainers.forEach(
        (trainer, index) => {

            trainerTable.innerHTML += `

                <tr>

                    <td>

                        ${trainer.name}

                    </td>

                    <td>

                        ${trainer.special}

                    </td>

                    <td>

                        <button
                            class="btn btn-red"
                            onclick="deleteTrainer(${index})">

                            Xóa

                        </button>

                    </td>

                </tr>

            `;

        }
    );

}

function addTrainer() {

    const name =
        document.getElementById(
            "trainerName"
        ).value;

    const special =
        document.getElementById(
            "trainerSpecial"
        ).value;

    trainers.push({

        name,
        special

    });

    saveTrainers();

    renderTrainers();

}

function deleteTrainer(index) {

    trainers.splice(index, 1);

    saveTrainers();

    renderTrainers();

}

const addTrainerBtn =
    document.getElementById(
        "addTrainerBtn"
    );

if (
    addTrainerBtn
) {

    addTrainerBtn.addEventListener(
        "click",
        addTrainer
    );

}

renderSchedules();

renderTrainers();