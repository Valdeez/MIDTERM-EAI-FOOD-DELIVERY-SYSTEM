-- --------------------------------------------------------
-- 1. DATABASE UNTUK USER SERVICE
-- --------------------------------------------------------
CREATE DATABASE IF NOT EXISTS db_user;
USE db_user;

CREATE TABLE `users` (
  `id` int NOT NULL,
  `name` varchar(255) NOT NULL,
  `password` varchar(255) NOT NULL,
  `role` enum('customer','crew') NOT NULL,
  `restaurant_id` int DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

INSERT INTO `users` (`id`, `name`, `password`, `role`, `restaurant_id`) VALUES
(1, 'Budi', '', 'customer', NULL),
(2, 'Siti', '', 'crew', 1),
(3, 'izzati', '12345678', 'customer', NULL),
(4, 'alex', 'alex123', 'crew', 1),
(5, 'dapa', 'dapa123', 'crew', 2),
(7, 'Grup 2', 'grup2', 'customer', NULL),
(8, 'Kelompok 2', 'kelompok2', 'customer', NULL);

ALTER TABLE `users`
  ADD PRIMARY KEY (`id`);

ALTER TABLE `users`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=9;
