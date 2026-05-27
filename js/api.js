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