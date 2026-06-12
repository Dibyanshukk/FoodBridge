-- ============================================
--   FoodBridge – Zero Hunger Platform
--   Database Schema (MySQL / PostgreSQL)
-- ============================================

-- Drop tables in reverse dependency order
DROP TABLE IF EXISTS Distribution;
DROP TABLE IF EXISTS Requests;
DROP TABLE IF EXISTS Food_Donations;
DROP TABLE IF EXISTS Users;

-- ─────────────────────────────────────────
-- 1. Users
-- ─────────────────────────────────────────
CREATE TABLE Users (
    user_id   INT          PRIMARY KEY AUTO_INCREMENT,
    name      VARCHAR(100) NOT NULL,
    email     VARCHAR(150) NOT NULL UNIQUE,
    role      ENUM('donor','volunteer','ngo') NOT NULL,
    created_at TIMESTAMP   DEFAULT CURRENT_TIMESTAMP
);

-- ─────────────────────────────────────────
-- 2. Food_Donations
-- ─────────────────────────────────────────
CREATE TABLE Food_Donations (
    donation_id  INT          PRIMARY KEY AUTO_INCREMENT,
    donor_id     INT          NOT NULL,
    food_type    VARCHAR(100) NOT NULL,
    quantity     VARCHAR(50)  NOT NULL,       -- e.g. "10 kg", "50 packs"
    expiry_time  DATETIME     NOT NULL,
    location     VARCHAR(200) NOT NULL,
    status       ENUM('available','assigned','delivered') DEFAULT 'available',
    created_at   TIMESTAMP    DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_donor FOREIGN KEY (donor_id) REFERENCES Users(user_id)
        ON DELETE CASCADE ON UPDATE CASCADE
);

-- ─────────────────────────────────────────
-- 3. Requests
-- ─────────────────────────────────────────
CREATE TABLE Requests (
    request_id   INT          PRIMARY KEY AUTO_INCREMENT,
    requester_id INT          NOT NULL,
    food_needed  VARCHAR(100) NOT NULL,
    quantity     VARCHAR(50)  NOT NULL,
    location     VARCHAR(200) NOT NULL,
    created_at   TIMESTAMP    DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_requester FOREIGN KEY (requester_id) REFERENCES Users(user_id)
        ON DELETE CASCADE ON UPDATE CASCADE
);

-- ─────────────────────────────────────────
-- 4. Distribution
-- ─────────────────────────────────────────
CREATE TABLE Distribution (
    distribution_id INT  PRIMARY KEY AUTO_INCREMENT,
    donation_id     INT  NOT NULL,
    volunteer_id    INT  NOT NULL,
    status          ENUM('pending','delivered') DEFAULT 'pending',
    assigned_at     TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_donation   FOREIGN KEY (donation_id)  REFERENCES Food_Donations(donation_id)
        ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT fk_volunteer  FOREIGN KEY (volunteer_id) REFERENCES Users(user_id)
        ON DELETE CASCADE ON UPDATE CASCADE
);

-- ============================================
--   SAMPLE DATA
-- ============================================

-- Users
INSERT INTO Users (name, email, role) VALUES
  ('Arjun Mehta',    'arjun@email.com',   'donor'),
  ('Priya Sharma',   'priya@email.com',   'volunteer'),
  ('Ravi NGO',       'ravi@ngo.org',      'ngo'),
  ('Sunita Patel',   'sunita@email.com',  'donor'),
  ('Karan Volunteer','karan@email.com',   'volunteer'),
  ('Ananya NGO',     'ananya@ngo.org',    'ngo');

-- Food Donations
INSERT INTO Food_Donations (donor_id, food_type, quantity, expiry_time, location) VALUES
  (1, 'Cooked Rice & Dal',   '20 kg',    DATE_ADD(NOW(), INTERVAL 6 HOUR),  'Sector 15, Noida'),
  (4, 'Bread & Biscuits',    '50 packs', DATE_ADD(NOW(), INTERVAL 2 DAY),   'Connaught Place, Delhi'),
  (1, 'Fresh Vegetables',    '15 kg',    DATE_ADD(NOW(), INTERVAL 1 DAY),   'Rajouri Garden, Delhi'),
  (4, 'Packaged Snacks',     '100 units',DATE_ADD(NOW(), INTERVAL 7 DAY),   'Lajpat Nagar, Delhi');

-- Requests
INSERT INTO Requests (requester_id, food_needed, quantity, location) VALUES
  (3, 'Cooked Meals',     '30 servings', 'Shelter Home, Saket, Delhi'),
  (6, 'Dry Ration',       '10 kg',       'NGO Center, Faridabad'),
  (3, 'Fruits & Veggies', '5 kg',        'Old Age Home, Dwarka');

-- Distribution
INSERT INTO Distribution (donation_id, volunteer_id, status) VALUES
  (1, 2, 'delivered'),
  (2, 5, 'pending'),
  (3, 2, 'pending');
