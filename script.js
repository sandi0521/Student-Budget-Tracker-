// ==========================================
// Student Budget Tracker Version 5.0
// Part 1 - Authentication
// ==========================================

// ==========================
// SHOW / HIDE PASSWORD
// ==========================

function togglePassword(inputId, button) {

    const input = document.getElementById(inputId);

    if (!input) return;

    if (input.type === "password") {
        input.type = "text";
        button.innerHTML = "🙈";
    } else {
        input.type = "password";
        button.innerHTML = "👁️";
    }
}

// ==========================
// REGISTER
// ==========================

function register() {

    const fullName = document.getElementById("fullName").value.trim();
    const studentNumber = document.getElementById("studentNumber").value.trim();
    const email = document.getElementById("email").value.trim();
    const password = document.getElementById("password").value;
    const confirmPassword = document.getElementById("confirmPassword").value;

    if (
        fullName === "" ||
        studentNumber === "" ||
        email === "" ||
        password === "" ||
        confirmPassword === ""
    ) {
        alert("Please complete all fields.");
        return;
    }

    if (password !== confirmPassword) {
        alert("Passwords do not match.");
        return;
    }

    localStorage.setItem("fullName", fullName);
    localStorage.setItem("studentNumber", studentNumber);
    localStorage.setItem("email", email);
    localStorage.setItem("password", password);

    alert("Account created successfully!");

    window.location.href = "index.html";
}

// ==========================
// LOGIN
// ==========================

function login() {

    const studentNumber = document.getElementById("loginStudentNumber").value.trim();
    const password = document.getElementById("loginPassword").value;

    const savedStudent = localStorage.getItem("studentNumber");
    const savedPassword = localStorage.getItem("password");

    if (studentNumber === savedStudent && password === savedPassword) {

        alert("Login Successful!");

        window.location.href = "dashboard.html";

    } else {

        alert("Invalid Student Number or Password.");

    }
}

// ==========================
// LOGOUT
// ==========================

function logout() {

    if (confirm("Are you sure you want to logout?")) {

        window.location.href = "index.html";

    }
}
// ==========================================
// PART 2 - BUDGET CALCULATOR
// ==========================================

function calculateBudget() {

    // Get values from the form
    const income = Number(document.getElementById("income").value) || 0;
    const food = Number(document.getElementById("food").value) || 0;
    const transport = Number(document.getElementById("transport").value) || 0;
    const accommodation = Number(document.getElementById("accommodation").value) || 0;
    const books = Number(document.getElementById("books").value) || 0;
    const entertainment = Number(document.getElementById("entertainment").value) || 0;

    // Validate income
    if (income <= 0) {
        alert("Please enter a valid monthly income.");
        return;
    }

    // Calculate totals
    const totalExpenses =
        food +
        transport +
        accommodation +
        books +
        entertainment;

    const remainingBalance = income - totalExpenses;

    // Save data
    localStorage.setItem("income", income);
    localStorage.setItem("totalExpenses", totalExpenses);
    localStorage.setItem("remainingBalance", remainingBalance);

    // Show results on budget.html
    document.getElementById("totalExpenses").innerHTML =
        "R" + totalExpenses.toFixed(2);

    document.getElementById("remainingBalance").innerHTML =
        "R" + remainingBalance.toFixed(2);

    if (remainingBalance >= 0) {
        document.getElementById("budgetStatus").innerHTML =
            "✅ Within Budget";
    } else {
        document.getElementById("budgetStatus").innerHTML =
            "❌ Over Budget";
    }
updateBudgetChart(
    income,
    food,
    transport,
    accommodation,
    books,
    entertainment,
    totalExpenses,
    remainingBalance
);
    alert("Budget calculated successfully!");
}
// ==========================================
// PART 3 - DASHBOARD
// ==========================================

function loadDashboard() {

    const name = localStorage.getItem("fullName") || "Student";
    const income = Number(localStorage.getItem("income")) || 0;
    const expenses = Number(localStorage.getItem("totalExpenses")) || 0;
    const balance = Number(localStorage.getItem("remainingBalance")) || 0;

    // Welcome Message
    if (document.getElementById("welcomeUser")) {
        document.getElementById("welcomeUser").innerHTML =
            "Welcome, " + name + " 👋";
    }

    // Dashboard Cards
    if (document.getElementById("dashIncome")) {
        document.getElementById("dashIncome").innerHTML =
            "R" + income.toFixed(2);
    }

    if (document.getElementById("dashExpenses")) {
        document.getElementById("dashExpenses").innerHTML =
            "R" + expenses.toFixed(2);
    }

    if (document.getElementById("dashBalance")) {
        document.getElementById("dashBalance").innerHTML =
            "R" + balance.toFixed(2);

        document.getElementById("dashBalance").style.color =
            balance >= 0 ? "green" : "red";
    }

    // Financial Health
    let health = 100;
    let status = "🟢 Excellent";

    if (income <= 0) {
        health = 0;
        status = "⚫ No Income";
    } else if (balance < 0) {
        health = 0;
        status = "🔴 Critical";
    } else {
        const percentage = (balance / income) * 100;

        if (percentage >= 50) {
            health = 100;
            status = "🟢 Excellent";
        } else if (percentage >= 20) {
            health = 75;
            status = "🟡 Good";
        } else if (percentage > 0) {
            health = 50;
            status = "🟠 Fair";
        } else {
            health = 25;
            status = "🔴 Poor";
        }
    }

    if (document.getElementById("healthScore")) {
        document.getElementById("healthScore").innerHTML = health + "%";
    }

    if (document.getElementById("healthStatus")) {
        document.getElementById("healthStatus").innerHTML = status;
    }

    // Rates
    if (income > 0) {

        if (document.getElementById("savingRate")) {
            document.getElementById("savingRate").innerHTML =
                ((balance / income) * 100).toFixed(1) + "%";
        }

        if (document.getElementById("spendingRate")) {
            document.getElementById("spendingRate").innerHTML =
                ((expenses / income) * 100).toFixed(1) + "%";
        }
    }

    // Advice
    if (document.getElementById("dashboardAdvice")) {

        if (balance >= 0) {
            document.getElementById("dashboardAdvice").innerHTML =
                "✅ Great! Keep saving every month.";
        } else {
            document.getElementById("dashboardAdvice").innerHTML =
                "⚠ You are spending more than your income.";
        }
    }

    // Progress Bar
    if (document.getElementById("budgetProgress")) {

        let progress = income > 0 ? (expenses / income) * 100 : 0;

        if (progress > 100) {
            progress = 100;
        }

        document.getElementById("budgetProgress").style.width =
            progress + "%";

        if (document.getElementById("progressText")) {
            document.getElementById("progressText").innerHTML =
                progress.toFixed(0) + "%";
        }
    }
}
document.addEventListener("DOMContentLoaded", function () {
    if (document.getElementById("welcomeUser")) {
        loadDashboard();
    }
});
function downloadPDF() {

    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();

    // Get stored values
    const name = localStorage.getItem("fullName") || "Student";
    const income = localStorage.getItem("income") || "0";
    const expenses = localStorage.getItem("totalExpenses") || "0";
    const balance = localStorage.getItem("remainingBalance") || "0";

    // Budget Status
    let status = Number(balance) >= 0 ? "Within Budget" : "Over Budget";

    // PDF Title
    doc.setFontSize(18);
    doc.text("Student Budget Tracker", 20, 20);

    doc.setFontSize(14);
    doc.text("Budget Report", 20, 30);

    // User Details
    doc.setFontSize(12);
    doc.text("Student: " + name, 20, 45);
    doc.text("Income: R" + income, 20, 55);
    doc.text("Expenses: R" + expenses, 20, 65);
    doc.text("Balance: R" + balance, 20, 75);
    doc.text("Status: " + status, 20, 85);

    doc.save("Student Budget Trackr_Report.pdf");
}
document.getElementById("reportIncome").innerHTML =
    "R" + (Number(localStorage.getItem("income")) || 0).toFixed(2);

document.getElementById("reportExpenses").innerHTML =
    "R" + (Number(localStorage.getItem("totalExpenses")) || 0).toFixed(2);

document.getElementById("reportBalance").innerHTML =
    "R" + (Number(localStorage.getItem("remainingBalance")) || 0).toFixed(2);
// ==========================
// STUDENT BUDGET TRACKER AI
// ==========================

function askAI() {
    const questionElement = document.getElementById("question");

    if (!questionElement) {
        alert("AI question field not found.");
        return;
    }

    const question = questionElement.value.trim();
    let answer = "";

    switch (question) {
        case "save":
        case "How can I save more money?":
            answer = "💰 Save at least 10% of your monthly income before spending.";
            break;

        case "food":
        case "How do I reduce food expenses?":
            answer = "🍽️ Plan your meals, cook at home, and avoid buying unnecessary snacks.";
            break;

        case "transport":
        case "How can I lower transport costs?":
            answer = "🚌 Use public transport, walk when possible, or share rides with classmates.";
            break;

        case "budget":
            answer = "📊 Review your expenses and reduce unnecessary spending.";
            break;

        default:
            answer = "🤖 Please choose a budgeting question first.";
    }

    const responseElement =
        document.getElementById("aiAnswer") ||
        document.getElementById("aiResponse");

    if (responseElement) {
        responseElement.textContent = answer;
    }
}
// ==========================
// Student Budget Tracker AI
// ==========================
// ==========================================
// PART 4 - DARK MODE
// ==========================================

function applyTheme() {

    const darkModeEnabled =
        localStorage.getItem("darkMode") === "true";

    document.body.classList.toggle(
        "dark-mode",
        darkModeEnabled
    );

    const themeButton = document.getElementById("themeToggle");

    if (themeButton) {
        themeButton.textContent = darkModeEnabled
            ? "☀️ Enable Light Mode"
            : "🌙 Enable Dark Mode";
    }
}

function toggleDarkMode() {

    const currentlyDark =
        document.body.classList.contains("dark-mode");

    localStorage.setItem(
        "darkMode",
        String(!currentlyDark)
    );

    applyTheme();
}


// ==========================================
// PART 5 - NOTIFICATION CENTRE
// ==========================================

function getNotifications() {

    try {

        const saved = localStorage.getItem("budgetNotifications");

        return saved ? JSON.parse(saved) : [];

    } catch (error) {

        console.error("Could not load notifications:", error);

        return [];

    }
}


function saveNotifications(notifications) {

    localStorage.setItem(
        "budgetNotifications",
        JSON.stringify(notifications)
    );

}


function generateBudgetNotifications() {

    const income = Number(localStorage.getItem("income")) || 0;

    const expenses =
        Number(localStorage.getItem("totalExpenses")) || 0;

    const balance =
        Number(localStorage.getItem("remainingBalance")) || 0;

    const monthKey = new Date().toISOString().slice(0, 7);

    const notifications = [];

    if (income <= 0) {

        notifications.push({
            id: "no-income-" + monthKey,
            title: "💰 Set Your Monthly Income",
            message: "Enter your monthly income to start tracking your budget.",
            read: false
        });

    } else {

        const spendingRate = (expenses / income) * 100;

        if (balance < 0) {

            notifications.push({
                id: "over-budget-" + monthKey,
                title: "⚠️ Budget Alert",
                message: "Your expenses exceed your income. Review your spending.",
                read: false
            });

        } else if (spendingRate >= 80) {

            notifications.push({
                id: "high-spending-" + monthKey,
                title: "🔔 Spending Alert",
                message: "You have used at least 80% of your monthly income.",
                read: false
            });

        } else {

            notifications.push({
                id: "budget-ok-" + monthKey,
                title: "✅ Budget Update",
                message: "Your current expenses are within your income.",
                read: false
            });

        }

        if (balance > 0) {

            notifications.push({
                id: "save-" + monthKey,
                title: "💵 Savings Reminder",
                message: "Your remaining balance is R" +
                    balance.toFixed(2) +
                    ". Consider saving some of it.",
                read: false
            });

        }

    }

    // Keep read status for notifications that already existed.
    const oldNotifications = getNotifications();

    const updatedNotifications = notifications.map(notification => {

        const existing = oldNotifications.find(
            item => item.id === notification.id
        );

        if (existing) {
            notification.read = existing.read;
        }

        return notification;

    });

    saveNotifications(updatedNotifications);

}


function displayNotifications() {

    const notificationList =
        document.getElementById("notificationList");

    const notificationCount =
        document.getElementById("notificationCount");

    if (!notificationList || !notificationCount) {
        return;
    }

    const notifications = getNotifications();

    const unreadCount = notifications.filter(
        notification => !notification.read
    ).length;

    notificationCount.textContent = unreadCount;

    if (notifications.length === 0) {

        notificationList.innerHTML =
            "<p>You're all caught up! 🎉</p>";

        return;

    }

    notificationList.innerHTML = "";

    notifications.forEach(notification => {

        const item = document.createElement("div");

        item.className = "notification-item " +
            (notification.read ? "read" : "unread");

        const title = document.createElement("strong");
        title.textContent = notification.title;

        const message = document.createElement("p");
        message.textContent = notification.message;

        item.appendChild(title);
        item.appendChild(message);

        notificationList.appendChild(item);

    });

}


function markNotificationsRead() {

    const notifications = getNotifications();

    notifications.forEach(notification => {
        notification.read = true;
    });

    saveNotifications(notifications);

    displayNotifications();

}


function clearNotifications() {

    if (!confirm("Are you sure you want to clear all notifications?")) {
        return;
    }

    saveNotifications([]);

    displayNotifications();

}


// ==========================================
// PART 6 - INITIALISE DASHBOARD FEATURES
// ==========================================

document.addEventListener("DOMContentLoaded", function () {

    applyTheme();

    if (document.getElementById("notificationList")) {

        generateBudgetNotifications();

        displayNotifications();

    }

});
// ==========================================
// PART 7 - TRANSACTION HISTORY
// ==========================================

// Get saved transactions
function getTransactions() {
    try {
        return JSON.parse(
            localStorage.getItem("budgetTransactions")
        ) || [];
    } catch (error) {
        console.error("Error loading transactions:", error);
        return [];
    }
}

// Save transactions
function saveTransactions(transactions) {
    localStorage.setItem(
        "budgetTransactions",
        JSON.stringify(transactions)
    );
}

// Add a new transaction
function addTransaction() {

    const typeElement = document.getElementById("transactionType");
    const descriptionElement = document.getElementById("transactionDescription");
    const amountElement = document.getElementById("transactionAmount");
    const dateElement = document.getElementById("transactionDate");

    if (!typeElement || !descriptionElement || !amountElement || !dateElement) {
        alert("Transaction form elements are missing from your HTML.");
        return;
    }

    const type = typeElement.value;
    const description = descriptionElement.value.trim();
    const amount = Number(amountElement.value);
    const date = dateElement.value;

    if (!description) {
        alert("Please enter a transaction description.");
        return;
    }

    if (!Number.isFinite(amount) || amount <= 0) {
        alert("Please enter an amount greater than zero.");
        return;
    }

    if (!date || Number.isNaN(Date.parse(date))) {
        alert("Please select a valid transaction date.");
        return;
    }

    if (type !== "income" && type !== "expense") {
        alert("Please select income or expense.");
        return;
    }

    const transaction = {
        id: Date.now().toString() + Math.random().toString(36).slice(2),
        type: type,
        description: description,
        amount: amount,
        date: date
    };

    const transactions = getTransactions();

    transactions.push(transaction);

    saveTransactions(transactions);

displayTransactions();

updateTransactionDashboard();

    // Clear the form
    descriptionElement.value = "";
    amountElement.value = "";

    alert("Transaction added successfully! ✅");
}

// Display transaction history
function displayTransactions() {

    const transactionList = document.getElementById("transactionList");

    if (!transactionList) {
        return;
    }

    const transactions = getTransactions();

    // Newest transactions first
    transactions.sort((a, b) => {
        return new Date(b.date) - new Date(a.date) ||
            b.id.localeCompare(a.id);
    });

    transactionList.innerHTML = "";

    if (transactions.length === 0) {
        transactionList.innerHTML =
            "<p>No transactions recorded yet.</p>";
        return;
    }

    transactions.forEach(transaction => {

        const item = document.createElement("div");
        item.className = "transaction-item";

        const details = document.createElement("div");

        const description = document.createElement("strong");
        description.textContent = transaction.description;

        const date = document.createElement("p");
        date.textContent = transaction.date;

        const amount = document.createElement("p");
        amount.textContent =
            (transaction.type === "income" ? "+ R" : "- R") +
            Number(transaction.amount).toFixed(2);

        amount.className =
            transaction.type === "income"
                ? "transaction-income"
                : "transaction-expense";

        const deleteButton = document.createElement("button");
        deleteButton.textContent = "Delete";
        deleteButton.type = "button";

        deleteButton.addEventListener("click", function () {
            deleteTransaction(transaction.id);
        });

        details.appendChild(description);
        details.appendChild(date);
        details.appendChild(amount);

        item.appendChild(details);
        item.appendChild(deleteButton);

        transactionList.appendChild(item);
    });
}

// Delete a transaction
function deleteTransaction(id) {

    if (!confirm("Are you sure you want to delete this transaction?")) {
        return;
    }

    const transactions = getTransactions().filter(
        transaction => transaction.id !== id
    );

    saveTransactions(transactions);

displayTransactions();

updateTransactionDashboard();

    alert("Transaction deleted successfully.");
}

// ==========================================
// INITIALISE TRANSACTION HISTORY
// ==========================================

document.addEventListener("DOMContentLoaded", function () {

    if (document.getElementById("transactionList")) {
        displayTransactions();
    }

    updateTransactionDashboard();

});
// ==========================================
// UPDATE TRANSACTION SUMMARY
// ==========================================

function updateTransactionDashboard() {

    const transactions = getTransactions();

    let totalIncome = 0;
    let totalExpenses = 0;

    transactions.forEach(function(transaction) {

        const amount = Number(transaction.amount);

        if (!Number.isFinite(amount) || amount <= 0) {
            return;
        }

        if (transaction.type === "income") {
            totalIncome += amount;
        }

        if (transaction.type === "expense") {
            totalExpenses += amount;
        }

    });

    const balance = totalIncome - totalExpenses;

    // Update summary cards
    const incomeCard =
        document.getElementById("transactionTotalIncome");

    const expensesCard =
        document.getElementById("transactionTotalExpenses");

    const balanceCard =
        document.getElementById("transactionTotalBalance");

    if (incomeCard) {
        incomeCard.textContent =
            "R" + totalIncome.toFixed(2);
    }

    if (expensesCard) {
        expensesCard.textContent =
            "R" + totalExpenses.toFixed(2);
    }

    if (balanceCard) {
        balanceCard.textContent =
            "R" + balance.toFixed(2);
    }

    // Save calculated totals
    localStorage.setItem("transactionIncome", totalIncome);
    localStorage.setItem("transactionExpenses", totalExpenses);
    localStorage.setItem("transactionBalance", balance);

    console.log("Transactions:", transactions);
    console.log("Total income:", totalIncome);
    console.log("Total expenses:", totalExpenses);
    console.log("Balance:", balance);
}

let budgetChartInstance = null;

function updateBudgetChart(
    income,
    food,
    transport,
    accommodation,
    books,
    entertainment,
    totalExpenses,
    remainingBalance
) {
    const canvas = document.getElementById("budgetChart");

    if (!canvas || typeof Chart === "undefined") {
        return;
    }

    if (budgetChartInstance) {
        budgetChartInstance.destroy();
    }

    budgetChartInstance = new Chart(canvas, {
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
                    income,
                    food,
                    transport,
                    accommodation,
                    books,
                    entertainment,
                    totalExpenses,
                    remainingBalance
                ],
                backgroundColor: [
                    "#2563eb",
                    "#f59e0b",
                    "#8b5cf6",
                    "#06b6d4",
                    "#ec4899",
                    "#f97316",
                    "#dc2626",
                    remainingBalance >= 0 ? "#16a34a" : "#991b1b"
                ]
            }]
        },
        options: {
            responsive: true,
            scales: {
                y: {
                    beginAtZero: true,
                    ticks: {
                        callback: value => "R" + value
                    }
                }
            }
        }
    });
}
}                
