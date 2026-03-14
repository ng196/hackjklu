-- Seed Data for Development

-- Insert default categories (system-wide, user_id is NULL)
INSERT INTO categories (user_id, name, icon, color, budget_limit) VALUES
(NULL, 'Food & Dining', 'fa-utensils', '#FF6B6B', 5000.00),
(NULL, 'Transportation', 'fa-car', '#4ECDC4', 3000.00),
(NULL, 'Shopping', 'fa-shopping-bag', '#45B7D1', 8000.00),
(NULL, 'Entertainment', 'fa-film', '#FFA07A', 2000.00),
(NULL, 'Bills & Utilities', 'fa-file-invoice', '#98D8C8', 4000.00),
(NULL, 'Healthcare', 'fa-heartbeat', '#F7B731', 3000.00),
(NULL, 'Education', 'fa-graduation-cap', '#5F27CD', 5000.00),
(NULL, 'Salary', 'fa-money-bill-wave', '#26DE81', NULL),
(NULL, 'Investment', 'fa-chart-line', '#4B7BEC', NULL),
(NULL, 'Other', 'fa-ellipsis-h', '#95A5A6', NULL);

-- Test User
INSERT INTO users (id, phone, email, full_name) VALUES
('a1b2c3d4-0000-0000-0000-000000000001', '9876543210', 'rahul@example.com', 'Rahul Sharma');

-- 2 Bank accounts + 1 Credit Card for Rahul
INSERT INTO accounts (id, user_id, name, type, initial_balance, currency) VALUES
('a1b2c3d4-0000-0000-0001-000000000001', 'a1b2c3d4-0000-0000-0000-000000000001', 'HDFC Savings', 'bank', 45000.00, 'INR'),
('a1b2c3d4-0000-0000-0001-000000000002', 'a1b2c3d4-0000-0000-0000-000000000001', 'SBI Savings', 'bank', 12500.00, 'INR'),
('a1b2c3d4-0000-0000-0001-000000000003', 'a1b2c3d4-0000-0000-0000-000000000001', 'ICICI Coral Credit Card', 'credit_card', -8200.00, 'INR');
