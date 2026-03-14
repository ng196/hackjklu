import pool from './db.js';
import { generateFIData } from '../mockDataGenerator.js';

const DEMO_USER = {
    name: 'Rahul Sharma',
    pan: 'ABCPA1234K',
    mobile: '9876543210',
    email: 'rahul@example.com'
};

const DEFAULT_FI_TYPES = [
    'DEPOSIT',
    'CREDIT_CARD',
    'MUTUAL_FUNDS',
    'EQUITIES',
    'INSURANCE_POLICIES',
    'TERM_DEPOSIT',
    'NPS',
    'ETF'
];

const MAX_DEPOSIT_ACCOUNTS = 3;
const MAX_CREDIT_CARD_ACCOUNTS = 4;

const DEMO_USER_PROFILES = [
    {
        name: 'Rahul Sharma',
        pan: 'ABCPA1234K',
        mobile: '9876543210',
        email: 'rahul@example.com',
        fiTypes: ['DEPOSIT', 'CREDIT_CARD', 'MUTUAL_FUNDS', 'EQUITIES']
    },
    {
        name: 'Ananya Verma',
        pan: 'BGHPV4321N',
        mobile: '9876543211',
        email: 'ananya.verma@example.com',
        fiTypes: ['DEPOSIT', 'RECURRING_DEPOSIT', 'TERM_DEPOSIT', 'INSURANCE_POLICIES']
    },
    {
        name: 'Karan Mehta',
        pan: 'CKLPM8765Q',
        mobile: '9876543212',
        email: 'karan.mehta@example.com',
        fiTypes: ['DEPOSIT', 'CREDIT_CARD', 'ETF', 'EQUITIES']
    },
    {
        name: 'Priya Nair',
        pan: 'DQRPN2468L',
        mobile: '9876543213',
        email: 'priya.nair@example.com',
        fiTypes: ['DEPOSIT', 'MUTUAL_FUNDS', 'NPS', 'INSURANCE_POLICIES']
    },
    {
        name: 'Vikram Sethi',
        pan: 'ESVPS1357D',
        mobile: '9876543214',
        email: 'vikram.sethi@example.com',
        fiTypes: ['DEPOSIT', 'TERM_DEPOSIT', 'MUTUAL_FUNDS']
    },
    {
        name: 'Neha Kulkarni',
        pan: 'FKNPK8642R',
        mobile: '9876543215',
        email: 'neha.kulkarni@example.com',
        fiTypes: ['DEPOSIT', 'CREDIT_CARD', 'GSTR1_3B']
    },
    {
        name: 'Arjun Rao',
        pan: 'GTRPA9753M',
        mobile: '9876543216',
        email: 'arjun.rao@example.com',
        fiTypes: ['DEPOSIT', 'EQUITIES', 'ETF', 'MUTUAL_FUNDS']
    },
    {
        name: 'Meera Iyer',
        pan: 'HIRPM3141T',
        mobile: '9876543217',
        email: 'meera.iyer@example.com',
        fiTypes: ['DEPOSIT', 'INSURANCE_POLICIES', 'NPS', 'TERM_DEPOSIT']
    },
    {
        name: 'Rohit Bansal',
        pan: 'JBPRB2718K',
        mobile: '9876543218',
        email: 'rohit.bansal@example.com',
        fiTypes: ['DEPOSIT', 'CREDIT_CARD', 'RECURRING_DEPOSIT']
    },
    {
        name: 'Simran Kaur',
        pan: 'KAKPS1618P',
        mobile: '9876543219',
        email: 'simran.kaur@example.com',
        fiTypes: ['DEPOSIT', 'MUTUAL_FUNDS', 'ETF', 'NPS']
    },
    {
        name: 'Nikhil Jain',
        pan: 'LJTPN1122A',
        mobile: '9876543220',
        email: 'nikhil.jain@example.com',
        fiTypes: ['DEPOSIT', 'CREDIT_CARD', 'EQUITIES', 'INSURANCE_POLICIES']
    },
    {
        name: 'Aditi Bose',
        pan: 'MBSPA9087H',
        mobile: '9876543221',
        email: 'aditi.bose@example.com',
        fiTypes: ['DEPOSIT', 'TERM_DEPOSIT', 'MUTUAL_FUNDS', 'NPS']
    },
    {
        name: 'Manish Yadav',
        pan: 'NYDPM4567C',
        mobile: '9876543222',
        email: 'manish.yadav@example.com',
        fiTypes: ['DEPOSIT', 'GSTR1_3B', 'CREDIT_CARD']
    },
    {
        name: 'Pooja Menon',
        pan: 'OMNPP2244J',
        mobile: '9876543223',
        email: 'pooja.menon@example.com',
        fiTypes: ['DEPOSIT', 'INSURANCE_POLICIES', 'RECURRING_DEPOSIT']
    },
    {
        name: 'Siddharth Gupta',
        pan: 'PGUPS7788Z',
        mobile: '9876543224',
        email: 'siddharth.gupta@example.com',
        fiTypes: ['DEPOSIT', 'CREDIT_CARD', 'ETF', 'EQUITIES', 'MUTUAL_FUNDS']
    }
];

function parseNumber(value) {
    if (value === null || value === undefined || value === '') {
        return null;
    }

    const num = Number(value);
    return Number.isFinite(num) ? num : null;
}

function asDateOrNow(value) {
    const dt = value ? new Date(value) : new Date();
    return Number.isNaN(dt.getTime()) ? new Date() : dt;
}

function inferAccountSubtype(fiType, summary = {}) {
    if (fiType === 'DEPOSIT') {
        return summary.type || 'SAVINGS';
    }

    if (fiType === 'CREDIT_CARD') {
        return 'CREDIT_CARD';
    }

    return fiType;
}

function mapFiPayloadToAccount(fiType, payload) {
    const summary = payload?.summary || {};

    if (fiType === 'DEPOSIT') {
        return {
            fi_type: fiType,
            account_name: summary.bankName || 'Bank Account',
            account_subtype: inferAccountSubtype(fiType, summary),
            masked_identifier: summary.maskedAccountNumber || null,
            current_balance: parseNumber(summary.currentBalance),
            credit_limit: null,
            outstanding_amount: null,
            currency: summary.currency || 'INR',
            status: summary.status || 'ACTIVE',
            metadata: summary
        };
    }

    if (fiType === 'CREDIT_CARD') {
        return {
            fi_type: fiType,
            account_name: summary.cardName || 'Credit Card',
            account_subtype: inferAccountSubtype(fiType, summary),
            masked_identifier: summary.maskedCardNumber || null,
            current_balance: parseNumber(summary.availableCredit),
            credit_limit: parseNumber(summary.creditLimit),
            outstanding_amount: parseNumber(summary.outstandingAmount),
            currency: summary.currency || 'INR',
            status: summary.status || 'ACTIVE',
            metadata: summary
        };
    }

    return null;
}

function mapTransactionsFromPayload(payload) {
    return payload?.transactions?.transaction || [];
}

function capAccountsByType(accounts = []) {
    let depositCount = 0;
    let creditCardCount = 0;

    return accounts.filter((account) => {
        if (account.fi_type === 'DEPOSIT') {
            if (depositCount >= MAX_DEPOSIT_ACCOUNTS) {
                return false;
            }
            depositCount += 1;
            return true;
        }

        if (account.fi_type === 'CREDIT_CARD') {
            if (creditCardCount >= MAX_CREDIT_CARD_ACCOUNTS) {
                return false;
            }
            creditCardCount += 1;
            return true;
        }

        return true;
    });
}

function normalizeTxn(txn) {
    return {
        txn_ref: txn.reference || txn.txnId || null,
        txn_type: txn.type === 'CREDIT' ? 'CREDIT' : 'DEBIT',
        mode: txn.mode || null,
        amount: parseNumber(txn.amount) || 0,
        running_balance: parseNumber(txn.currentBalance),
        txn_timestamp: asDateOrNow(txn.transactionTimestamp),
        value_date: txn.valueDate || null,
        narration: txn.narration || null,
        merchant_name: txn.merchant_name || null,
        raw_payload: txn
    };
}

export function buildUserContext(overrides = {}) {
    return {
        name: overrides.name || DEMO_USER.name,
        pan: overrides.pan || DEMO_USER.pan,
        mobile: overrides.mobile || DEMO_USER.mobile,
        email: overrides.email || DEMO_USER.email
    };
}

export async function upsertUserFromContext(userContext) {
    const client = await pool.connect();

    try {
        const fullName = userContext.name;
        const pan = userContext.pan || null;
        const mobile = userContext.mobile || null;
        const email = userContext.email || null;

        const existing = await client.query(
            `SELECT *
             FROM users
             WHERE mobile = $1 OR email = $2
             LIMIT 1`,
            [mobile, email]
        );

        if (existing.rows.length > 0) {
            const row = existing.rows[0];
            const updated = await client.query(
                `UPDATE users
                 SET full_name = COALESCE($2, full_name),
                     pan = COALESCE($3, pan),
                     mobile = COALESCE($4, mobile),
                     email = COALESCE($5, email),
                     updated_at = NOW()
                 WHERE id = $1
                 RETURNING *`,
                [row.id, fullName, pan, mobile, email]
            );

            return updated.rows[0];
        }

        const inserted = await client.query(
            `INSERT INTO users (full_name, pan, mobile, email)
             VALUES ($1, $2, $3, $4)
             RETURNING *`,
            [fullName, pan, mobile, email]
        );

        return inserted.rows[0];
    } finally {
        client.release();
    }
}

export async function createConsent(userId, fiTypes = DEFAULT_FI_TYPES) {
    const client = await pool.connect();

    try {
        const created = await client.query(
            `INSERT INTO consents (id, user_id, fi_types, status, consent_handle)
             VALUES (gen_random_uuid(), $1, $2, 'APPROVED', gen_random_uuid())
             RETURNING *`,
            [userId, fiTypes]
        );

        return created.rows[0];
    } finally {
        client.release();
    }
}

export async function createDataSession(consentId) {
    const client = await pool.connect();

    try {
        const consentResult = await client.query(
            `SELECT * FROM consents WHERE id = $1 LIMIT 1`,
            [consentId]
        );

        if (consentResult.rows.length === 0) {
            return null;
        }

        const consent = consentResult.rows[0];
        const created = await client.query(
            `INSERT INTO data_sessions (session_id, consent_id, user_id, fi_types, status)
             VALUES (gen_random_uuid(), $1, $2, $3, 'READY')
             RETURNING *`,
            [consent.id, consent.user_id, consent.fi_types]
        );

        return created.rows[0];
    } finally {
        client.release();
    }
}

export async function clearUserFinancialData(userId) {
    const client = await pool.connect();

    try {
        await client.query('BEGIN');
        await client.query(`DELETE FROM transactions WHERE user_id = $1`, [userId]);
        await client.query(`DELETE FROM accounts WHERE user_id = $1`, [userId]);
        await client.query(`DELETE FROM financial_records WHERE user_id = $1`, [userId]);
        await client.query(`DELETE FROM user_inferred_insights WHERE user_id = $1`, [userId]);
        await client.query(`DELETE FROM data_sessions WHERE user_id = $1`, [userId]);
        await client.query(`DELETE FROM consents WHERE user_id = $1`, [userId]);
        await client.query('COMMIT');
    } catch (err) {
        await client.query('ROLLBACK');
        throw err;
    } finally {
        client.release();
    }
}

export async function persistGeneratedDataForSession(sessionId, userContextOverride = null) {
    const client = await pool.connect();

    try {
        const sessionResult = await client.query(
            `SELECT * FROM data_sessions WHERE session_id = $1 LIMIT 1`,
            [sessionId]
        );

        if (sessionResult.rows.length === 0) {
            return null;
        }

        const session = sessionResult.rows[0];
        const userResult = await client.query(`SELECT * FROM users WHERE id = $1 LIMIT 1`, [session.user_id]);
        if (userResult.rows.length === 0) {
            return null;
        }

        const user = userResult.rows[0];

        const userContext = buildUserContext({
            name: user.full_name,
            pan: user.pan,
            mobile: user.mobile,
            email: user.email,
            ...(userContextOverride || {})
        });

        const fiTypes = session.fi_types || [];
        const generated = fiTypes.map((fiType) => ({
            fiType,
            payload: generateFIData(fiType, userContext)
        }));

        await client.query('BEGIN');

        await client.query(`DELETE FROM transactions WHERE user_id = $1`, [user.id]);
        await client.query(`DELETE FROM accounts WHERE user_id = $1`, [user.id]);
        await client.query(`DELETE FROM financial_records WHERE user_id = $1 AND session_id = $2`, [user.id, session.session_id]);

        let depositCount = 0;
        let creditCardCount = 0;

        for (const record of generated) {
            await client.query(
                `INSERT INTO financial_records (user_id, session_id, fi_type, payload)
                 VALUES ($1, $2, $3, $4::jsonb)`,
                [user.id, session.session_id, record.fiType, JSON.stringify(record.payload)]
            );

            const account = mapFiPayloadToAccount(record.fiType, record.payload);
            let accountId = null;
            let allowAccountInsert = true;

            if (account?.fi_type === 'DEPOSIT') {
                if (depositCount >= MAX_DEPOSIT_ACCOUNTS) {
                    allowAccountInsert = false;
                } else {
                    depositCount += 1;
                }
            }

            if (account?.fi_type === 'CREDIT_CARD') {
                if (creditCardCount >= MAX_CREDIT_CARD_ACCOUNTS) {
                    allowAccountInsert = false;
                } else {
                    creditCardCount += 1;
                }
            }

            if (account && allowAccountInsert) {
                const accountInsert = await client.query(
                    `INSERT INTO accounts (
                        user_id,
                        fi_type,
                        account_name,
                        account_subtype,
                        masked_identifier,
                        current_balance,
                        credit_limit,
                        outstanding_amount,
                        currency,
                        status,
                        metadata,
                        updated_at
                    ) VALUES (
                        $1, $2, $3, $4, $5,
                        $6, $7, $8, $9, $10,
                        $11::jsonb, NOW()
                    ) RETURNING id`,
                    [
                        user.id,
                        account.fi_type,
                        account.account_name,
                        account.account_subtype,
                        account.masked_identifier,
                        account.current_balance,
                        account.credit_limit,
                        account.outstanding_amount,
                        account.currency,
                        account.status,
                        JSON.stringify(account.metadata || {})
                    ]
                );

                accountId = accountInsert.rows[0].id;
            }

            const txns = mapTransactionsFromPayload(record.payload);
            for (const txn of txns) {
                const normalized = normalizeTxn(txn);
                await client.query(
                    `INSERT INTO transactions (
                        user_id,
                        account_id,
                        txn_ref,
                        txn_type,
                        mode,
                        amount,
                        running_balance,
                        txn_timestamp,
                        value_date,
                        narration,
                        merchant_name,
                        raw_payload
                    ) VALUES (
                        $1, $2, $3, $4, $5,
                        $6, $7, $8, $9, $10,
                        $11, $12::jsonb
                    )`,
                    [
                        user.id,
                        accountId,
                        normalized.txn_ref,
                        normalized.txn_type,
                        normalized.mode,
                        normalized.amount,
                        normalized.running_balance,
                        normalized.txn_timestamp,
                        normalized.value_date,
                        normalized.narration,
                        normalized.merchant_name,
                        JSON.stringify(normalized.raw_payload || {})
                    ]
                );
            }
        }

        await client.query(
            `UPDATE data_sessions
             SET status = 'COMPLETED'
             WHERE session_id = $1`,
            [session.session_id]
        );

        await recomputeAndStoreInferredInsights(user.id, client);

        await client.query('COMMIT');

        return {
            sessionId: session.session_id,
            userId: user.id,
            fiTypes,
            fiData: generated.map((entry) => entry.payload)
        };
    } catch (err) {
        await client.query('ROLLBACK');
        throw err;
    } finally {
        client.release();
    }
}

export async function recomputeAndStoreInferredInsights(userId, client = null) {
    const localClient = client || (await pool.connect());

    try {
        const txnsResult = await localClient.query(
            `SELECT txn_type, amount, txn_timestamp, merchant_name
             FROM transactions
             WHERE user_id = $1`,
            [userId]
        );

        const accountsResult = await localClient.query(
            `SELECT fi_type, account_name, current_balance, credit_limit, outstanding_amount, currency
             FROM accounts
             WHERE user_id = $1
             ORDER BY created_at DESC`,
            [userId]
        );

        const txns = txnsResult.rows;
        const accounts = capAccountsByType(accountsResult.rows);

        const totals = txns.reduce(
            (acc, txn) => {
                const amount = Number(txn.amount) || 0;
                if (txn.txn_type === 'CREDIT') {
                    acc.totalCredit += amount;
                } else {
                    acc.totalDebit += amount;
                }
                return acc;
            },
            { totalCredit: 0, totalDebit: 0 }
        );

        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

        const recent = txns.filter((txn) => new Date(txn.txn_timestamp) >= thirtyDaysAgo);
        const recentDebit = recent
            .filter((txn) => txn.txn_type === 'DEBIT')
            .reduce((sum, txn) => sum + (Number(txn.amount) || 0), 0);

        const recentCredit = recent
            .filter((txn) => txn.txn_type === 'CREDIT')
            .reduce((sum, txn) => sum + (Number(txn.amount) || 0), 0);

        const merchantAgg = {};
        for (const txn of txns) {
            if (txn.txn_type !== 'DEBIT' || !txn.merchant_name) {
                continue;
            }

            merchantAgg[txn.merchant_name] = (merchantAgg[txn.merchant_name] || 0) + (Number(txn.amount) || 0);
        }

        const topMerchants = Object.entries(merchantAgg)
            .sort((a, b) => b[1] - a[1])
            .slice(0, 5)
            .map(([merchant, spend]) => ({ merchant, spend: Number(spend.toFixed(2)) }));

        const monthlyCashflow = {};
        for (const txn of txns) {
            const dt = new Date(txn.txn_timestamp);
            const key = `${dt.getFullYear()}-${String(dt.getMonth() + 1).padStart(2, '0')}`;
            if (!monthlyCashflow[key]) {
                monthlyCashflow[key] = { credit: 0, debit: 0 };
            }
            if (txn.txn_type === 'CREDIT') {
                monthlyCashflow[key].credit += Number(txn.amount) || 0;
            } else {
                monthlyCashflow[key].debit += Number(txn.amount) || 0;
            }
        }

        const monthlySeries = Object.entries(monthlyCashflow)
            .sort((a, b) => a[0].localeCompare(b[0]))
            .slice(-6)
            .map(([month, values]) => ({
                month,
                credit: Number(values.credit.toFixed(2)),
                debit: Number(values.debit.toFixed(2)),
                net: Number((values.credit - values.debit).toFixed(2))
            }));

        const insights = {
            totals: {
                lifetimeCredit: Number(totals.totalCredit.toFixed(2)),
                lifetimeDebit: Number(totals.totalDebit.toFixed(2)),
                lifetimeNet: Number((totals.totalCredit - totals.totalDebit).toFixed(2))
            },
            last30Days: {
                credit: Number(recentCredit.toFixed(2)),
                debit: Number(recentDebit.toFixed(2)),
                net: Number((recentCredit - recentDebit).toFixed(2))
            },
            topMerchants,
            monthlyCashflow: monthlySeries,
            accountSnapshot: accounts,
            metadata: {
                txnCount: txns.length,
                accountCount: accounts.length
            }
        };

        await localClient.query(
            `INSERT INTO user_inferred_insights (user_id, inference_version, insights, computed_at)
             VALUES ($1, 1, $2::jsonb, NOW())
             ON CONFLICT (user_id)
             DO UPDATE SET
                inference_version = EXCLUDED.inference_version,
                insights = EXCLUDED.insights,
                computed_at = NOW()`,
            [userId, JSON.stringify(insights)]
        );

        return insights;
    } finally {
        if (!client) {
            localClient.release();
        }
    }
}

export async function getSessionRecords(sessionId) {
    const client = await pool.connect();

    try {
        const sessionResult = await client.query(
            `SELECT * FROM data_sessions WHERE session_id = $1 LIMIT 1`,
            [sessionId]
        );

        if (sessionResult.rows.length === 0) {
            return null;
        }

        const recordsResult = await client.query(
            `SELECT fi_type, payload, created_at
             FROM financial_records
             WHERE session_id = $1
             ORDER BY created_at ASC`,
            [sessionId]
        );

        return {
            session: sessionResult.rows[0],
            records: recordsResult.rows
        };
    } finally {
        client.release();
    }
}

export async function getUserDashboardContext(userId) {
    const client = await pool.connect();

    try {
        const userResult = await client.query(`SELECT * FROM users WHERE id = $1 LIMIT 1`, [userId]);
        if (userResult.rows.length === 0) {
            return null;
        }

        const accountsResult = await client.query(
            `SELECT * FROM accounts WHERE user_id = $1 ORDER BY created_at DESC`,
            [userId]
        );

        const insightsResult = await client.query(
            `SELECT insights, computed_at
             FROM user_inferred_insights
             WHERE user_id = $1
             LIMIT 1`,
            [userId]
        );

        const transactionsResult = await client.query(
            `SELECT id, txn_ref, txn_type, mode, amount, running_balance, txn_timestamp, value_date, narration, merchant_name
             FROM transactions
             WHERE user_id = $1
             ORDER BY txn_timestamp DESC
             LIMIT 200`,
            [userId]
        );

        const cappedAccounts = capAccountsByType(accountsResult.rows);

        return {
            user: userResult.rows[0],
            accounts: cappedAccounts,
            inferred: insightsResult.rows[0] || null,
            recentTransactions: transactionsResult.rows
        };
    } finally {
        client.release();
    }
}

export async function listUsers() {
    const client = await pool.connect();

    try {
        const result = await client.query(
            `SELECT id, full_name, pan, mobile, email, created_at, updated_at
             FROM users
             ORDER BY created_at ASC`
        );

        return result.rows;
    } finally {
        client.release();
    }
}

export async function ensureSeededDemoUser(options = {}) {
    const { forceRegenerate = false, fiTypes = DEFAULT_FI_TYPES, userContext = null } = options;

    const context = buildUserContext(userContext || {});
    const user = await upsertUserFromContext(context);

    if (forceRegenerate) {
        await clearUserFinancialData(user.id);
    }

    const existingContext = await getUserDashboardContext(user.id);
    if (!forceRegenerate && existingContext && existingContext.recentTransactions.length > 0) {
        return {
            user,
            seeded: false,
            reason: 'existing-data',
            fiTypes
        };
    }

    const consent = await createConsent(user.id, fiTypes);
    const session = await createDataSession(consent.id);
    const persisted = await persistGeneratedDataForSession(session.session_id, context);

    return {
        user,
        seeded: true,
        consent,
        session,
        fiTypes,
        recordCount: persisted.fiData.length
    };
}

export { DEFAULT_FI_TYPES, DEMO_USER_PROFILES };
