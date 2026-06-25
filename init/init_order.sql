-- --------------------------------------------------------
-- 3. DATABASE UNTUK ORDER SERVICE
-- --------------------------------------------------------
CREATE DATABASE IF NOT EXISTS db_order;
USE db_order;

CREATE TABLE `orders` (
  `id` int NOT NULL,
  `user_id` int DEFAULT NULL,
  `restaurant_id` int NOT NULL,
  `total_amount` decimal(10,2) NOT NULL,
  `status` enum('Pending','Paid','Diproses','Selesai') DEFAULT 'Pending',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

INSERT INTO `orders` (`id`, `user_id`, `restaurant_id`, `total_amount`, `status`, `created_at`) VALUES
(1, 1, 1, 25000.00, 'Selesai', '2026-04-21 03:38:37'),
(5, 1, 1, 62000.00, 'Selesai', '2026-04-24 04:39:06'),
(6, 1, 1, 116000.00, 'Selesai', '2026-04-24 05:54:23'),
(7, 1, 1, 74000.00, 'Selesai', '2026-04-24 06:18:21'),
(8, 1, 2, 252000.00, 'Pending', '2026-04-24 06:20:25'),
(9, 1, 2, 192000.00, 'Pending', '2026-04-24 06:20:37'),
(10, 1, 2, 127000.00, 'Pending', '2026-04-24 06:21:19'),
(11, 1, 1, 50000.00, 'Selesai', '2026-04-24 06:34:52'),
(12, 1, 2, 27000.00, 'Pending', '2026-04-24 06:54:18'),
(13, 1, 2, 27000.00, 'Pending', '2026-04-24 07:00:14'),
(14, 1, 1, 134000.00, 'Selesai', '2026-04-24 07:13:53'),
(15, 3, 1, 96000.00, 'Selesai', '2026-04-28 04:07:44'),
(16, 6, 1, 34000.00, 'Selesai', '2026-04-28 04:45:05'),
(17, 6, 1, 42000.00, 'Selesai', '2026-04-28 05:05:33'),
(18, 8, 1, 17000.00, 'Selesai', '2026-04-28 05:35:44'),
(19, 1, 1, 12000.00, 'Pending', '2026-06-04 09:02:20');

CREATE TABLE `order_items` (
  `id` int NOT NULL,
  `order_id` int DEFAULT NULL,
  `menu_id` int NOT NULL,
  `qty` int NOT NULL,
  `price` decimal(10,2) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

INSERT INTO `order_items` (`id`, `order_id`, `menu_id`, `qty`, `price`) VALUES
(1, 5, 153, 5, 12000.00),
(2, 6, 154, 3, 20000.00),
(3, 6, 153, 3, 12000.00),
(4, 6, 155, 1, 18000.00),
(5, 7, 153, 6, 12000.00),
(6, 8, 161, 4, 25000.00),
(7, 8, 163, 5, 30000.00),
(8, 9, 161, 4, 25000.00),
(9, 9, 162, 3, 30000.00),
(10, 10, 161, 5, 25000.00),
(11, 11, 153, 4, 12000.00),
(12, 12, 161, 1, 25000.00),
(13, 13, 161, 1, 25000.00),
(14, 14, 153, 3, 12000.00),
(15, 14, 154, 3, 20000.00),
(16, 14, 155, 2, 18000.00),
(17, 15, 153, 3, 12000.00),
(18, 15, 155, 1, 18000.00),
(19, 15, 154, 2, 20000.00),
(20, 16, 153, 1, 12000.00),
(21, 16, 154, 1, 20000.00),
(22, 17, 154, 2, 20000.00),
(23, 18, 159, 1, 3000.00),
(24, 18, 153, 1, 12000.00);

ALTER TABLE `orders`
  ADD PRIMARY KEY (`id`);

ALTER TABLE `order_items`
  ADD PRIMARY KEY (`id`),
  ADD KEY `order_id` (`order_id`);

ALTER TABLE `orders`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=20;

ALTER TABLE `order_items`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=25;

ALTER TABLE `order_items`
  ADD CONSTRAINT `order_items_ibfk_1` FOREIGN KEY (`order_id`) REFERENCES `orders` (`id`) ON DELETE CASCADE;
