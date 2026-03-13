/* ===== Goals Page JavaScript ===== */

// Form state
const goalsData = {
    goals: [],
    data: { expenses: [], income: [] }
};

let savingsChart = null;
let currentFilter = 'all';

// ===== Initialize on page load =====
document.addEventListener('DOMContentLoaded', function() {
    console.log('Goals Page Loaded');

    try {
        // Load data from local storage
        loadAllData();

        // Calculate financial metrics
        calculateFinancialMetrics();

        // Display overview
        displayOverview();

        // Setup goal form
        setupGoalForm();

        // Setup filter tabs
        setupFilterTabs();

        // Display goals
        displayGoals();

        // Create charts and analysis
        createSavingsChart();
        displayAffordabilityAnalysis();

        // Display key metrics
        displayKeyMetrics();

    } catch (error) {
        console.error('Initialization error:', error);
    }
});

// ===== Load All Data =====
function loadAllData() {
    try {
        const saved = localStorage.getItem('finproData');
        if (saved) {
            goalsData.data = JSON.parse(saved);
            console.log('Financial data loaded:', goalsData.data);
        }

        const goalsStored = localStorage.getItem('finproGoals');
        if (goalsStored) {
            goalsData.goals = JSON.parse(goalsStored);
            console.log('Goals loaded:', goalsData.goals);
        }
    } catch (error) {
        console.error('Error loading data:', error);
        goalsData.data = { expenses: [], income: [] };
        goalsData.goals = [];
    }
}

// ===== Calculate Financial Metrics =====
let monthlyIncome = 0;
let monthlyExpenses = 0;
let monthlySavings = 0;

function calculateFinancialMetrics() {
    try {
        const today = new Date();
        const monthAgo = new Date(today.getFullYear(), today.getMonth() - 1, today.getDate());

        const recentIncome = goalsData.data.income.filter(entry => {
            return new Date(entry.date) > monthAgo;
        });

        const recentExpenses = goalsData.data.expenses.filter(entry => {
            return new Date(entry.date) > monthAgo;
        });

        monthlyIncome = recentIncome.reduce((sum, entry) => sum + (entry.amount || 0), 0);
        monthlyExpenses = recentExpenses.reduce((sum, entry) => sum + (entry.amount || 0), 0);
        monthlySavings = monthlyIncome - monthlyExpenses;

        console.log('Financial metrics:', { monthlyIncome, monthlyExpenses, monthlySavings });
    } catch (error) {
        console.error('Error calculating metrics:', error);
        monthlyIncome = 0;
        monthlyExpenses = 0;
        monthlySavings = 0;
    }
}

// ===== Display Overview =====
function displayOverview() {
    document.getElementById('monthlyIncome').textContent = `₹${monthlyIncome.toFixed(0)}`;
    document.getElementById('monthlyExpenses').textContent = `₹${monthlyExpenses.toFixed(0)}`;
    document.getElementById('monthlySavings').textContent = `₹${monthlySavings.toFixed(0)}`;

    const savingsRate = monthlyIncome > 0 ? ((monthlySavings / monthlyIncome) * 100).toFixed(1) : 0;
    document.getElementById('savingsRate').textContent = `${savingsRate}% of income`;

    document.getElementById('activeGoals').textContent = goalsData.goals.filter(g => !g.completed).length;
}

// ===== Setup Goal Form =====
function setupGoalForm() {
    const form = document.getElementById('goalForm');

    form.addEventListener('submit', function(e) {
        e.preventDefault();

        try {
            const goal = {
                id: Date.now(),
                name: document.getElementById('goalName').value,
                icon: document.getElementById('goalIcon').value || '🎯',
                targetAmount: parseFloat(document.getElementById('targetAmount').value),
                currentAmount: parseFloat(document.getElementById('currentSavings').value) || 0,
                targetMonths: parseInt(document.getElementById('targetMonths').value),
                priority: document.getElementById('priority').value,
                category: document.getElementById('goalCategory').value || 'other',
                description: document.getElementById('goalDescription').value,
                createdDate: new Date().toISOString(),
                completed: false,
                completedDate: null
            };

            // Validate goal
            if (!goal.name || goal.targetAmount <= 0 || goal.targetMonths <= 0) {
                showError('Please fill in all required fields correctly');
                return;
            }

            // Add goal
            goalsData.goals.push(goal);
            saveGoals();

            showSuccess('Goal added successfully!');
            form.reset();
            displayGoals();
            displayOverview();
            createSavingsChart();
            displayKeyMetrics();

        } catch (error) {
            console.error('Error submitting goal form:', error);
            showError('Error adding goal');
        }
    });
}

// ===== Setup Filter Tabs =====
function setupFilterTabs() {
    document.querySelectorAll('.filter-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            currentFilter = this.getAttribute('data-filter');

            // Update active state
            document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
            this.classList.add('active');

            // Refresh display
            displayGoals();
        });
    });
}

// ===== Display Goals =====
function displayGoals() {
    const goalsGrid = document.getElementById('goalsGrid');

    let filteredGoals = goalsData.goals;

    if (currentFilter === 'active') {
        filteredGoals = goalsData.goals.filter(g => !g.completed);
    } else if (currentFilter === 'completed') {
        filteredGoals = goalsData.goals.filter(g => g.completed);
    }

    if (filteredGoals.length === 0) {
        goalsGrid.innerHTML = '<div class="no-goals"><p>🎯 No goals yet. Create your first goal above!</p></div>';
        return;
    }

    // Sort by priority and remaining time
    const priorityOrder = { high: 0, medium: 1, low: 2 };
    filteredGoals.sort((a, b) => priorityOrder[a.priority] - priorityOrder[b.priority]);

    goalsGrid.innerHTML = filteredGoals.map(goal => createGoalCard(goal)).join('');

    // Add event listeners to goal action buttons
    document.querySelectorAll('.goal-action-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            const goalId = parseInt(this.getAttribute('data-id'));
            const action = this.getAttribute('data-action');

            if (action === 'complete') {
                completeGoal(goalId);
            } else if (action === 'delete') {
                deleteGoal(goalId);
            }
        });
    });
}

function createGoalCard(goal) {
    const progressPercent = goal.targetAmount > 0 ? (goal.currentAmount / goal.targetAmount) * 100 : 0;
    const remainingAmount = Math.max(0, goal.targetAmount - goal.currentAmount);
    const createdDate = new Date(goal.createdDate);
    const daysElapsed = Math.floor((Date.now() - createdDate) / (1000 * 60 * 60 * 24));
    const daysRemaining = Math.max(0, (goal.targetMonths * 30) - daysElapsed);
    const requiredMonthly = remainingAmount > 0 ? remainingAmount / (daysRemaining / 30) : 0;

    const amountNeeded = Math.max(0, goal.targetAmount - goal.currentAmount);
    const affordability = monthlySavings > 0 ? Math.ceil(amountNeeded / monthlySavings) : Infinity;

    let affordabilityText = '⚠️ Not affordable';
    if (affordability <= goal.targetMonths) {
        affordabilityText = '✅ Likely';
    } else if (affordability <= goal.targetMonths + 3) {
        affordabilityText = '⚡ Tight';
    }

    const priorityClass = `goal-priority ${goal.priority}`;
    const priorityIcon = { high: '🔴', medium: '🟡', low: '🔵' }[goal.priority];

    const actionButtons = goal.completed 
        ? `<button class="goal-action-btn delete" data-id="${goal.id}" data-action="delete">🗑️ Delete</button>`
        : `<button class="goal-action-btn" data-id="${goal.id}" data-action="complete">✅ Mark Complete</button>
           <button class="goal-action-btn delete" data-id="${goal.id}" data-action="delete">🗑️ Delete</button>`;

    return `
        <div class="goal-card">
            <div class="goal-header">
                <div class="goal-title">
                    <span class="goal-icon">${goal.icon}</span>
                    <div>
                        <div class="goal-name">${goal.name}</div>
                        <div class="goal-category">${goal.description || goal.category}</div>
                    </div>
                </div>
                <span class="${priorityClass}">${priorityIcon} ${goal.priority}</span>
            </div>

            <div class="goal-progress-section">
                <div class="progress-labels">
                    <span class="progress-label">Progress</span>
                    <span class="progress-value">${progressPercent.toFixed(0)}%</span>
                </div>
                <div class="progress-bar">
                    <div class="progress-fill" style="width: ${Math.min(100, progressPercent)}%"></div>
                </div>
            </div>

            <div class="goal-details">
                <div class="detail-item">
                    <div class="detail-label">Current</div>
                    <div class="detail-value">₹${goal.currentAmount.toFixed(0)}</div>
                </div>
                <div class="detail-item">
                    <div class="detail-label">Target</div>
                    <div class="detail-value">₹${goal.targetAmount.toFixed(0)}</div>
                </div>
                <div class="detail-item">
                    <div class="detail-label">Needed</div>
                    <div class="detail-value">₹${remainingAmount.toFixed(0)}</div>
                </div>
            </div>

            <div class="goal-actions">
                ${actionButtons}
            </div>
        </div>
    `;
}

// ===== Goal Management Functions =====
function completeGoal(goalId) {
    const goal = goalsData.goals.find(g => g.id === goalId);
    if (goal) {
        goal.completed = true;
        goal.completedDate = new Date().toISOString();
        goal.currentAmount = goal.targetAmount;
        saveGoals();
        showSuccess('🎉 Goal completed! Great achievement!');
        displayGoals();
        displayOverview();
        displayKeyMetrics();
    }
}

function deleteGoal(goalId) {
    if (confirm('Are you sure you want to delete this goal?')) {
        goalsData.goals = goalsData.goals.filter(g => g.id !== goalId);
        saveGoals();
        displayGoals();
        displayOverview();
        createSavingsChart();
        displayKeyMetrics();
        showSuccess('Goal deleted');
    }
}

function saveGoals() {
    try {
        localStorage.setItem('finproGoals', JSON.stringify(goalsData.goals));
        console.log('Goals saved to local storage');
    } catch (error) {
        console.error('Error saving goals:', error);
    }
}

// ===== Create Savings Chart =====
function createSavingsChart() {
    try {
        const monthlyAmount = monthlySavings > 0 ? monthlySavings : 0;
        const months = [];
        const savingsData = [];
        let cumulativeSavings = 0;

        for (let i = 0; i < 12; i++) {
            const date = new Date();
            date.setMonth(date.getMonth() + i);
            months.push(date.toLocaleDateString('en-IN', { month: 'short', year: '2-digit' }));
            cumulativeSavings += monthlyAmount;
            savingsData.push(cumulativeSavings);
        }

        const ctx = document.getElementById('savingsChart').getContext('2d');

        if (savingsChart) {
            savingsChart.destroy();
        }

        savingsChart = new Chart(ctx, {
            type: 'line',
            data: {
                labels: months,
                datasets: [
                    {
                        label: 'Projected Savings',
                        data: savingsData,
                        borderColor: '#10b981',
                        backgroundColor: 'rgba(16, 185, 129, 0.1)',
                        borderWidth: 3,
                        fill: true,
                        tension: 0.4,
                        pointRadius: 5,
                        pointBackgroundColor: '#059669',
                        pointBorderColor: '#fff',
                        pointBorderWidth: 2,
                        pointHoverRadius: 7
                    }
                ]
            },
            options: {
                responsive: true,
                maintainAspectRatio: true,
                plugins: {
                    legend: {
                        display: true,
                        labels: {
                            font: { size: 12, weight: 'bold' },
                            color: '#6b7280',
                            usePointStyle: true,
                            padding: 15
                        }
                    },
                    tooltip: {
                        backgroundColor: 'rgba(31, 41, 55, 0.8)',
                        titleColor: '#fff',
                        bodyColor: '#fff',
                        borderColor: '#10b981',
                        borderWidth: 1,
                        padding: 12,
                        displayColors: true,
                        callbacks: {
                            label: function(context) {
                                return '₹' + context.parsed.y.toFixed(0);
                            }
                        }
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        grid: {
                            color: '#e5e7eb',
                            drawBorder: false
                        },
                        ticks: {
                            color: '#6b7280',
                            callback: function(value) {
                                return '₹' + (value / 1000).toFixed(0) + 'K';
                            }
                        }
                    },
                    x: {
                        grid: {
                            display: false,
                            drawBorder: false
                        },
                        ticks: {
                            color: '#6b7280',
                            font: { size: 11 }
                        }
                    }
                }
            }
        });

    } catch (error) {
        console.error('Error creating chart:', error);
    }
}

// ===== Display Affordability Analysis =====
function displayAffordabilityAnalysis() {
    try {
        const monthlySavingsVal = Math.max(0, monthlySavings);
        const quarterlySavings = monthlySavingsVal * 3;
        const yearlySavings = monthlySavingsVal * 12;
        const twoYearSavings = monthlySavingsVal * 24;

        document.getElementById('afMonthlySavings').textContent = `₹${monthlySavingsVal.toFixed(0)}`;
        document.getElementById('afQuarterlySavings').textContent = `₹${quarterlySavings.toFixed(0)}`;
        document.getElementById('afYearlySavings').textContent = `₹${yearlySavings.toFixed(0)}`;
        document.getElementById('afTwoYearSavings').textContent = `₹${twoYearSavings.toFixed(0)}`;

        // Generate suggestions
        const suggestions = [];

        if (monthlySavingsVal <= 0) {
            suggestions.push('💡 Your expenses exceed income. Consider cutting expenses or increasing income.');
        } else if (monthlySavingsVal < 1000) {
            suggestions.push('💡 Your savings are low. Try to increase income or reduce expenses.');
        } else if (monthlySavingsVal < 5000) {
            suggestions.push('💡 Good savings! Consider setting goals for future planning.');
        } else {
            suggestions.push('💡 Excellent savings! You\\'re on track for your financial goals.');
        }

        if (monthlyExpenses > monthlyIncome * 0.7) {
            suggestions.push('💡 Your expenses are high relative to income. Review spending patterns.');
        }

        if (goalsData.goals.length === 0) {
            suggestions.push('💡 Set financial goals to track progress and stay motivated.');
        } else {
            const unaffordableGoals = goalsData.goals.filter(g => {
                const remaining = g.targetAmount - g.currentAmount;
                const monthsNeeded = remaining > 0 ? Math.ceil(remaining / Math.max(1, monthlySavingsVal)) : 0;
                return monthsNeeded > g.targetMonths;
            });

            if (unaffordableGoals.length > 0) {
                suggestions.push(`⚠️ ${unaffordableGoals.length} goal(s) may be difficult to achieve in the target timeline.`);
            }
        }

        const suggestionsList = document.getElementById('suggestions');
        suggestionsList.innerHTML = suggestions.map(s => `<li>${s}</li>`).join('');

    } catch (error) {
        console.error('Error displaying affordability analysis:', error);
    }
}

// ===== Display Key Metrics =====
function displayKeyMetrics() {
    try {
        const savingsRate = monthlyIncome > 0 ? ((monthlySavings / monthlyIncome) * 100).toFixed(1) : 0;
        document.getElementById('savingsRateMetric').textContent = `${savingsRate}%`;

        // Calculate average goal timeline
        const activeGoals = goalsData.goals.filter(g => !g.completed);
        const avgTimeline = activeGoals.length > 0 
            ? Math.round(activeGoals.reduce((sum, g) => sum + g.targetMonths, 0) / activeGoals.length)
            : 0;
        document.getElementById('avgTimeline').textContent = `${avgTimeline} mo`;

        // Total goal amount
        const totalGoalAmount = goalsData.goals.reduce((sum, g) => sum + g.targetAmount, 0);
        document.getElementById('totalGoalAmount').textContent = `₹${totalGoalAmount.toFixed(0)}`;

        // Completion rate
        const totalGoals = goalsData.goals.length;
        const completedGoals = goalsData.goals.filter(g => g.completed).length;
        const completionRate = totalGoals > 0 ? Math.round((completedGoals / totalGoals) * 100) : 0;
        document.getElementById('completionRate').textContent = `${completionRate}%`;

    } catch (error) {
        console.error('Error displaying metrics:', error);
    }
}

// ===== Notification Functions =====
function showSuccess(message) {
    const notification = document.createElement('div');
    notification.style.cssText = `
        position: fixed;
        top: 80px;
        right: 20px;
        background: linear-gradient(135deg, #10b981 0%, #059669 100%);
        color: #fff;
        padding: 16px 24px;
        border-radius: 10px;
        box-shadow: 0 4px 12px rgba(16, 185, 129, 0.3);
        font-weight: 500;
        z-index: 1000;
        animation: slideIn 0.3s ease;
    `;
    notification.textContent = message;
    document.body.appendChild(notification);

    setTimeout(() => {
        notification.style.animation = 'slideOut 0.3s ease';
        setTimeout(() => notification.remove(), 300);
    }, 3000);
}

function showError(message) {
    const notification = document.createElement('div');
    notification.style.cssText = `
        position: fixed;
        top: 80px;
        right: 20px;
        background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%);
        color: #fff;
        padding: 16px 24px;
        border-radius: 10px;
        box-shadow: 0 4px 12px rgba(239, 68, 68, 0.3);
        font-weight: 500;
        z-index: 1000;
        animation: slideIn 0.3s ease;
    `;
    notification.textContent = message;
    document.body.appendChild(notification);

    setTimeout(() => {
        notification.style.animation = 'slideOut 0.3s ease';
        setTimeout(() => notification.remove(), 300);
    }, 3000);
}

// Add animations to document
const style = document.createElement('style');
style.textContent = `
    @keyframes slideIn {
        from {
            transform: translateX(400px);
            opacity: 0;
        }
        to {
            transform: translateX(0);
            opacity: 1;
        }
    }

    @keyframes slideOut {
        from {
            transform: translateX(0);
            opacity: 1;
        }
        to {
            transform: translateX(400px);
            opacity: 0;
        }
    }
`;
document.head.appendChild(style);

console.log('Goals JavaScript loaded successfully');
