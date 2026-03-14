import { v4 as uuidv4 } from 'uuid';

// --- HELPERS ---
const randomItem = (arr) => arr[Math.floor(Math.random() * arr.length)];
const randomAmount = (min, max) => (Math.random() * (max - min) + min).toFixed(2);
const randomDate = (start, end) =>
    new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));
const randomInt = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;

// --- DEMO USER ---
export const DEMO_USER = {
    name: "Rahul Sharma",
    pan: "ABCPA1234K",
    mobile: "9876543210",
    email: "rahul@example.com"
};

// --- FIXED BANKS (pick 2 of 5) ---
const BANKS = [
    { name: "HDFC Bank",  ifsc: "HDFC0001234", accountSuffix: "4821", balance: 52400.00 },
    { name: "SBI",        ifsc: "SBIN0001234", accountSuffix: "7703", balance: 18750.00 },
    { name: "ICICI Bank", ifsc: "ICIC0001234", accountSuffix: "3390", balance: 31200.00 },
    { name: "Axis Bank",  ifsc: "UTIB0001234", accountSuffix: "9156", balance: 9800.00  },
    { name: "Kotak Bank", ifsc: "KKBK0001234", accountSuffix: "6642", balance: 24600.00 },
];

// --- FIXED CREDIT CARDS (pick 1 of 3) ---
const CREDIT_CARDS = [
    { name: "ICICI Coral",    limit: 150000, outstanding: 8200,  dueDate: "2026-04-05" },
    { name: "HDFC MoneyBack", limit: 100000, outstanding: 14500, dueDate: "2026-04-10" },
    { name: "SBI SimplyCLICK",limit: 200000, outstanding: 3750,  dueDate: "2026-04-15" },
];

// Realistic expense merchants per category
const EXPENSE_MERCHANTS = {
    food:      ["Swiggy", "Zomato", "Dominos", "McDonald's", "Starbucks"],
    shopping:  ["Amazon", "Flipkart", "Myntra", "Nykaa", "DMart"],
    transport: ["Ola", "Uber", "IRCTC", "IndiGo Airlines", "Metro Recharge"],
    bills:     ["Airtel Postpaid", "BESCOM Electricity", "Tata Sky DTH", "Jio Fiber"],
    health:    ["Apollo Pharmacy", "1mg", "Practo Consultation"],
    other:     ["BookMyShow", "Steam", "Netflix", "Spotify"],
};

function buildTransactions(startBalance, count = 12) {
    const txns = [];
    let balance = startBalance;
    const now = new Date();
    const threeMonthsAgo = new Date(now.getFullYear(), now.getMonth() - 3, 1);

    for (let i = 0; i < count; i++) {
        const isCredit = Math.random() < 0.25; // ~25% credits (salary/transfer)
        const amount = parseFloat(isCredit
            ? randomAmount(5000, 60000)
            : randomAmount(200, 8000));

        balance = isCredit ? balance + amount : balance - amount;

        const merchantGroup = randomItem(Object.keys(EXPENSE_MERCHANTS));
        const merchant = randomItem(EXPENSE_MERCHANTS[merchantGroup]);

        txns.push({
            txnId: uuidv4(),
            type: isCredit ? "CREDIT" : "DEBIT",
            mode: isCredit ? randomItem(["NEFT", "IMPS"]) : randomItem(["UPI", "CARD", "NEFT"]),
            amount: amount.toFixed(2),
            currentBalance: Math.max(balance, 0).toFixed(2),
            transactionTimestamp: randomDate(threeMonthsAgo, now).toISOString(),
            narration: isCredit
                ? `NEFT/INFLOW/${randomItem(["SALARY", "FREELANCE", "TRANSFER"])}`
                : `UPI/${merchant.toUpperCase().replace(/\s/g, "_")}`,
            merchant_name: isCredit ? null : merchant,
            reference: uuidv4(),
            valueDate: randomDate(threeMonthsAgo, now).toISOString().split("T")[0],
        });
    }

    // Sort newest first
    return txns.sort((a, b) => new Date(b.transactionTimestamp) - new Date(a.transactionTimestamp));
}

function buildCreditCardTransactions(count = 10) {
    const txns = [];
    const now = new Date();
    const twoMonthsAgo = new Date(now.getFullYear(), now.getMonth() - 2, 1);

    for (let i = 0; i < count; i++) {
        const isPayment = Math.random() < 0.15;
        const amount = parseFloat(isPayment ? randomAmount(3000, 15000) : randomAmount(300, 6000));
        const merchantGroup = randomItem(Object.keys(EXPENSE_MERCHANTS));
        const merchant = randomItem(EXPENSE_MERCHANTS[merchantGroup]);

        txns.push({
            txnId: uuidv4(),
            type: isPayment ? "CREDIT" : "DEBIT",
            amount: amount.toFixed(2),
            transactionTimestamp: randomDate(twoMonthsAgo, now).toISOString(),
            narration: isPayment ? "PAYMENT - THANK YOU" : `POS/${merchant.toUpperCase()}`,
            merchant_name: isPayment ? null : merchant,
            reference: uuidv4(),
        });
    }

    return txns.sort((a, b) => new Date(b.transactionTimestamp) - new Date(a.transactionTimestamp));
}

// --- DEMO DATA GENERATOR ---
// Returns a complete demo dataset: 2 banks + 1 credit card for DEMO_USER
export function generateDemoUserData() {
    // Pick 2 random banks from the 5
    const shuffledBanks = [...BANKS].sort(() => Math.random() - 0.5).slice(0, 2);
    // Pick 1 random credit card from the 3
    const card = randomItem(CREDIT_CARDS);

    const banks = shuffledBanks.map((bank) => ({
        fiType: "DEPOSIT",
        profile: { holders: { holder: [DEMO_USER] } },
        summary: {
            type: "SAVINGS",
            bankName: bank.name,
            branch: "MAIN BRANCH",
            ifscCode: bank.ifsc,
            maskedAccountNumber: "XXXXXX" + bank.accountSuffix,
            currentBalance: bank.balance.toFixed(2),
            currency: "INR",
            status: "ACTIVE",
        },
        transactions: { transaction: buildTransactions(bank.balance) },
    }));

    const creditCard = {
        fiType: "CREDIT_CARD",
        profile: { holders: { holder: [DEMO_USER] } },
        summary: {
            cardName: card.name,
            maskedCardNumber: "XXXX-XXXX-XXXX-" + randomInt(1000, 9999),
            creditLimit: card.limit.toFixed(2),
            outstandingAmount: card.outstanding.toFixed(2),
            availableCredit: (card.limit - card.outstanding).toFixed(2),
            paymentDueDate: card.dueDate,
            currency: "INR",
            status: "ACTIVE",
        },
        transactions: { transaction: buildCreditCardTransactions() },
    };

    return { user: DEMO_USER, banks, creditCard };
}

// --- MASTER GENERATOR (kept for other FI types) ---
export function generateFIData(fiType, userContext) {
    const user = userContext || DEMO_USER;

    switch (fiType) {
        case "DEPOSIT":           return generateDemoUserData().banks[0];
        case "CREDIT_CARD":       return generateDemoUserData().creditCard;
        case "TERM_DEPOSIT":      return generateTermDeposit(user);
        case "RECURRING_DEPOSIT": return generateRecurringDeposit(user);
        case "MUTUAL_FUNDS":      return generateMutualFunds(user);
        case "EQUITIES":          return generateEquities(user);
        case "ETF":               return generateETF(user);
        case "INSURANCE_POLICIES":return generateInsurance(user);
        case "NPS":               return generateNPS(user);
        case "GSTR1_3B":          return generateGST(user);
        default:                  return generateGenericInvestment(user, fiType);
    }
}

// --- SUPPORTING GENERATORS (unchanged) ---

function generateMutualFunds(user) {
    const schemes = [
        { name: "Axis Bluechip Fund", plan: "Growth", type: "EQUITY" },
        { name: "HDFC Balanced Advantage Fund", plan: "Dividend", type: "HYBRID" },
        { name: "SBI Small Cap Fund", plan: "Growth", type: "EQUITY" },
    ];
    const selected = randomItem(schemes);
    const units = parseFloat(randomAmount(100, 5000));
    const nav = parseFloat(randomAmount(10, 100));
    return {
        fiType: "MUTUAL_FUNDS",
        profile: { holders: { holder: [user] } },
        summary: {
            maskedAccountNumber: "MF" + randomInt(10000, 99999),
            currentValue: (units * nav).toFixed(2),
            investmentValue: (units * nav * 0.8).toFixed(2),
            holdings: { holding: [{ schemeName: selected.name, plan: selected.plan, schemeType: selected.type, units: units.toFixed(2), nav: nav.toFixed(2), navDate: new Date().toISOString().split("T")[0] }] },
        },
        transactions: { transaction: [{ type: "BUY", amount: randomAmount(1000, 50000), units: parseFloat(randomAmount(10, 100)).toFixed(2), nav: nav.toFixed(2), txnDate: randomDate(new Date(2022, 0, 1), new Date()).toISOString() }] },
    };
}

function generateEquities(user) {
    const stocks = [
        { symbol: "RELIANCE", isin: "INE002A01018" },
        { symbol: "TCS",      isin: "INE467B01029" },
        { symbol: "INFY",     isin: "INE009A01021" },
    ];
    const selected = randomItem(stocks);
    const quantity = randomInt(1, 50);
    const price = parseFloat(randomAmount(500, 3500));
    return {
        fiType: "EQUITIES",
        profile: { holders: { holder: [user] } },
        summary: {
            maskedAccountNumber: "DEMAT" + randomInt(1000, 9999),
            currentValue: (quantity * price).toFixed(2),
            holdings: { holding: [{ symbol: selected.symbol, isin: selected.isin, quantity, currentPrice: price.toFixed(2), avgBuyPrice: (price * 0.9).toFixed(2) }] },
        },
        transactions: { transaction: [{ type: "BUY", quantity, price: (price * 0.9).toFixed(2), txnDate: randomDate(new Date(2022, 0, 1), new Date()).toISOString() }] },
    };
}

function generateTermDeposit(user) {
    const principal = parseFloat(randomAmount(10000, 200000));
    const rate = (Math.random() * 3 + 5).toFixed(2);
    return {
        fiType: "TERM_DEPOSIT",
        profile: { holders: { holder: [user] } },
        summary: {
            type: "FIXED_DEPOSIT",
            maskedAccountNumber: "FD" + randomInt(10000, 99999),
            principalAmount: principal.toFixed(2),
            interestRate: rate,
            maturityDate: randomDate(new Date(2024, 0, 1), new Date(2028, 0, 1)).toISOString().split("T")[0],
            maturityAmount: (principal * (1 + (rate / 100) * 2)).toFixed(2),
            status: "ACTIVE",
        },
        transactions: { transaction: [] },
    };
}

function generateRecurringDeposit(user) {
    return {
        fiType: "RECURRING_DEPOSIT",
        profile: { holders: { holder: [user] } },
        summary: {
            maskedAccountNumber: "RD" + randomInt(10000, 99999),
            monthlyInstallment: randomAmount(1000, 10000),
            interestRate: (Math.random() * 2 + 5).toFixed(2),
            maturityDate: randomDate(new Date(2024, 0, 1), new Date(2028, 0, 1)).toISOString().split("T")[0],
            status: "ACTIVE",
        },
    };
}

function generateInsurance(user) {
    return {
        fiType: "INSURANCE_POLICIES",
        profile: { holders: { holder: [user] } },
        summary: {
            policyName: randomItem(["LIFE SHIELD", "HEALTH PLUS", "TERM CARE"]),
            policyNumber: "POL" + randomInt(1000000, 9999999),
            sumAssured: randomAmount(500000, 5000000),
            premiumAmount: randomAmount(5000, 50000),
            nextPremiumDueDate: randomDate(new Date(), new Date(2027, 0, 1)).toISOString().split("T")[0],
            status: "ACTIVE",
        },
    };
}

function generateNPS(user) {
    return {
        fiType: "NPS",
        profile: { holders: { holder: [user] } },
        summary: {
            pranId: "NPS" + randomInt(1000000, 9999999),
            currentBalance: randomAmount(50000, 500000),
            equityAssetValue: randomAmount(10000, 100000),
            debtAssetValue: randomAmount(10000, 100000),
            tier1Status: "ACTIVE",
        },
    };
}

function generateGST(user) {
    return {
        fiType: "GSTR1_3B",
        profile: { holders: { holder: [user] } },
        summary: {
            gstin: "27" + user.pan + "1Z5",
            turnover: randomAmount(1000000, 50000000),
            taxLiability: randomAmount(5000, 500000),
            returnPeriod: "102023",
        },
    };
}

function generateETF(user) {
    return {
        fiType: "ETF",
        profile: { holders: { holder: [user] } },
        summary: {
            maskedAccountNumber: "ETF" + randomInt(10000, 99999),
            currentValue: randomAmount(10000, 100000),
            holdings: { holding: [{ symbol: randomItem(["NIFTYBEES", "GOLDBEES", "BANKBEES"]), units: parseFloat(randomAmount(10, 500)).toFixed(2), currentNav: randomAmount(10, 100) }] },
        },
    };
}

function generateGenericInvestment(user, type) {
    return {
        fiType: type,
        profile: { holders: { holder: [user] } },
        summary: {
            maskedAccountNumber: type.substring(0, 3) + randomInt(10000, 99999),
            currentValue: randomAmount(50000, 1000000),
            description: `Mock description for ${type}`,
            status: "ACTIVE",
        },
    };
}
