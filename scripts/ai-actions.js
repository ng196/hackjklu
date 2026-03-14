/**
 * AI Actions System - Enables the AI to perform real actions in the app
 * Works with the z.ai proxy backend (http://127.0.0.1:8787)
 */

const AI_PROXY_URL = "http://127.0.0.1:8787";
const AI_CHAT_ENDPOINT = `${AI_PROXY_URL}/api/chat`;

class FinWiseAI {
    constructor() {
        this.sessionId = 'finwise-' + Date.now();
        this.isProcessing = false;
    }

    /** Get all financial data from localStorage */
    getFinancialContext() {
        const transactions = JSON.parse(localStorage.getItem('fw_transactions') || '[]');
        const goals = JSON.parse(localStorage.getItem('fw_goals') || '[]');
        const accounts = JSON.parse(localStorage.getItem('fw_accounts') || '[]');
        const profile = JSON.parse(localStorage.getItem('fw_profile') || '{}');
        const budget = JSON.parse(localStorage.getItem('fw_budget') || '{}');

        const totalIncome = transactions.filter(t => t.type === 'income').reduce((s, t) => s + t.amount, 0);
        const totalExpense = transactions.filter(t => t.type === 'expense').reduce((s, t) => s + t.amount, 0);
        const totalBalance = accounts.reduce((s, a) => s + (a.balance || 0), 0);

        return {
            totalBalance,
            totalIncome,
            totalExpense,
            netSavings: totalIncome - totalExpense,
            transactionCount: transactions.length,
            goalCount: goals.length,
            accountCount: accounts.length,
            recentTransactions: transactions.slice(-5),
            goals: goals.slice(0, 5),
            accounts,
            profile,
            budget
        };
    }

    /** Send a message to the AI with action capability */
    async chat(message, systemOverride = null) {
        if (this.isProcessing) return { error: 'Already processing' };
        this.isProcessing = true;

        const context = this.getFinancialContext();

        const systemPrompt = systemOverride || `You are FinWise, an intelligent financial assistant that can PERFORM ACTIONS.

Current user financial data:
- Total Balance: ₹${context.totalBalance.toLocaleString('en-IN')}
- Total Income: ₹${context.totalIncome.toLocaleString('en-IN')}  
- Total Expenses: ₹${context.totalExpense.toLocaleString('en-IN')}
- Net Savings: ₹${context.netSavings.toLocaleString('en-IN')}
- Active Goals: ${context.goalCount}
- Accounts: ${context.accountCount}
- Recent Transactions: ${JSON.stringify(context.recentTransactions)}
- Goals: ${JSON.stringify(context.goals)}

IMPORTANT: When the user asks you to DO something (add transaction, create goal, set budget, etc.), you MUST respond with a JSON action block.

Action format (include this JSON in your response when performing actions):
\`\`\`action
{"action": "add_transaction", "data": {"type": "expense", "amount": 500, "category": "food", "description": "Lunch", "date": "${new Date().toISOString().split('T')[0]}"}}
\`\`\`

Available actions:
- add_transaction: {type, amount, category, description, date, paymentMethod}
- create_goal: {name, icon, targetAmount, currentSavings, targetMonths, priority, category}
- add_account: {name, type, balance, bankName, accountNumber}
- set_budget: {category, amount, period}
- update_profile: {field, value}

You can include MULTIPLE action blocks in one response. Always explain what you're doing in natural language too.`;

        try {
            const response = await fetch(AI_CHAT_ENDPOINT, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    message,
                    sessionId: this.sessionId,
                    systemPrompt,
                    temperature: 0.7,
                    max_tokens: 1024,
                    financialContext: context
                })
            });

            if (!response.ok) {
                throw new Error(`API Error: ${response.status}`);
            }

            const data = await response.json();
            const content = data.response || data.choices?.[0]?.message?.content || 'No response';

            // Parse and execute actions from the response
            const actions = this.parseActions(content);
            const results = [];
            for (const action of actions) {
                const result = this.executeAction(action);
                results.push(result);
            }

            return {
                message: this.cleanResponse(content),
                actions: results,
                raw: content
            };
        } catch (error) {
            console.error('FinWise AI Error:', error);
            return {
                message: `I'm having trouble connecting to the AI service. Error: ${error.message}`,
                actions: [],
                error: true
            };
        } finally {
            this.isProcessing = false;
        }
    }

    /** Parse action blocks from AI response */
    parseActions(content) {
        const actions = [];
        const actionRegex = /```action\s*\n?([\s\S]*?)```/g;
        let match;
        while ((match = actionRegex.exec(content)) !== null) {
            try {
                const parsed = JSON.parse(match[1].trim());
                actions.push(parsed);
            } catch (e) {
                console.warn('Failed to parse action:', match[1]);
            }
        }
        return actions;
    }

    /** Remove action blocks from display message */
    cleanResponse(content) {
        return content.replace(/```action\s*\n?[\s\S]*?```/g, '').trim();
    }

    /** Execute a parsed action */
    executeAction(actionObj) {
        const { action, data } = actionObj;
        try {
            switch (action) {
                case 'add_transaction':
                    return this.actionAddTransaction(data);
                case 'create_goal':
                    return this.actionCreateGoal(data);
                case 'add_account':
                    return this.actionAddAccount(data);
                case 'set_budget':
                    return this.actionSetBudget(data);
                case 'update_profile':
                    return this.actionUpdateProfile(data);
                default:
                    return { success: false, message: `Unknown action: ${action}` };
            }
        } catch (e) {
            return { success: false, message: `Action failed: ${e.message}` };
        }
    }

    actionAddTransaction(data) {
        const transactions = JSON.parse(localStorage.getItem('fw_transactions') || '[]');
        const transaction = {
            id: 'txn_' + Date.now(),
            type: data.type || 'expense',
            amount: parseFloat(data.amount) || 0,
            category: data.category || 'other',
            description: data.description || '',
            date: data.date || new Date().toISOString().split('T')[0],
            paymentMethod: data.paymentMethod || 'cash',
            createdAt: new Date().toISOString(),
            source: 'ai'
        };
        transactions.push(transaction);
        localStorage.setItem('fw_transactions', JSON.stringify(transactions));
        window.dispatchEvent(new CustomEvent('fw-data-changed', { detail: { type: 'transaction', data: transaction } }));
        return { success: true, action: 'add_transaction', message: `Added ${transaction.type}: ₹${transaction.amount} (${transaction.category})` };
    }

    actionCreateGoal(data) {
        const goals = JSON.parse(localStorage.getItem('fw_goals') || '[]');
        const goal = {
            id: 'goal_' + Date.now(),
            name: data.name || 'New Goal',
            icon: data.icon || '🎯',
            targetAmount: parseFloat(data.targetAmount) || 0,
            currentSavings: parseFloat(data.currentSavings) || 0,
            targetMonths: parseInt(data.targetMonths) || 12,
            priority: data.priority || 'medium',
            category: data.category || 'other',
            status: 'active',
            createdAt: new Date().toISOString(),
            source: 'ai'
        };
        goals.push(goal);
        localStorage.setItem('fw_goals', JSON.stringify(goals));
        window.dispatchEvent(new CustomEvent('fw-data-changed', { detail: { type: 'goal', data: goal } }));
        return { success: true, action: 'create_goal', message: `Created goal: ${goal.name} (₹${goal.targetAmount.toLocaleString('en-IN')})` };
    }

    actionAddAccount(data) {
        const accounts = JSON.parse(localStorage.getItem('fw_accounts') || '[]');
        const account = {
            id: 'acc_' + Date.now(),
            name: data.name || 'New Account',
            type: data.type || 'savings',
            balance: parseFloat(data.balance) || 0,
            bankName: data.bankName || '',
            accountNumber: data.accountNumber || '',
            createdAt: new Date().toISOString()
        };
        accounts.push(account);
        localStorage.setItem('fw_accounts', JSON.stringify(accounts));
        window.dispatchEvent(new CustomEvent('fw-data-changed', { detail: { type: 'account', data: account } }));
        return { success: true, action: 'add_account', message: `Added account: ${account.name} (₹${account.balance.toLocaleString('en-IN')})` };
    }

    actionSetBudget(data) {
        const budget = JSON.parse(localStorage.getItem('fw_budget') || '{}');
        budget[data.category || 'general'] = {
            amount: parseFloat(data.amount) || 0,
            period: data.period || 'monthly',
            updatedAt: new Date().toISOString()
        };
        localStorage.setItem('fw_budget', JSON.stringify(budget));
        window.dispatchEvent(new CustomEvent('fw-data-changed', { detail: { type: 'budget', data: budget } }));
        return { success: true, action: 'set_budget', message: `Budget set: ₹${data.amount} for ${data.category}` };
    }

    actionUpdateProfile(data) {
        const profile = JSON.parse(localStorage.getItem('fw_profile') || '{}');
        if (data.field) {
            profile[data.field] = data.value;
        } else {
            Object.assign(profile, data);
        }
        localStorage.setItem('fw_profile', JSON.stringify(profile));
        window.dispatchEvent(new CustomEvent('fw-data-changed', { detail: { type: 'profile', data: profile } }));
        return { success: true, action: 'update_profile', message: `Profile updated: ${data.field || 'multiple fields'}` };
    }
}

/** Initialize demo data if empty */
function initDemoData() {
    if (!localStorage.getItem('fw_accounts')) {
        localStorage.setItem('fw_accounts', JSON.stringify([
            { id: 'acc_1', name: 'HDFC Savings', type: 'savings', balance: 45000, bankName: 'HDFC Bank', accountNumber: '****4736', icon: '🏦' },
            { id: 'acc_2', name: 'SBI Current', type: 'current', balance: 75000, bankName: 'State Bank of India', accountNumber: '****8821', icon: '🏦' },
            { id: 'acc_3', name: 'ICICI Credit Card', type: 'credit', balance: -12500, bankName: 'ICICI Bank', accountNumber: '****4829', icon: '💳' },
            { id: 'acc_4', name: 'Groww Investments', type: 'investment', balance: 120000, bankName: 'Groww', accountNumber: '', icon: '📈' }
        ]));
    }
    if (!localStorage.getItem('fw_transactions')) {
        localStorage.setItem('fw_transactions', JSON.stringify([
            { id: 'txn_1', type: 'income', amount: 75000, category: 'salary', description: 'Monthly Salary', date: '2026-03-12', paymentMethod: 'bank' },
            { id: 'txn_2', type: 'expense', amount: 450, category: 'food', description: 'Coffee at Brew Cafe', date: '2026-03-13', paymentMethod: 'upi' },
            { id: 'txn_3', type: 'expense', amount: 1200, category: 'shopping', description: 'Online Shopping', date: '2026-03-11', paymentMethod: 'credit' },
            { id: 'txn_4', type: 'expense', amount: 2500, category: 'utilities', description: 'Electricity Bill', date: '2026-03-10', paymentMethod: 'bank' },
            { id: 'txn_5', type: 'expense', amount: 120, category: 'transport', description: 'Uber Ride', date: '2026-03-08', paymentMethod: 'upi' },
            { id: 'txn_6', type: 'income', amount: 2500, category: 'freelance', description: 'Freelance Project', date: '2026-03-09', paymentMethod: 'bank' }
        ]));
    }
    if (!localStorage.getItem('fw_goals')) {
        localStorage.setItem('fw_goals', JSON.stringify([
            { id: 'goal_1', name: 'Home Down Payment', icon: '🏠', targetAmount: 500000, currentSavings: 375000, targetMonths: 18, priority: 'high', category: 'home', status: 'active' },
            { id: 'goal_2', name: 'Vacation Fund', icon: '✈️', targetAmount: 25000, currentSavings: 8500, targetMonths: 6, priority: 'medium', category: 'vacation', status: 'active' },
            { id: 'goal_3', name: 'Education Fund', icon: '📚', targetAmount: 300000, currentSavings: 180000, targetMonths: 24, priority: 'high', category: 'education', status: 'active' },
            { id: 'goal_4', name: 'Car Purchase', icon: '🚗', targetAmount: 1000000, currentSavings: 300000, targetMonths: 36, priority: 'low', category: 'vehicle', status: 'active' }
        ]));
    }
    if (!localStorage.getItem('fw_profile')) {
        localStorage.setItem('fw_profile', JSON.stringify({
            name: 'Demo User',
            email: 'user@example.com',
            phone: '+91 98765 43210',
            occupation: 'Software Engineer',
            annualIncome: 1500000,
            panNumber: '',
            aadharNumber: '',
            taxRegime: 'new'
        }));
    }
    // Always set currentUser for direct-to-dashboard flow
    if (!localStorage.getItem('currentUser')) {
        localStorage.setItem('currentUser', JSON.stringify({
            email: 'user@example.com',
            fullName: 'Demo User',
            loginTime: new Date().toLocaleString()
        }));
    }
}

// Global instance
const finwiseAI = new FinWiseAI();

// Initialize demo data on load
if (typeof document !== 'undefined') {
    initDemoData();
}
