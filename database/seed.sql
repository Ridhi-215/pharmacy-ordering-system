USE pharmacy_db;

-- Insert Admin User (password: admin123, BCrypt hashed)
INSERT INTO users (full_name, email, password, phone, role, address, is_verified)
VALUES ('System Admin', 'admin@pharmacy.com', '$2a$10$RshG3fKxG2aL/T.b/pB3P.8p5W7r7F6kCqZJ7.O1xIuJkPyN/mKDu', '1234567890', 'ADMIN', '123 Health Street, MedCity', TRUE);

-- Insert Customer User (password: customer123, BCrypt hashed)
INSERT INTO users (full_name, email, password, phone, role, address, is_verified)
VALUES ('John Doe', 'customer@pharmacy.com', '$2a$10$N.g3Hh/e3vU3F4Zq4d.69eeR8K3Z55kIqZzP.6eF7uH1vP7iP4dJy', '0987654321', 'CUSTOMER', '456 Wellness Avenue, CareTown', TRUE);

-- Insert Categories
INSERT INTO categories (category_id, category_name, description) VALUES
(1, 'Analgesics', 'Medicines used to achieve relief from pain.'),
(2, 'Antibiotics', 'Medicines that inhibit the growth of or destroy microorganisms.'),
(3, 'Vitamins & Supplements', 'Organic compounds essential for normal growth and nutrition.'),
(4, 'Cardiologic', 'Medicines relating to the functioning of the heart.'),
(5, 'Antidiabetic', 'Medicines used to treat diabetes mellitus.');

-- Insert Sample Medicines
INSERT INTO medicines (name, category_id, description, dosage, packaging, price, stock_quantity, requires_prescription, manufacturer, product_type) VALUES
-- Analgesics (No prescription)
('Paracetamol (Acetaminophen)', 1, 'Common pain reliever and fever reducer.', '500mg', 'Strip of 10 Tablets', 1.50, 150, FALSE, 'GlaxoSmithKline', 'MEDICINE'),
('Ibuprofen', 1, 'Nonsteroidal anti-inflammatory drug (NSAID) used to reduce pain and inflammation.', '400mg', 'Strip of 12 Tablets', 2.20, 100, FALSE, 'Pfizer', 'MEDICINE'),
-- Antibiotics (Prescription required)
('Amoxicillin', 2, 'Penicillin antibiotic used to treat bacterial infections.', '500mg', 'Box of 20 Capsules', 8.50, 50, TRUE, 'Novartis', 'MEDICINE'),
('Azithromycin', 2, 'Macrolide antibiotic used for treating various bacterial infections.', '250mg', 'Pack of 6 Tablets', 12.00, 30, TRUE, 'Pfizer', 'MEDICINE'),
-- Vitamins & Supplements (No prescription)
('Vitamin C (Ascorbic Acid)', 3, 'Essential vitamin for immune system support and skin health.', '1000mg', 'Bottle of 60 Gummies', 9.99, 200, FALSE, 'Nature Made', 'PHARMACY_PRODUCT'),
('Multivitamin Men Active', 3, 'Comprehensive multivitamin customized for men.', 'Daily', 'Bottle of 90 Tablets', 15.50, 75, FALSE, 'GNC', 'PHARMACY_PRODUCT'),
('Whey Protein Isolate', 3, 'High quality protein powder for muscle recovery.', '30g scoop', '2kg Tub', 49.99, 45, FALSE, 'Optimum Nutrition', 'PHARMACY_PRODUCT'),
-- Cardiologic (Prescription required)
('Atorvastatin (Lipitor)', 4, 'Statin medication used to prevent cardiovascular disease and lower lipids.', '20mg', 'Strip of 14 Tablets', 18.00, 40, TRUE, 'Pfizer', 'MEDICINE'),
('Metoprolol Succinate', 4, 'Beta-blocker used to treat chest pain (angina), heart failure, and high blood pressure.', '50mg', 'Strip of 10 Tablets', 11.50, 60, TRUE, 'AstraZeneca', 'MEDICINE'),
-- Antidiabetic (Prescription required)
('Metformin Hydrochloride', 5, 'First-line medication for the treatment of type 2 diabetes.', '500mg', 'Strip of 15 Tablets', 4.50, 120, TRUE, 'Merck', 'MEDICINE'),
('Glipizide', 5, 'Sulfonylurea class antidiabetic medication used to treat type 2 diabetes.', '5mg', 'Strip of 10 Tablets', 6.00, 80, TRUE, 'Sanofi', 'MEDICINE'),
-- Personal Care / Hygiene (No prescription)
('Instant Hand Sanitizer', 3, 'Kills 99.9% of germs instantly without water.', '100ml', 'Pump Bottle', 3.49, 120, FALSE, 'Purell', 'PHARMACY_PRODUCT'),
('N95 Protective Mask', 3, 'High filtration protective face mask.', 'Universal', 'Pack of 5', 5.99, 8, FALSE, '3M', 'PHARMACY_PRODUCT');

-- Insert Loyalty Points for customer
INSERT INTO loyalty_points (user_id, total_points) VALUES
(2, 50);
