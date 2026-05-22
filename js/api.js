/* =========================================
   FITTRACK API.JS
========================================= */

const API_BASE_URL =
    "https://jsonplaceholder.typicode.com";

/* =========================================
   API CLASS
========================================= */

class APIResource{

    constructor(resourceName){

        this.resourceName =
            resourceName;

        this.baseUrl =
            `${API_BASE_URL}/${resourceName}`;

    }

    /* =====================================
       GET ALL
    ===================================== */

    async getAll(){

        try{

            const response =
                await fetch(
                    this.baseUrl
                );

            if(
                !response.ok
            ){

                throw new Error(

                    `Không thể lấy dữ liệu ${this.resourceName}`

                );

            }

            const data =
                await response.json();

            console.log(

                `Danh sách ${this.resourceName}:`,
                data

            );

            return data;

        }
        catch(error){

            console.error(
                error.message
            );

        }

    }

    /* =====================================
       GET BY ID
    ===================================== */

    async getById(id){

        try{

            const response =
                await fetch(

                    `${this.baseUrl}/${id}`

                );

            if(
                !response.ok
            ){

                throw new Error(

                    `Không tìm thấy ${this.resourceName}`

                );

            }

            const data =
                await response.json();

            console.log(
                `${this.resourceName} ID ${id}:`,
                data
            );

            return data;

        }
        catch(error){

            console.error(
                error.message
            );

        }

    }

    /* =====================================
       CREATE
    ===================================== */

    async create(data){

        try{

            const response =
                await fetch(

                    this.baseUrl,

                    {

                        method:"POST",

                        headers:{

                            "Content-Type":
                                "application/json"

                        },

                        body:JSON.stringify(
                            data
                        )

                    }

                );

            if(
                !response.ok
            ){

                throw new Error(

                    `Không thể thêm ${this.resourceName}`

                );

            }

            const result =
                await response.json();

            console.log(
                "Tạo thành công:",
                result
            );

            return result;

        }
        catch(error){

            console.error(
                error.message
            );

        }

    }

    /* =====================================
       UPDATE
    ===================================== */

    async update(id,data){

        try{

            const response =
                await fetch(

                    `${this.baseUrl}/${id}`,

                    {

                        method:"PUT",

                        headers:{

                            "Content-Type":
                                "application/json"

                        },

                        body:JSON.stringify(
                            data
                        )

                    }

                );

            if(
                !response.ok
            ){

                throw new Error(

                    `Không thể cập nhật ${this.resourceName}`

                );

            }

            const result =
                await response.json();

            console.log(
                "Cập nhật thành công:",
                result
            );

            return result;

        }
        catch(error){

            console.error(
                error.message
            );

        }

    }

    /* =====================================
       DELETE
    ===================================== */

    async delete(id){

        try{

            const response =
                await fetch(

                    `${this.baseUrl}/${id}`,

                    {

                        method:"DELETE"

                    }

                );

            if(
                !response.ok
            ){

                throw new Error(

                    `Không thể xóa ${this.resourceName}`

                );

            }

            console.log(

                `Đã xóa ${this.resourceName} ID ${id}`

            );

            return true;

        }
        catch(error){

            console.error(
                error.message
            );

        }

    }

}

/* =========================================
   USERS API
========================================= */

const usersAPI =
    new APIResource(
        "users"
    );

/* =========================================
   POSTS API
========================================= */

const postsAPI =
    new APIResource(
        "posts"
    );

/* =========================================
   COMMENTS API
========================================= */

const commentsAPI =
    new APIResource(
        "comments"
    );

/* =========================================
   TODOS API
========================================= */

const todosAPI =
    new APIResource(
        "todos"
    );

/* =========================================
   EXAMPLE FUNCTIONS
========================================= */

/* =====================================
   LOAD USERS
===================================== */

async function loadUsers(){

    const users =
        await usersAPI.getAll();

    const usersContainer =
        document.getElementById(
            "usersContainer"
        );

    if(
        usersContainer
    ){

        usersContainer.innerHTML = "";

        users.slice(0,6).forEach(
            user=>{

                usersContainer.innerHTML += `

                    <div class="feature-card">

                        <h3>

                            ${user.name}

                        </h3>

                        <p>

                            📧 ${user.email}

                        </p>

                        <p>

                            📞 ${user.phone}

                        </p>

                        <p>

                            🌐 ${user.website}

                        </p>

                    </div>

                `;

            }
        );

    }

}

/* =====================================
   LOAD POSTS
===================================== */

async function loadPosts(){

    const posts =
        await postsAPI.getAll();

    const postContainer =
        document.getElementById(
            "postContainer"
        );

    if(
        postContainer
    ){

        postContainer.innerHTML = "";

        posts.slice(0,6).forEach(
            post=>{

                postContainer.innerHTML += `

                    <div class="feature-card">

                        <h3>

                            ${post.title}

                        </h3>

                        <p>

                            ${post.body}

                        </p>

                    </div>

                `;

            }
        );

    }

}

/* =====================================
   LOAD TODOS
===================================== */

async function loadTodos(){

    const todos =
        await todosAPI.getAll();

    const todoContainer =
        document.getElementById(
            "todoContainer"
        );

    if(
        todoContainer
    ){

        todoContainer.innerHTML = "";

        todos.slice(0,8).forEach(
            todo=>{

                todoContainer.innerHTML += `

                    <div class="feature-card">

                        <h3>

                            ${todo.title}

                        </h3>

                        <p>

                            Status:
                            ${
                                todo.completed

                                ?

                                "✅ Completed"

                                :

                                "❌ Pending"
                            }

                        </p>

                    </div>

                `;

            }
        );

    }

}

/* =========================================
   CREATE DEMO USER
========================================= */

async function createDemoUser(){

    const newUser = {

        name:"FitTrack User",

        username:"fittrack",

        email:"fittrack@gmail.com"

    };

    const result =
        await usersAPI.create(
            newUser
        );

    console.log(
        "User mới:",
        result
    );

}

/* =========================================
   UPDATE DEMO USER
========================================= */

async function updateDemoUser(){

    const updatedUser = {

        name:"Updated FitTrack",

        email:"updated@gmail.com"

    };

    const result =
        await usersAPI.update(

            1,
            updatedUser

        );

    console.log(
        result
    );

}

/* =========================================
   DELETE DEMO USER
========================================= */

async function deleteDemoUser(){

    await usersAPI.delete(
        1
    );

}

/* =========================================
   WEATHER API
========================================= */

async function loadWeather(){

    const weatherBox =
        document.getElementById(
            "weatherBox"
        );

    if(
        weatherBox
    ){

        weatherBox.innerHTML = `

            <div class="feature-card">

                <h3>

                    🌤 Hồ Chí Minh

                </h3>

                <p>

                    Nhiệt độ:
                    31°C

                </p>

                <p>

                    Độ ẩm:
                    72%

                </p>

                <p>

                    Trạng thái:
                    Có mây

                </p>

            </div>

        `;

    }

}

/* =========================================
   BMI API MOCK
========================================= */

function calculateBMI(weight,height){

    const bmi = (

        weight /

        (
            (height / 100)
            *
            (height / 100)
        )

    ).toFixed(1);

    let status = "";

    if(
        bmi < 18.5
    ){

        status = "Gầy";

    }
    else if(
        bmi < 25
    ){

        status = "Bình thường";

    }
    else if(
        bmi < 30
    ){

        status = "Thừa cân";

    }
    else{

        status = "Béo phì";

    }

    return {

        bmi,
        status

    };

}

/* =========================================
   WORKOUT API MOCK
========================================= */

function saveWorkoutAPI(workout){

    let workouts =
        JSON.parse(

            localStorage.getItem(
                "fittrackWorkouts"
            )

        ) || [];

    workouts.push(
        workout
    );

    localStorage.setItem(

        "fittrackWorkouts",

        JSON.stringify(
            workouts
        )

    );

}

/* =========================================
   GET WORKOUTS
========================================= */

function getWorkoutsAPI(){

    return JSON.parse(

        localStorage.getItem(
            "fittrackWorkouts"
        )

    ) || [];

}

/* =========================================
   SAVE SCHEDULE
========================================= */

function saveScheduleAPI(schedule){

    let schedules =
        JSON.parse(

            localStorage.getItem(
                "fittrackSchedules"
            )

        ) || [];

    schedules.push(
        schedule
    );

    localStorage.setItem(

        "fittrackSchedules",

        JSON.stringify(
            schedules
        )

    );

}

/* =========================================
   GET SCHEDULES
========================================= */

function getSchedulesAPI(){

    return JSON.parse(

        localStorage.getItem(
            "fittrackSchedules"
        )

    ) || [];

}

/* =========================================
   PREMIUM API MOCK
========================================= */

function activatePremium(){

    localStorage.setItem(
        "fittrackPremium",
        "true"
    );

    alert(
        "⭐ Premium Activated"
    );

}

/* =========================================
   AUTH API MOCK
========================================= */

function login(email,password){

    const user = {

        email,
        password

    };

    localStorage.setItem(

        "fittrackCurrentUser",

        JSON.stringify(
            user
        )

    );

    return true;

}

/* =========================================
   LOGOUT API
========================================= */

function logout(){

    localStorage.removeItem(
        "fittrackCurrentUser"
    );

    window.location.href =
        "index.html";

}

/* =========================================
   AUTO LOAD
========================================= */

document.addEventListener(
    "DOMContentLoaded",
    ()=>{

        loadUsers();

        loadPosts();

        loadTodos();

        loadWeather();

    }
);

/* =========================================
   READY
========================================= */

console.log(
    "FitTrack API Ready"
);
// =========================================
// FITTRACK API.JS
// =========================================

// =========================================
// LOCAL STORAGE API
// =========================================

class FitTrackAPI {

    // =====================================
    // GET DATA
    // =====================================

    static getData(key) {

        return JSON.parse(

            localStorage.getItem(key)

        ) || [];

    }

    // =====================================
    // SAVE DATA
    // =====================================

    static saveData(
        key,
        data
    ) {

        localStorage.setItem(

            key,

            JSON.stringify(data)

        );

    }

    // =====================================
    // ADD ITEM
    // =====================================

    static addItem(
        key,
        item
    ) {

        const data =
            this.getData(key);

        data.push(item);

        this.saveData(
            key,
            data
        );

    }

    // =====================================
    // DELETE ITEM
    // =====================================

    static deleteItem(
        key,
        index
    ) {

        const data =
            this.getData(key);

        data.splice(index, 1);

        this.saveData(
            key,
            data
        );

    }

    // =====================================
    // UPDATE ITEM
    // =====================================

    static updateItem(
        key,
        index,
        newData
    ) {

        const data =
            this.getData(key);

        data[index] =
            newData;

        this.saveData(
            key,
            data
        );

    }

}

// =========================================
// USERS API
// =========================================

function getUsers() {

    return FitTrackAPI.getData(
        "fittrackUsers"
    );

}

function addUser(user) {

    FitTrackAPI.addItem(
        "fittrackUsers",
        user
    );

}

function deleteUserAPI(index) {

    FitTrackAPI.deleteItem(
        "fittrackUsers",
        index
    );

}

// =========================================
// WORKOUT API
// =========================================

function getWorkouts() {

    return FitTrackAPI.getData(
        "fittrackWorkouts"
    );

}

function addWorkout(workout) {

    FitTrackAPI.addItem(
        "fittrackWorkouts",
        workout
    );

}

function deleteWorkoutAPI(index) {

    FitTrackAPI.deleteItem(
        "fittrackWorkouts",
        index
    );

}

// =========================================
// PREMIUM API
// =========================================

function getPremiums() {

    return FitTrackAPI.getData(
        "fittrackPremiums"
    );

}

function addPremium(premium) {

    FitTrackAPI.addItem(
        "fittrackPremiums",
        premium
    );

}

function deletePremiumAPI(index) {

    FitTrackAPI.deleteItem(
        "fittrackPremiums",
        index
    );

}

// =========================================
// POSTS API
// =========================================

function getPosts() {

    return FitTrackAPI.getData(
        "fittrackPosts"
    );

}

function addPost(post) {

    FitTrackAPI.addItem(
        "fittrackPosts",
        post
    );

}

function deletePostAPI(index) {

    FitTrackAPI.deleteItem(
        "fittrackPosts",
        index
    );

}

// =========================================
// SCHEDULE API
// =========================================

function getSchedules() {

    return FitTrackAPI.getData(
        "fittrackSchedules"
    );

}

function addSchedule(schedule) {

    FitTrackAPI.addItem(
        "fittrackSchedules",
        schedule
    );

}

function deleteScheduleAPI(index) {

    FitTrackAPI.deleteItem(
        "fittrackSchedules",
        index
    );

}

// =========================================
// TRAINER API
// =========================================

function getTrainers() {

    return FitTrackAPI.getData(
        "fittrackTrainers"
    );

}

function addTrainer(trainer) {

    FitTrackAPI.addItem(
        "fittrackTrainers",
        trainer
    );

}

function deleteTrainerAPI(index) {

    FitTrackAPI.deleteItem(
        "fittrackTrainers",
        index
    );

}

// =========================================
// LOGIN API
// =========================================

function loginUser(
    email,
    password
) {

    const users =
        getUsers();

    const foundUser =
        users.find(
            user =>

                user.email === email &&
                user.password === password
        );

    if (
        foundUser
    ) {

        localStorage.setItem(

            "fittrackCurrentUser",

            JSON.stringify(foundUser)

        );

        return true;

    }

    return false;

}

// =========================================
// REGISTER API
// =========================================

function registerUser(
    user
) {

    const users =
        getUsers();

    const emailExists =
        users.some(
            item =>
                item.email === user.email
        );

    if (
        emailExists
    ) {

        return false;

    }

    users.push(user);

    FitTrackAPI.saveData(
        "fittrackUsers",
        users
    );

    return true;

}

// =========================================
// PREMIUM STATUS
// =========================================

function activatePremium() {

    localStorage.setItem(

        "fittrackPremium",

        "true"

    );

}

function deactivatePremium() {

    localStorage.setItem(

        "fittrackPremium",

        "false"

    );

}

// =========================================
// CLEAR DATABASE
// =========================================

function clearFitTrackDatabase() {

    localStorage.removeItem(
        "fittrackUsers"
    );

    localStorage.removeItem(
        "fittrackWorkouts"
    );

    localStorage.removeItem(
        "fittrackPremiums"
    );

    localStorage.removeItem(
        "fittrackPosts"
    );

    localStorage.removeItem(
        "fittrackSchedules"
    );

    localStorage.removeItem(
        "fittrackTrainers"
    );

    localStorage.removeItem(
        "fittrackCurrentUser"
    );

    alert(
        "Đã xóa toàn bộ dữ liệu"
    );

}