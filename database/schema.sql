-- ============================================================
-- Amazon Clone - MySQL Database Schema
-- ============================================================
-- Run this to create the database and all tables from scratch.
-- Alternatively, use SQLAlchemy's Base.metadata.create_all()
-- which is called automatically on app startup.
-- ============================================================

CREATE DATABASE IF NOT EXISTS amazon_clone
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

USE amazon_clone;

-- ── Users ────────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS users (
    id              INT AUTO_INCREMENT PRIMARY KEY,
    email           VARCHAR(255) NOT NULL UNIQUE,
    full_name       VARCHAR(255) NOT NULL,
    hashed_password VARCHAR(255) NOT NULL,
    is_active       BOOLEAN DEFAULT TRUE,
    created_at      DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at      DATETIME ON UPDATE CURRENT_TIMESTAMP,

    INDEX idx_users_email (email)
);

-- ── Categories ───────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS categories (
    id          INT AUTO_INCREMENT PRIMARY KEY,
    name        VARCHAR(100) NOT NULL UNIQUE,
    slug        VARCHAR(100) NOT NULL UNIQUE,
    description TEXT,
    image_url   VARCHAR(500),
    created_at  DATETIME DEFAULT CURRENT_TIMESTAMP,

    INDEX idx_categories_slug (slug)
);

-- ── Products ─────────────────────────────────────────────────────────────────
-- images and specifications stored as JSON for flexibility
CREATE TABLE IF NOT EXISTS products (
    id             INT AUTO_INCREMENT PRIMARY KEY,
    name           VARCHAR(500) NOT NULL,
    description    TEXT,
    price          DECIMAL(12,2) NOT NULL,
    original_price DECIMAL(12,2),         -- For showing strikethrough / discount %
    stock          INT DEFAULT 0,
    brand          VARCHAR(200),
    rating         DECIMAL(3,2) DEFAULT 0.00,
    review_count   INT DEFAULT 0,
    is_active      BOOLEAN DEFAULT TRUE,
    images         JSON,                  -- Array of image URLs
    specifications JSON,                  -- Key-value spec pairs
    category_id    INT NOT NULL,
    created_at     DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at     DATETIME ON UPDATE CURRENT_TIMESTAMP,

    CONSTRAINT fk_product_category
        FOREIGN KEY (category_id) REFERENCES categories(id)
        ON DELETE RESTRICT ON UPDATE CASCADE,

    FULLTEXT INDEX ft_products_name (name),       -- Full-text search on name
    INDEX idx_products_category (category_id),
    INDEX idx_products_price    (price),
    INDEX idx_products_rating   (rating),
    INDEX idx_products_active   (is_active)
);

-- ── Cart Items ────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS cart_items (
    id         INT AUTO_INCREMENT PRIMARY KEY,
    user_id    INT NOT NULL,
    product_id INT NOT NULL,
    quantity   INT NOT NULL DEFAULT 1,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME ON UPDATE CURRENT_TIMESTAMP,

    UNIQUE KEY uq_cart_user_product (user_id, product_id),   -- One row per product per user

    CONSTRAINT fk_cart_user
        FOREIGN KEY (user_id) REFERENCES users(id)
        ON DELETE CASCADE ON UPDATE CASCADE,

    CONSTRAINT fk_cart_product
        FOREIGN KEY (product_id) REFERENCES products(id)
        ON DELETE CASCADE ON UPDATE CASCADE,

    INDEX idx_cart_user    (user_id),
    INDEX idx_cart_product (product_id)
);

-- ── Wishlist ──────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS wishlist (
    id         INT AUTO_INCREMENT PRIMARY KEY,
    user_id    INT NOT NULL,
    product_id INT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,

    UNIQUE KEY uq_wishlist_user_product (user_id, product_id),

    CONSTRAINT fk_wishlist_user
        FOREIGN KEY (user_id) REFERENCES users(id)
        ON DELETE CASCADE ON UPDATE CASCADE,

    CONSTRAINT fk_wishlist_product
        FOREIGN KEY (product_id) REFERENCES products(id)
        ON DELETE CASCADE ON UPDATE CASCADE,

    INDEX idx_wishlist_user (user_id)
);

-- ── Orders ────────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS orders (
    id               INT AUTO_INCREMENT PRIMARY KEY,
    user_id          INT NOT NULL,
    status           ENUM('pending','confirmed','processing','shipped','delivered','cancelled')
                         DEFAULT 'confirmed',

    -- Shipping details (denormalized for snapshot - addresses can change later)
    shipping_name    VARCHAR(255) NOT NULL,
    shipping_phone   VARCHAR(20)  NOT NULL,
    shipping_address TEXT         NOT NULL,
    shipping_city    VARCHAR(100) NOT NULL,
    shipping_state   VARCHAR(100) NOT NULL,
    shipping_pincode VARCHAR(10)  NOT NULL,

    -- Financials
    subtotal         DECIMAL(12,2) NOT NULL,
    shipping_cost    DECIMAL(12,2) DEFAULT 0.00,
    total            DECIMAL(12,2) NOT NULL,

    payment_method   VARCHAR(50) DEFAULT 'COD',

    created_at       DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at       DATETIME ON UPDATE CURRENT_TIMESTAMP,

    CONSTRAINT fk_order_user
        FOREIGN KEY (user_id) REFERENCES users(id)
        ON DELETE RESTRICT ON UPDATE CASCADE,

    INDEX idx_orders_user      (user_id),
    INDEX idx_orders_status    (status),
    INDEX idx_orders_created   (created_at)
);

-- ── Order Items ───────────────────────────────────────────────────────────────
-- Product details are snapshotted at order time (prices/names can change later)
CREATE TABLE IF NOT EXISTS order_items (
    id            INT AUTO_INCREMENT PRIMARY KEY,
    order_id      INT NOT NULL,
    product_id    INT NOT NULL,
    product_name  VARCHAR(500)  NOT NULL,     -- Snapshot
    product_image VARCHAR(500),               -- Snapshot
    price         DECIMAL(12,2) NOT NULL,     -- Snapshot (unit price at time of order)
    quantity      INT           NOT NULL,

    CONSTRAINT fk_item_order
        FOREIGN KEY (order_id) REFERENCES orders(id)
        ON DELETE CASCADE ON UPDATE CASCADE,

    CONSTRAINT fk_item_product
        FOREIGN KEY (product_id) REFERENCES products(id)
        ON DELETE RESTRICT ON UPDATE CASCADE,

    INDEX idx_items_order   (order_id),
    INDEX idx_items_product (product_id)
);

-- ── Views (useful for analytics / admin) ─────────────────────────────────────

-- Revenue summary per day
CREATE OR REPLACE VIEW daily_revenue AS
    SELECT
        DATE(created_at)    AS order_date,
        COUNT(*)            AS total_orders,
        SUM(total)          AS revenue
    FROM orders
    WHERE status != 'cancelled'
    GROUP BY DATE(created_at)
    ORDER BY order_date DESC;

-- Top selling products
CREATE OR REPLACE VIEW top_products AS
    SELECT
        p.id,
        p.name,
        p.price,
        SUM(oi.quantity)              AS total_sold,
        SUM(oi.quantity * oi.price)   AS total_revenue
    FROM order_items oi
    JOIN products p ON p.id = oi.product_id
    GROUP BY p.id, p.name, p.price
    ORDER BY total_sold DESC;
