-- Create Database
CREATE DATABASE IF NOT EXISTS pharmacy_db;
USE pharmacy_db;

-- 1. USERS TABLE
CREATE TABLE IF NOT EXISTS users (
    user_id INT AUTO_INCREMENT PRIMARY KEY,
    full_name VARCHAR(100) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    phone VARCHAR(20),
    role VARCHAR(20) DEFAULT 'CUSTOMER', -- ADMIN/CUSTOMER
    address TEXT,
    is_verified BOOLEAN DEFAULT FALSE,
    verification_token VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 2. CATEGORIES TABLE
CREATE TABLE IF NOT EXISTS categories (
    category_id INT AUTO_INCREMENT PRIMARY KEY,
    category_name VARCHAR(100) NOT NULL,
    description TEXT
);

-- 3. MEDICINES TABLE
CREATE TABLE IF NOT EXISTS medicines (
    medicine_id INT AUTO_INCREMENT PRIMARY KEY,
    category_id INT NOT NULL,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    dosage VARCHAR(50),
    packaging VARCHAR(50),
    price DECIMAL(10, 2) NOT NULL,
    stock_quantity INT NOT NULL,
    requires_prescription BOOLEAN DEFAULT FALSE,
    manufacturer VARCHAR(100),
    product_type VARCHAR(30) DEFAULT 'MEDICINE',
    FOREIGN KEY (category_id) REFERENCES categories(category_id) ON DELETE CASCADE
);

-- 4. PRESCRIPTIONS TABLE
CREATE TABLE IF NOT EXISTS prescriptions (
    prescription_id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    file_url VARCHAR(255) NOT NULL,
    status VARCHAR(20) DEFAULT 'PENDING', -- PENDING/APPROVED/REJECTED
    uploaded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    verified_by VARCHAR(100),
    rejection_reason VARCHAR(500),
    FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE
);

-- 5. CART TABLE
CREATE TABLE IF NOT EXISTS cart (
    cart_id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    medicine_id INT NOT NULL,
    quantity INT NOT NULL,
    FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE,
    FOREIGN KEY (medicine_id) REFERENCES medicines(medicine_id) ON DELETE CASCADE
);

-- 6. ORDERS TABLE
CREATE TABLE IF NOT EXISTS orders (
    order_id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    total_amount DECIMAL(10, 2) NOT NULL,
    order_status VARCHAR(50) DEFAULT 'PENDING', -- PENDING/SHIPPED/DELIVERED/CANCELLED
    payment_status VARCHAR(50) DEFAULT 'PENDING', -- PENDING/PAID/FAILED
    delivery_address TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE
);

-- 7. ORDER_ITEMS TABLE
CREATE TABLE IF NOT EXISTS order_items (
    order_item_id INT AUTO_INCREMENT PRIMARY KEY,
    order_id INT NOT NULL,
    medicine_id INT NOT NULL,
    quantity INT NOT NULL,
    price DECIMAL(10, 2) NOT NULL,
    FOREIGN KEY (order_id) REFERENCES orders(order_id) ON DELETE CASCADE,
    FOREIGN KEY (medicine_id) REFERENCES medicines(medicine_id) ON DELETE CASCADE
);

-- 8. PAYMENTS TABLE
CREATE TABLE IF NOT EXISTS payments (
    payment_id INT AUTO_INCREMENT PRIMARY KEY,
    order_id INT NOT NULL,
    payment_method VARCHAR(50) NOT NULL,
    payment_status VARCHAR(50) DEFAULT 'PENDING', -- PENDING/PAID/FAILED
    transaction_id VARCHAR(100) UNIQUE,
    paid_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (order_id) REFERENCES orders(order_id) ON DELETE CASCADE
);

-- 9. LOYALTY_POINTS TABLE
CREATE TABLE IF NOT EXISTS loyalty_points (
    loyalty_id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT UNIQUE NOT NULL,
    total_points INT DEFAULT 0,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE
);
