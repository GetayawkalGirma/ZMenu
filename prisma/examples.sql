-- Sample data for Restaurant, Feature, and RestaurantFeatureAssignment tables

-- Restaurants Table
INSERT INTO Restaurant (id, name, description, location, logoUrl, createdAt, updatedAt) VALUES
('rest_1', 'The Cozy Cafe', 'A warm and inviting coffee shop with artisanal brews', '123 Main St, Downtown', 'https://example.com/cozy-cafe.jpg', '2024-01-15 10:00:00', '2024-01-15 10:00:00'),
('rest_2', 'Sushi Paradise', 'Authentic Japanese cuisine with fresh ingredients', '456 Oak Ave, Midtown', 'https://example.com/sushi-paradise.jpg', '2024-01-20 14:30:00', '2024-01-20 14:30:00'),
('rest_3', 'Burger Haven', 'Gourmet burgers and craft beers', '789 Pine Rd, Uptown', 'https://example.com/burger-haven.jpg', '2024-02-01 18:45:00', '2024-02-01 18:45:00');

-- Features Table (reusable features)
INSERT INTO Feature (id, name, description, createdAt, updatedAt) VALUES
('feat_1', 'WiFi', 'Free wireless internet access for customers', '2024-01-01 09:00:00', '2024-01-01 09:00:00'),
('feat_2', 'Outdoor Seating', 'Patio or terrace dining available', '2024-01-01 09:00:00', '2024-01-01 09:00:00'),
('feat_3', 'Delivery', 'Food delivery service available', '2024-01-01 09:00:00', '2024-01-01 09:00:00'),
('feat_4', 'Parking', 'Customer parking available on-site', '2024-01-01 09:00:00', '2024-01-01 09:00:00'),
('feat_5', 'Pet Friendly', 'Well-behaved pets are welcome', '2024-01-01 09:00:00', '2024-01-01 09:00:00'),
('feat_6', 'Live Music', 'Regular live music performances', '2024-01-01 09:00:00', '2024-01-01 09:00:00'),
('feat_7', 'Vegetarian Options', 'Extensive vegetarian menu choices', '2024-01-01 09:00:00', '2024-01-01 09:00:00'),
('feat_8', 'Full Bar', 'Complete alcoholic beverage service', '2024-01-01 09:00:00', '2024-01-01 09:00:00');

-- RestaurantFeatureAssignment Table (junction table - linking restaurants to features)
INSERT INTO RestaurantFeatureAssignment (id, restaurantId, featureId) VALUES
-- The Cozy Cafe features
('assign_1', 'rest_1', 'feat_1'), -- WiFi
('assign_2', 'rest_1', 'feat_2'), -- Outdoor Seating
('assign_3', 'rest_1', 'feat_5'), -- Pet Friendly
('assign_4', 'rest_1', 'feat_7'), -- Vegetarian Options

-- Sushi Paradise features
('assign_5', 'rest_2', 'feat_1'), -- WiFi
('assign_6', 'rest_2', 'feat_3'), -- Delivery
('assign_7', 'rest_2', 'feat_4'), -- Parking
('assign_8', 'rest_2', 'feat_7'), -- Vegetarian Options

-- Burger Haven features
('assign_9', 'rest_3', 'feat_2'), -- Outdoor Seating
('assign_10', 'rest_3', 'feat_4'), -- Parking
('assign_11', 'rest_3', 'feat_6'), -- Live Music
('assign_12', 'rest_3', 'feat_8'); -- Full Bar
