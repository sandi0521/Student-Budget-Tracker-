
/* =====================================
   STUDENT BUDGET TRACKER
   Complete JavaScript
===================================== */

"use strict";

// Storage keys
const USERS_KEY = "sbt_users_v1";
const SESSION_KEY = "sbt_session_v1";
const THEME_KEY = "sbt_theme_v1";

let currentUser = null;
let budgetChart = null;
let latestBudget = null;

// HTML element helper
function getElement(id) {
    return document.getElementById(id);
}

// Display text safely
function setText(id, value) {
    const element = getElement(id);

    if (element) {
        element.textContent = value;
    }
}

// Format South African rand
function money(value) {
    return new Intl.NumberFormat("en-ZA", {
        style: "currency",
        currency: "ZAR",
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
    }).format(value);
}

// Get a storage key for the current user's budget
function userStorageKey(type) {
    return "sbt_" + type + "_" + currentUser.email.toLowerCase();
}

// Safely read JSON from localStorage
function readJSON(key, fallback) {
    try {
        const value = localStorage.getItem(key);
        return value ? JSON.parse(value) : fallback;
    } catch (error) {
        console.error("Could not read saved data:", error);
        return fallback;
    }
}

// Save JSON to localStorage
function saveJSON(key, value) {
    try {
        localStorage.setItem(key, JSON.stringify(value));
        return true;
    } catch (error) {
        console.error("Could not save data:", error);
        alert("Your browser could not save the data. Check its storage settings.");
        return false;
    }
}

// User account helpers
function getUsers() {
    return readJSON(USERS_KEY, []);
}

function saveUsers(users) {
    return saveJSON(USERS_KEY, users);
}

// Show the correct page
function showPage(pageName) {
    ["loginPage", "signupPage", "dashboard"].forEach(function (id) {
        const element = getElement(id);

        if (element) {
            element.classList.add("hidden");
        }
    });

    const selectedPage = getElement(pageName);

    if (selectedPage) {
        selectedPage.classList.remove("hidden");
    }
}

// =====================================
// SIGN UP
// =====================================

function register(event) {
    event.preventDefault();

    const name = getElement("signupName").value.trim();
    const studentNumber = getElement("signupStudentNumber").value.trim();
    const email = getElement("signupEmail").value.trim().toLowerCase();
    const password = getElement("signupPassword").value;
    const confirmPassword = getElement("confirmPassword").value;

    if (!name || !studentNumber || !email || !password) {
        alert("Please complete all the fields.");
        return;
    }

    if (password.length < 8) {
        alert("Your password must contain at least 8 characters.");
        return;
    }

    if (password !== confirmPassword) {
        alert("The passwords do not match.");
        return;
    }

    const users = getUsers();

    const emailExists = users.some(function (user) {
        return user.email.toLowerCase() === email;
    });

    if (emailExists) {
        alert("An account with this email already exists.");
        return;
    }

    const studentExists = users.some(function (user) {
        return user.studentNumber.toLowerCase() ===
            studentNumber.toLowerCase();
    });

    if (studentExists) {
        alert("This student number is already registered.");
        return;
    }

    // DEMO ONLY: passwords are stored locally and are not encrypted.
    // Do not use real passwords or personal information with this demo.
    const newUser = {
        name: name,
        studentNumber: studentNumber,
        email: email,
        password: password
    };

    users.push(newUser);

    if (!saveUsers(users)) {
        return;
    }

    getElement("signupForm").reset();
    getElement("loginEmail").value = email;

    showPage("loginPage");
    alert("Account created successfully. You can now log in.");
}

// =====================================
// LOG IN
// =====================================

function login(event) {
    event.preventDefault();

    const email = getElement("loginEmail").value.trim().toLowerCase();
    const password = getElement("loginPassword").value;

    const user = getUsers().find(function (savedUser) {
        return savedUser.email.toLowerCase() === email &&
            savedUser.password === password;
    });

    if (!user) {
        alert("Incorrect email or password.");
        return;
    }

    currentUser = {
        name: user.name,
        studentNumber: user.studentNumber,
        email: user.email
    };

    try {
        sessionStorage.setItem(SESSION_KEY, currentUser.email);
    } catch (error) {
        console.error("Could not save the session:", error);
    }

    getElement("loginForm").reset();
    openDashboard();
}

// =====================================
// LOG OUT
// =====================================

function logout() {
    currentUser = null;

    try {
        sessionStorage.removeItem(SESSION_KEY);
    } catch (error) {
        console.error("Could not clear the session:", error);
    }

    latestBudget = null;

    if (budgetChart) {
        budgetChart.destroy();
        budgetChart = null;
    }

    showPage("loginPage");
}

// =====================================
// OPEN DASHBOARD
// =====================================

function openDashboard() {
    if (!currentUser) {
        showPage("loginPage");
        return;
    }

    showPage("dashboard");

    setText("welcomeMessage", "Welcome, " + currentUser.name + "!");

    latestBudget = null;

    loadSavedBudget();
    loadDashboard();
    loadTransactions();
    loadNotifications();
    displayBudgetReport();
}

// =====================================
// BUDGET CALCULATOR
// =====================================

function calculateBudget(event) {
    event.preventDefault();

    if (!currentUser) {
        alert("Please log in first.");
        return;
    }

    const income = Number(getElement("income").value);
    const food = Number(getElement("food").value);
    const transport = Number(getElement("transport").value);
    const accommodation = Number(getElement("accommodation").value);
    const books = Number(getElement("books").value);
    const entertainment = Number(getElement("entertainment").value);

    const values = [
        income,
        food,
        transport,
        accommodation,
        books,
        entertainment
    ];

    if (!values.every(Number.isFinite)) {
        alert("Please enter valid numbers.");
        return;
    }

    if (income <= 0) {
        alert("Monthly income must be greater than zero.");
        return;
    }

    if (values.slice(1).some(function (value) {
        return value < 0;
    })) {
        alert("Expenses cannot be negative.");
        return;
    }

    const totalExpenses =
        food + transport + accommodation + books + entertainment;

    const remainingBalance = income - totalExpenses;

    let status;

    if (remainingBalance < 0) {
        status = "Over Budget";
    } else if (remainingBalance === 0) {
        status = "Fully Spent";
    } else {
        status = "Within Budget";
    }

    latestBudget = {
        date: new Date().toISOString(),
        income: income,
        food: food,
        transport: transport,
        accommodation: accommodation,
        books: books,
        entertainment: entertainment,
        totalExpenses: totalExpenses,
        remainingBalance: remainingBalance,
        status: status
    };

    // Save the latest budget
    if (!saveJSON(userStorageKey("budget"), latestBudget)) {
        latestBudget = null;
        return;
    }

    // Save a history record
    const transactions = getTransactions();

    transactions.unshift(latestBudget);

    // Keep the most recent 50 records
    if (transactions.length > 50) {
        transactions.length = 50;
    }

    if (!saveJSON(userStorageKey("history"), transactions)) {
        return;
    }

    displayBudgetResult();
    updateBudgetChart();
    loadDashboard();
    loadTransactions();
    loadNotifications();
    displayBudgetReport();

    setText("chartMessage", "Your graph has been updated.");

    const resultBox = getElement("budgetResult");

    if (resultBox) {
        resultBox.classList.remove("hidden");
    }
}

// =====================================
// DISPLAY BUDGET RESULT
// =====================================

function displayBudgetResult() {
    if (!latestBudget) {
        return;
    }

    setText("totalExpenses", money(latestBudget.totalExpenses));
    setText("remainingBalance", money(latestBudget.remainingBalance));
    setText("budgetStatus", latestBudget.status);

    const resultBox = getElement("budgetResult");

    if (resultBox) {
        resultBox.classList.remove("hidden");
    }
}

// =====================================
// LOAD SAVED BUDGET
// =====================================

function loadSavedBudget() {
    if (!currentUser) {
        return;
    }

    latestBudget = readJSON(userStorageKey("budget"), null);

    if (!latestBudget) {
        setText("chartMessage", "Calculate your budget to display your graph.");
        setText("healthMessage", "Calculate your budget to see your overview.");
        setText("budgetAdvice", "Your budget advice will appear here.");
        setText("expenseRate", "Expense rate: 0%");
        setText("dashboardStatus", "Not calculated");
        setText("dashboardIncome", money(0));
        setText("dashboardExpenses", money(0));
        setText("dashboardBalance", money(0));
        setText("totalExpenses", money(0));
        setText("remainingBalance", money(0));
        setText("budgetStatus", "-");

        const resultBox = getElement("budgetResult");

        if (resultBox) {
            resultBox.classList.add("hidden");
        }

        updateBudgetChart();
        return;
    }

    getElement("income").value = latestBudget.income;
    getElement("food").value = latestBudget.food;
    getElement("transport").value = latestBudget.transport;
    getElement("accommodation").value = latestBudget.accommodation;
    getElement("books").value = latestBudget.books;
    getElement("entertainment").value = latestBudget.entertainment;

    displayBudgetResult();

    setText("chartMessage", "Showing your saved budget.");
    updateBudgetChart();
}

// =====================================
// BUDGET GRAPH - CHART.JS
// =====================================

function updateBudgetChart() {
    const canvas = getElement("budgetChart");

    if (!canvas) {
        console.error("Graph error: canvas #budgetChart was not found.");
        return;
    }

    // Destroy the previous graph before creating a new one
    if (budgetChart) {
        budgetChart.destroy();
        budgetChart = null;
    }

    if (typeof Chart === "undefined") {
        setText(
            "chartMessage",
            "Chart.js could not load. Check your internet connection."
        );

        console.error("Chart.js is not loaded.");
        return;
    }

    if (!latestBudget) {
        return;
    }

    const darkMode = document.body.classList.contains("dark-mode");
    const textColor = darkMode ? "#edf2f7" : "#243044";
    const gridColor = darkMode ? "#354258" : "#dce3ec";

    budgetChart = new Chart(canvas, {
        type: "bar",

        data: {
            labels: [
                "Income",
                "Food",
                "Transport",
                "Accommodation",
                "Books",
                "Entertainment",
                "Total Expenses",
                "Balance"
            ],

            datasets: [{
                label: "Amount (R)",
                data: [
                    latestBudget.income,
                    latestBudget.food,
                    latestBudget.transport,
                    latestBudget.accommodation,
                    latestBudget.books,
                    latestBudget.entertainment,
                    latestBudget.totalExpenses,
                    latestBudget.remainingBalance
                ],

                backgroundColor: [
                    "#0077cc",
                    "#e6a23c",
                    "#20a4a4",
                    "#8e63ce",
                    "#d96b8a",
                    "#7b9f35",
                    "#d9534f",
                    "#16803c"
                ],

                borderWidth: 1,
                borderRadius: 5
            }]
        },

        options: {
            responsive: true,
            maintainAspectRatio: false,

            plugins: {
                legend: {
                    labels: {
                        color: textColor
                    }
                },

                tooltip: {
                    callbacks: {
                        label: function (context) {
                            return context.dataset.label + ": " +
                                money(context.parsed.y);
                        }
                    }
                }
            },

            scales: {
                x: {
                    ticks: {
                        color: textColor,
                        maxRotation: 45,
                        minRotation: 0
                    },

                    grid: {
                        color: gridColor
                    }
                },

                y: {
                    beginAtZero: true,

                    ticks: {
                        color: textColor,

                        callback: function (value) {
                            return "R" + Number(value).toLocaleString("en-ZA");
                        }
                    },

                    grid: {
                        color: gridColor
                    }
                }
            }
        }
    });
}

// =====================================
// DASHBOARD AND FINANCIAL OVERVIEW
// =====================================

function loadDashboard() {
    if (!currentUser) {
        return;
    }

    if (!latestBudget) {
        setText("dashboardIncome", money(0));
        setText("dashboardExpenses", money(0));
        setText("dashboardBalance", money(0));
        setText("dashboardStatus", "Not calculated");
        setText("healthMessage", "Calculate your budget to see your overview.");
        setText("budgetAdvice", "Your budget advice will appear here.");
        setText("expenseRate", "Expense rate: 0%");

        const progress = getElement("expenseProgress");

        if (progress) {
            progress.style.width = "0%";
        }

        return;
    }

    const budget = latestBudget;
    const expenseRate = (budget.totalExpenses / budget.income) * 100;
    const progressWidth = Math.min(expenseRate, 100);

    setText("dashboardIncome", money(budget.income));
    setText("dashboardExpenses", money(budget.totalExpenses));
    setText("dashboardBalance", money(budget.remainingBalance));
    setText("dashboardStatus", budget.status);

    setText(
        "healthMessage",
        budget.remainingBalance < 0
            ? "Your expenses are higher than your income."
            : budget.remainingBalance === 0
                ? "You have used your entire budget."
                : "You still have money remaining after your expenses."
    );

    setText("expenseRate", "Expense rate: " + expenseRate.toFixed(1) + "%");

    const progress = getElement("expenseProgress");

    if (progress) {
        progress.style.width = progressWidth + "%";

        if (expenseRate > 100) {
            progress.style.backgroundColor = "#c62828";
        } else if (expenseRate >= 80) {
            progress.style.backgroundColor = "#e6a23c";
        } else {
            progress.style.backgroundColor = "#16803c";
        }
    }

    let advice;

    if (budget.remainingBalance < 0) {
        advice = "Your expenses exceed your income. Review optional spending and look for expenses you can reduce.";
    } else if (budget.remainingBalance === 0) {
        advice = "Your full income is allocated. Review your expenses to see whether you can leave room for unexpected costs.";
    } else if (expenseRate >= 80) {
        advice = "You have a remaining balance, but most of your income is already allocated. Plan carefully for unexpected costs.";
    } else {
        advice = "Your expenses are below your income. Consider setting aside part of your remaining balance for future needs.";
    }

    setText("budgetAdvice", advice);
}

// =====================================
// TRANSACTION / BUDGET HISTORY
// =====================================

function getTransactions() {
    if (!currentUser) {
        return [];
    }

    return readJSON(userStorageKey("history"), []);
}

function loadTransactions() {
    const tableBody = getElement("transactionList");

    if (!tableBody) {
        return;
    }

    tableBody.replaceChildren();

    const transactions = getTransactions();

    if (transactions.length === 0) {
        const row = document.createElement("tr");
        const cell = document.createElement("td");

        cell.colSpan = 4;
        cell.textContent = "No budget history yet.";

        row.appendChild(cell);
        tableBody.appendChild(row);
        return;
    }

    transactions.forEach(function (transaction) {
        const row = document.createElement("tr");

        const dateCell = document.createElement("td");
        const incomeCell = document.createElement("td");
        const expensesCell = document.createElement("td");
        const balanceCell = document.createElement("td");

        dateCell.textContent = new Date(transaction.date).toLocaleString();
        incomeCell.textContent = money(transaction.income);
        expensesCell.textContent = money(transaction.totalExpenses);
        balanceCell.textContent = money(transaction.remainingBalance);

        row.append(
            dateCell,
            incomeCell,
            expensesCell,
            balanceCell
        );

        tableBody.appendChild(row);
    });
}

function clearHistory() {
    if (!currentUser) {
        return;
    }

    const confirmed = confirm(
        "Are you sure you want to delete your budget history?"
    );

    if (!confirmed) {
        return;
    }

    if (!saveJSON(userStorageKey("history"), [])) {
        return;
    }

    loadTransactions();
    alert("Budget history cleared.");
}

// =====================================
// NOTIFICATIONS
// =====================================

function loadNotifications() {
    const list = getElement("notificationList");

    if (!list) {
        return;
    }

    list.replaceChildren();

    const messages = [];

    if (!latestBudget) {
        messages.push("Enter your income and expenses to begin.");
    } else {
        if (latestBudget.remainingBalance < 0) {
            messages.push("Warning: your expenses exceed your income.");
        } else if (latestBudget.remainingBalance === 0) {
            messages.push("Your full income has been allocated.");
        } else {
            messages.push(
                "You have " + money(latestBudget.remainingBalance) +
                " remaining."
            );
        }

        if (latestBudget.totalExpenses > 0) {
            messages.push(
                "Your largest expense is " +
                getLargestExpense(latestBudget) + "."
            );
        }
    }

    messages.forEach(function (message) {
        const item = document.createElement("li");
        item.textContent = message;
        list.appendChild(item);
    });
}

function getLargestExpense(budget) {
    const categories = [
        { name: "Food", amount: budget.food },
        { name: "Transport", amount: budget.transport },
        { name: "Accommodation", amount: budget.accommodation },
        { name: "Books and stationery", amount: budget.books },
        { name: "Entertainment", amount: budget.entertainment }
    ];

    categories.sort(function (a, b) {
        return b.amount - a.amount;
    });

    return categories[0].name;
}

// =====================================
// PDF REPORT
// =====================================

function displayBudgetReport() {
    const message = latestBudget
        ? "Your latest budget is ready to download."
        : "Calculate a budget before downloading a report.";

    setText("reportMessage", message);
}

function downloadPDF() {
    if (!latestBudget || !currentUser) {
        alert("Please calculate a budget before downloading a report.");
        return;
    }

    if (!window.jspdf || !window.jspdf.jsPDF) {
        alert("The PDF library could not load. Check your internet connection.");
        return;
    }

    const jsPDF = window.jspdf.jsPDF;
    const doc = new jsPDF();
    const budget = latestBudget;

    doc.setFontSize(20);
    doc.text("Student Budget Tracker", 20, 20);

    doc.setFontSize(12);
    doc.text("Budget Report", 20, 32);
    doc.text("Student: " + currentUser.name, 20, 44);
    doc.text("Student number: " + currentUser.studentNumber, 20, 54);
    doc.text(
        "Date: " + new Date(budget.date).toLocaleString(),
        20,
        64
    );

    const lines = [
        ["Monthly income", budget.income],
        ["Food", budget.food],
        ["Transport", budget.transport],
        ["Accommodation", budget.accommodation],
        ["Books and stationery", budget.books],
        ["Entertainment", budget.entertainment],
        ["Total expenses", budget.totalExpenses],
        ["Remaining balance", budget.remainingBalance]
    ];

    let y = 82;

    lines.forEach(function (line) {
        doc.text(line[0] + ": " + money(line[1]), 20, y);
        y += 10;
    });

    doc.text("Budget status: " + budget.status, 20, y + 5);

    doc.save("student-budget-report.pdf");

    setText("reportMessage", "Your PDF report has been generated.");
}

// =====================================
// DARK MODE
// =====================================

function applyTheme(theme) {
    const darkMode = theme === "dark";

    document.body.classList.toggle("dark-mode", darkMode);

    setText(
        "darkModeBtn",
        darkMode ? "☀️ Light Mode" : "🌙 Dark Mode"
    );

    // Update graph colours after changing theme
    if (latestBudget) {
        updateBudgetChart();
    }
}

function toggleDarkMode() {
    const currentlyDark = document.body.classList.contains("dark-mode");
    const newTheme = currentlyDark ? "light" : "dark";

    try {
        localStorage.setItem(THEME_KEY, newTheme);
    } catch (error) {
        console.error("Could not save theme:", error);
    }

    applyTheme(newTheme);
}

// =====================================
// PASSWORD VISIBILITY
// =====================================

function setupPasswordVisibility() {
    const loginToggle = getElement("showLoginPassword");
    const loginPassword = getElement("loginPassword");

    if (loginToggle && loginPassword) {
        loginToggle.addEventListener("change", function () {
            loginPassword.type = this.checked ? "text" : "password";
        });
    }

    const signupToggle = getElement("showSignupPassword");
    const signupPassword = getElement("signupPassword");
    const confirmPassword = getElement("confirmPassword");

    if (signupToggle && signupPassword && confirmPassword) {
        signupToggle.addEventListener("change", function () {
            const type = this.checked ? "text" : "password";

            signupPassword.type = type;
            confirmPassword.type = type;
        });
    }
}

// =====================================
// EVENT LISTENERS AND STARTUP
// =====================================

document.addEventListener("DOMContentLoaded", function () {
    setText("currentYear", new Date().getFullYear());

    // Forms
    getElement("loginForm").addEventListener("submit", login);
    getElement("signupForm").addEventListener("submit", register);
    getElement("budgetForm").addEventListener("submit", calculateBudget);

    // Navigation
    getElement("showSignupBtn").addEventListener("click", function () {
        showPage("signupPage");
    });

    getElement("showLoginBtn").addEventListener("click", function () {
        showPage("loginPage");
    });

    getElement("logoutBtn").addEventListener("click", logout);

    // Other buttons
    getElement("darkModeBtn").addEventListener("click", toggleDarkMode);
    getElement("clearHistoryBtn").addEventListener("click", clearHistory);
    getElement("downloadPDFBtn").addEventListener("click", downloadPDF);

    // Clear only the form fields when Reset is clicked.
    // The last saved calculation remains available.
    getElement("budgetForm").addEventListener("reset", function () {
        setTimeout(function () {
            getElement("budgetResult").classList.add("hidden");
        }, 0);
    });

    setupPasswordVisibility();

    // Load saved theme
    let savedTheme = "light";

    try {
        savedTheme = localStorage.getItem(THEME_KEY) || "light";
    } catch (error) {
        console.error("Could not load theme:", error);
    }

    applyTheme(savedTheme);

    // Restore this browser tab's session if possible
    let savedEmail = null;

    try {
        savedEmail = sessionStorage.getItem(SESSION_KEY);
    } catch (error) {
        console.error("Could not restore session:", error);
    }

    if (savedEmail) {
        const user = getUsers().find(function (savedUser) {
            return savedUser.email.toLowerCase() ===
                savedEmail.toLowerCase();
        });

        if (user) {
            currentUser = {
                name: user.name,
                studentNumber: user.studentNumber,
                email: user.email
            };

            openDashboard();
            return;
        }
    }

    showPage("loginPage");
});
