<<<<<<< HEAD
/* =========================================
   FITTRACK MAIN JS
========================================= */
=======
<<<<<<< HEAD
/* =========================================
   FITTRACK MAIN JS
========================================= */
=======
// <<<<<<< HEAD
const workoutAPI = new APIResource("workouts");
const memberAPI = new APIResource("members");
>>>>>>> bd0f2e60372e16c10e1317ac2494898e0b270600
>>>>>>> ebf787379a51bedf9f618bf2160cafe79046ff22

console.log(
    "FitTrack Loaded"
);

/* =========================================
   MENU MOBILE
========================================= */

const menuToggle =
    document.getElementById(
        "menuToggle"
    );

const mainNav =
    document.getElementById(
        "mainNav"
    );

if(
    menuToggle &&
    mainNav
){

    menuToggle.addEventListener(
        "click",
        ()=>{

            mainNav.classList.toggle(
                "show-menu"
            );

        }
    );

}

/* =========================================
   CLOSE MENU WHEN CLICK LINK
========================================= */

const navLinks =
    document.querySelectorAll(
        ".main-nav a"
    );

navLinks.forEach(
    link=>{

        link.addEventListener(
            "click",
            ()=>{

                if(
                    mainNav
                ){

                    mainNav.classList.remove(
                        "show-menu"
                    );

                }

            }
        );

    }
);

/* =========================================
   DARK MODE
========================================= */

const savedTheme =
    localStorage.getItem(
        "fittrackTheme"
    );

if(
    savedTheme === "dark"
){

    document.body.classList.add(
        "dark-mode"
    );

}

const themeToggle =
    document.getElementById(
        "themeToggle"
    );

if(
    themeToggle
){

    themeToggle.addEventListener(
        "click",
        ()=>{

            document.body.classList.toggle(
                "dark-mode"
            );

            if(
                document.body.classList.contains(
                    "dark-mode"
                )
            ){

                localStorage.setItem(
                    "fittrackTheme",
                    "dark"
                );

            }
            else{

                localStorage.setItem(
                    "fittrackTheme",
                    "light"
                );

            }

        }
    );

}

/* =========================================
   CURRENT USER
========================================= */

const currentUser =
    JSON.parse(
        localStorage.getItem(
            "fittrackCurrentUser"
        )
    );

    /* =========================================
   SHOW / HIDE LOGOUT
========================================= */

const logoutBtn =
    document.getElementById(
        "logoutBtn"
    );

// Nếu chưa đăng nhập

if(
    !currentUser &&
    logoutBtn
){

    logoutBtn.style.display =
        "none";

}

// Nếu đã đăng nhập

if(
    currentUser &&
    logoutBtn
){

    logoutBtn.style.display =
        "inline-block";

}

const userNameElement =
    document.getElementById(
        "currentUserName"
    );

if(
    currentUser &&
    userNameElement
){

    userNameElement.innerText =
        currentUser.name;

}

/* =========================================
   LOGIN CHECK
========================================= */

const protectedPages = [

    "admin.html",
    "progress.html",
    "schedule.html",
    "workout.html",
    "premium.html"

];

const currentPage =
    window.location.pathname
        .split("/")
        .pop();

if(

    protectedPages.includes(
        currentPage
    )

    &&

    !currentUser

){

    document.body.innerHTML = `

        <div class="auth-warning">

            <h1>

                🔒 Bạn chưa đăng nhập

            </h1>

            <p>

                Vui lòng đăng nhập
                để truy cập trang này.

            </p>

            <a href="signup.html"
               class="btn primary">

                Đăng nhập ngay

            </a>

        </div>

    `;

}

<<<<<<< HEAD
=======
<<<<<<< HEAD
>>>>>>> ebf787379a51bedf9f618bf2160cafe79046ff22
/* =========================================
   LOGOUT
========================================= */

const logoutBtn =
    document.getElementById(
        "logoutBtn"
    );

if(
    logoutBtn
){

    logoutBtn.addEventListener(
        "click",
        e=>{

            e.preventDefault();

            localStorage.removeItem(
                "fittrackCurrentUser"
            );

            alert(
                "🚪 Đăng xuất thành công"
            );

            window.location.href =
                "index.html";

        }
    );

}

/* =========================================
   PREMIUM STATUS
========================================= */

const premiumStatus =
    localStorage.getItem(
        "fittrackPremium"
    );

const premiumBadge =
    document.getElementById(
        "premiumBadge"
    );

if(
    premiumStatus === "true"
){

    console.log(
        "Premium User"
    );

    if(
        premiumBadge
    ){

        premiumBadge.innerHTML =
            "⭐ Premium";

    }

}

/* =========================================
   SCROLL ANIMATION
========================================= */

const animatedItems =
    document.querySelectorAll(

        ".feature-card,\
         .workout-card,\
         .stats-card,\
         .trainer-card,\
         .nutrition-card,\
         .pricing-card,\
         .testimonial-card"

    );

function revealOnScroll(){

    animatedItems.forEach(
        item=>{

            const itemTop =
                item.getBoundingClientRect()
                    .top;

            const screenHeight =
                window.innerHeight;

            if(
                itemTop <
                screenHeight - 100
            ){

                item.style.opacity =
                    "1";

                item.style.transform =
                    "translateY(0px)";

            }

        }
    );

}

animatedItems.forEach(
    item=>{

        item.style.opacity = "0";

        item.style.transform =
            "translateY(40px)";

        item.style.transition =
            "0.6s";

    }
);

window.addEventListener(
    "scroll",
    revealOnScroll
);

revealOnScroll();

/* =========================================
   COUNTER ANIMATION
========================================= */

const counters =
    document.querySelectorAll(
        ".counter"
    );

counters.forEach(
    counter=>{

        counter.innerText = "0";

        const updateCounter = ()=>{

            const target =
                +counter.getAttribute(
                    "data-target"
                );

            const current =
                +counter.innerText;

            const increment =
                target / 100;

            if(
                current < target
            ){

                counter.innerText =
                    `${Math.ceil(
                        current + increment
                    )}`;

                setTimeout(
                    updateCounter,
                    20
                );

            }
            else{

                counter.innerText =
                    target;

            }

        };

        updateCounter();

    }
);

/* =========================================
   WORKOUT STORAGE
========================================= */

function getWorkouts(){

    return JSON.parse(

        localStorage.getItem(
            "fittrackWorkouts"
        )

    ) || [];

}

function saveWorkout(workout){

    const workouts =
        getWorkouts();

    workouts.push(workout);

    localStorage.setItem(

        "fittrackWorkouts",

        JSON.stringify(
            workouts
        )

    );

}

/* =========================================
   SCHEDULE STORAGE
========================================= */

function getSchedules(){

    return JSON.parse(

        localStorage.getItem(
            "fittrackSchedules"
        )

    ) || [];

}

function saveSchedule(schedule){

    const schedules =
        getSchedules();

    schedules.push(schedule);

    localStorage.setItem(

        "fittrackSchedules",

        JSON.stringify(
            schedules
        )

    );

}

/* =========================================
   BMI CALCULATOR
========================================= */

const bmiBtn =
    document.getElementById(
        "calculateBMI"
    );

if(
    bmiBtn
){

    bmiBtn.addEventListener(
        "click",
        ()=>{

            const weight =
                document.getElementById(
                    "weight"
                ).value;

            const height =
                document.getElementById(
                    "height"
                ).value;

            const bmiResult =
                document.getElementById(
                    "bmiResult"
                );

            if(
                !weight ||
                !height
            ){

                bmiResult.innerText =
                    "Vui lòng nhập đủ thông tin";

                return;

            }

            const bmi = (

                weight /

                (
                    (height / 100)
                    *
                    (height / 100)
                )

            ).toFixed(1);

            bmiResult.innerText =
                `BMI của bạn: ${bmi}`;

        }
    );

}

/* =========================================
   CONTACT FORM
========================================= */

const supportForm =
    document.getElementById(
        "supportForm"
    );

if(
    supportForm
){

    supportForm.addEventListener(
        "submit",
        e=>{

            e.preventDefault();

            alert(
                "📩 Gửi hỗ trợ thành công"
            );

            supportForm.reset();

        }
    );

}

/* =========================================
   NEWSLETTER
========================================= */

const newsletterForm =
    document.getElementById(
        "newsletterForm"
    );

if(
    newsletterForm
){

    newsletterForm.addEventListener(
        "submit",
        e=>{

            e.preventDefault();

            const email =
                document.getElementById(
                    "newsletterEmail"
                ).value;

            if(
                !email
            ){

                alert(
                    "Nhập email của bạn"
                );

                return;

            }

            alert(
                "🎉 Đăng ký thành công"
            );

            newsletterForm.reset();

        }
    );

}

/* =========================================
   LOADING SCREEN
========================================= */

window.addEventListener(
    "load",
    ()=>{

        const loader =
            document.getElementById(
                "loader"
            );

        if(
            loader
        ){

            loader.style.display =
                "none";

        }

    }
);

/* =========================================
   AUTO YEAR
========================================= */

const currentYear =
    document.getElementById(
        "currentYear"
    );

if(
    currentYear
){

    currentYear.innerText =
        new Date().getFullYear();

}

/* =========================================
   SEARCH WORKOUT
========================================= */

const searchInput =
    document.getElementById(
        "searchWorkout"
    );

if(
    searchInput
){

    searchInput.addEventListener(
        "keyup",
        ()=>{

            const value =
                searchInput.value
                    .toLowerCase();

            const cards =
                document.querySelectorAll(
                    ".workout-card"
                );

            cards.forEach(
                card=>{

                    const text =
                        card.innerText
                            .toLowerCase();

                    if(
                        text.includes(
                            value
                        )
                    ){

                        card.style.display =
                            "block";

                    }
                    else{

                        card.style.display =
                            "none";

                    }

                }
            );

        }
    );

}

/* =========================================
   PREMIUM BUY
========================================= */

const buyButtons =
    document.querySelectorAll(
        ".buyPremiumBtn"
    );

buyButtons.forEach(
    button=>{

        button.addEventListener(
            "click",
            ()=>{

                localStorage.setItem(
                    "fittrackPremium",
                    "true"
                );

                alert(
                    "⭐ Nâng cấp Premium thành công"
                );

            }
        );

    }
);

/* =========================================
   PAGE LOADED
========================================= */

console.log(
    "FitTrack Main JS Ready"
);
/* =========================================
   LOGOUT
========================================= */

const logoutBtn =
    document.getElementById(
        "logoutBtn"
    );

if(
    logoutBtn
){

    logoutBtn.addEventListener(
        "click",
        e=>{

            e.preventDefault();

            // Xóa tài khoản hiện tại

            localStorage.removeItem(
                "fittrackCurrentUser"
            );

            // Xóa premium nếu muốn

            // localStorage.removeItem(
            //     "fittrackPremium"
            // );

            alert(
                "🚪 Đăng xuất thành công"
            );

            // Chuyển về trang chủ

            window.location.href =
                "index.html";

        }
    );

}

localStorage.setItem(

    "fittrackCurrentUser",

    JSON.stringify({

        name:name,
        email:email

    })

);
// =========================================
// FITTRACK MAIN.JS
// =========================================

// =========================================
// MENU MOBILE
// =========================================

const menuToggle =
    document.getElementById(
        "menuToggle"
    );

const mainNav =
    document.getElementById(
        "mainNav"
    );

if (
    menuToggle &&
    mainNav
) {

    menuToggle.addEventListener(
        "click",
        () => {

            mainNav.classList.toggle(
                "show-menu"
            );

        }
    );

}

// =========================================
// CURRENT USER
// =========================================

const currentUser =
    JSON.parse(
        localStorage.getItem(
            "fittrackCurrentUser"
        )
    );

// =========================================
// NAVIGATION LOGIN STATUS
// =========================================

const logoutBtn =
    document.getElementById(
        "logoutBtn"
    );

const loginNav =
    document.getElementById(
        "loginNav"
    );

const adminNav =
    document.getElementById(
        "adminNav"
    );

// =========================================
// SHOW/HIDE MENU
// =========================================

if (
    currentUser
) {

    if (
        logoutBtn
    ) {

        logoutBtn.style.display =
            "block";

    }

    if (
        loginNav
    ) {

        loginNav.style.display =
            "none";

    }

    // =============================
    // ADMIN MENU
    // =============================

    if (
        currentUser.role === "admin"
    ) {

        if (
            adminNav
        ) {

            adminNav.style.display =
                "block";

        }

    }

} else {

    if (
        logoutBtn
    ) {

        logoutBtn.style.display =
            "none";

    }

    if (
        adminNav
    ) {

        adminNav.style.display =
            "none";

    }

}

// =========================================
// LOGOUT
// =========================================

if (
    logoutBtn
) {

    logoutBtn.addEventListener(
        "click",
        (e) => {

            e.preventDefault();

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
// ADMIN PAGE CHECK
// =========================================

const isAdminPage =
    window.location.pathname.includes(
        "admin.html"
    );

if (
    isAdminPage
) {

    if (
        !currentUser
    ) {

        alert(
            "Bạn chưa đăng nhập"
        );

        window.location.href =
            "signup.html";

    }

    if (
        currentUser.role !== "admin"
    ) {

        alert(
            "Bạn không có quyền truy cập"
        );

        window.location.href =
            "index.html";

    }

}

// =========================================
// DARK MODE
// =========================================

const savedTheme =
    localStorage.getItem(
        "fittrackTheme"
    );

if (
    savedTheme === "dark"
) {

    document.body.classList.add(
        "dark-mode"
    );

}

// =========================================
// WEBSITE SETTINGS
// =========================================

const siteTitle =
    localStorage.getItem(
        "fittrackSiteTitle"
    );

if (
    siteTitle
) {

    const brand =
        document.querySelector(
            ".brand"
        );

    if (
        brand
    ) {

        brand.innerText =
            siteTitle;

    }

}

const themeColor =
    localStorage.getItem(
        "fittrackThemeColor"
    );

if (
    themeColor
) {

    document.documentElement
        .style
        .setProperty(
            "--primary-color",
            themeColor
        );

}

// =========================================
// PREMIUM CHECK
// =========================================

const premiumStatus =
    localStorage.getItem(
        "fittrackPremium"
    );

if (
    premiumStatus === "true"
) {

    console.log(
        "Premium Member"
    );

}

// =========================================
// GLOBAL NOTIFICATION
// =========================================

function showNotification(
    message
) {

    const notification =
        document.createElement(
            "div"
        );

    notification.className =
        "global-notification";

    notification.innerText =
        message;

    document.body.appendChild(
        notification
    );

    setTimeout(
        () => {

            notification.remove();

        },
        3000
    );

}

// =========================================
// USER GREETING
// =========================================

const greetingBox =
    document.getElementById(
        "greetingBox"
    );

if (
    greetingBox &&
    currentUser
) {

    greetingBox.innerHTML = `

        Xin chào,
        <strong>

            ${currentUser.name}

        </strong>

    `;

}

// =========================================
// AUTO INIT STORAGE
// =========================================

if (
    !localStorage.getItem(
        "fittrackUsers"
    )
) {

    localStorage.setItem(

        "fittrackUsers",

        JSON.stringify([])

    );

}

if (
    !localStorage.getItem(
        "fittrackWorkouts"
    )
) {

    localStorage.setItem(

        "fittrackWorkouts",

        JSON.stringify([])

    );

}

if (
    !localStorage.getItem(
        "fittrackPremiums"
    )
) {

    localStorage.setItem(

        "fittrackPremiums",

        JSON.stringify([])

    );

}

if (
    !localStorage.getItem(
        "fittrackPosts"
    )
) {

    localStorage.setItem(

        "fittrackPosts",

        JSON.stringify([])

    );

}

if (
    !localStorage.getItem(
        "fittrackSchedules"
    )
) {

    localStorage.setItem(

        "fittrackSchedules",

        JSON.stringify([])

    );

}

if (
    !localStorage.getItem(
        "fittrackTrainers"
    )
) {

    localStorage.setItem(

        "fittrackTrainers",

        JSON.stringify([])

    );

<<<<<<< HEAD
}
=======
}
=======
initSignup();
initApp();
// =======
// >>>>>>> 6d5b315397e7b2d76a698e4c303ad22564bad900
>>>>>>> bd0f2e60372e16c10e1317ac2494898e0b270600
>>>>>>> ebf787379a51bedf9f618bf2160cafe79046ff22
