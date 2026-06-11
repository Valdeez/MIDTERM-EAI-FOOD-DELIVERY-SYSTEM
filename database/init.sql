-- ==========================================
-- INISIALISASI DATABASE UNTUK MICROSERVICES
-- ==========================================

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

-- --------------------------------------------------------
-- 2. DATABASE UNTUK PAYMENT SERVICE
-- --------------------------------------------------------
CREATE DATABASE IF NOT EXISTS db_payment;
USE db_payment;

CREATE TABLE `payments` (
  `id` int NOT NULL,
  `order_id` int NOT NULL,
  `payment_method` varchar(50) DEFAULT NULL,
  `va_number` varchar(50) DEFAULT NULL,
  `amount` decimal(10,2) NOT NULL,
  `status` enum('Unpaid','Paid') DEFAULT 'Unpaid',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

INSERT INTO `payments` (`id`, `order_id`, `payment_method`, `va_number`, `amount`, `status`, `created_at`) VALUES
(1, 1, 'Mandiri VA', '89502000111222', 25000.00, 'Unpaid', '2026-04-21 03:38:37'),
(2, 6, 'BCA VA', '888432628932', 116000.00, 'Paid', '2026-04-24 05:55:05');

ALTER TABLE `payments`
  ADD PRIMARY KEY (`id`);

ALTER TABLE `payments`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

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

-- --------------------------------------------------------
-- 4. DATABASE UNTUK RESTAURANT SERVICE
-- --------------------------------------------------------
CREATE DATABASE IF NOT EXISTS db_restaurant;
USE db_restaurant;

CREATE TABLE `restaurants` (
  `id` int NOT NULL,
  `name` varchar(255) NOT NULL,
  `address` text,
  `is_active` tinyint(1) DEFAULT '1',
  `image` varchar(255) DEFAULT NULL,
  `deskripsi` text,
  `jam_operasional` varchar(100) DEFAULT NULL,
  `rating` decimal(2,1) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

INSERT INTO `restaurants` (`id`, `name`, `address`, `is_active`, `image`, `deskripsi`, `jam_operasional`, `rating`) VALUES
(1, 'Bubur DPR (Dibawah Pohon Rindang)', 'Jl. Ambon No.15, Citarum (Area GOR Saparua)', 0, '/public/uploads/1776750254052.png', 'Bubur ayam legendaris dengan porsi mengenyangkan di area GOR Saparua.', '06:00 - 12:00', 4.5),
(2, 'Sate Jando Gasibu', 'Jl. Hayam Wuruk, Citarum (Belakang Gedung Sate)', 1, '/public/uploads/sate jando gasibu.jpg', 'Sate sapi dengan potongan lemak jando lezat dan bumbu kacang kental.', '07:00 - 15:00', 4.6),
(3, 'Warung Nasi Ibu Imas', 'Jl. Pungkur No. 81, Regol', 1, '/public/uploads/resto warung ibu imas.jpeg', 'Warung nasi khas Sunda yang terkenal dengan sambal karedok dan ayam bakar.', '07:00 - 23:59', 4.7),
(4, 'Ayam Goreng SPG', 'Jl. Balonggede No. 57, Regol', 1, '/public/uploads/warung ayam gore spg.jpeg', 'Ayam goreng serundeng porsi kuli dengan sambal ijo yang khas.', '09:00 - 21:00', 4.4),
(5, 'Iga Bakar Si Jangkung', 'Jl. Cipaganti No. 75, Pasteur', 1, '/public/uploads/si jangkung.jpg', 'Sajian iga sapi bakar dalam cobek tanah liat dengan bumbu kecap pedas.', '11:00 - 22:00', 4.6),
(6, 'Mie Bakso Akung', 'Jl. Lodaya No. 123, Burangrang', 1, '/public/uploads/resto baso akung.jpeg', 'Mie yamin manis dan bakso kuah legendaris dengan isian lengkap (BPK).', '10:00 - 20:00', 4.8),
(7, 'Bakmie Tjo Kin', 'Jl. Cihapit No. 18, Bandung Wetan', 1, '/public/uploads/bakmie tjo kin.jpeg', 'Bakmi gaya pecinan halal dengan tekstur mi kenyal dan ayam panggang.', '08:00 - 21:00', 4.5),
(8, 'Dimsum 9 Naga', 'Jl. Kebon Jati No. 129, Kebon Jeruk', 1, '/public/uploads/resto 9 naga.jpeg', 'Kedai dimsum otentik dengan suasana klasik bergaya Hong Kong.', '07:00 - 22:00', 4.6),
(9, 'Soto Ojolali', 'Jl. Cibadak No. 79, Karanganyar', 1, '/public/uploads/resto soto ojolali.jpg', 'Soto Bandung kuah bening segar dengan irisan lobak dan daging sapi empuk.', '09:00 - 21:00', 4.5),
(10, 'Nasi Goreng Bistik Astana Anyar', 'Jl. Astana Anyar No. 264, Nyengseret', 1, '/public/uploads/resto nasi goreng.jpg', 'Perpaduan unik nasi goreng dengan bistik ayam renyah dan saus mentega.', '17:00 - 23:00', 4.7),
(11, 'Mie Gacoan Dago', 'Jl. Ir. H. Juanda No. 138, Dago', 1, '/public/uploads/mie gacoan dago.jpeg', 'Mie pedas viral dengan aneka dimsum goreng dan harga mahasiswa.', '09:00 - 23:00', 4.3),
(12, 'Sambal Bakar Indonesia', 'Jl. Buah Batu No. 165, Turangga', 1, '/public/uploads/resto sambal bakar.jpg', 'Lauk pauk yang disajikan panas-panas di atas cobek berisi sambal bakar.', '10:00 - 23:00', 4.4),
(13, 'Batagor Kingsley', 'Jl. Veteran No. 25, Kebon Pisang', 1, '/public/uploads/batagor kingsley.jpeg', 'Batagor premium khas Bandung yang renyah di luar dan lembut di dalam.', '08:00 - 20:00', 4.7),
(14, 'Gudeg Banda', 'Jl. Lombok No. 30, Cihapit', 1, '/public/uploads/resto gudeg banda.jpeg', 'Nasi gudeg khas Jogja yang disesuaikan dengan lidah masyarakat lokal.', '08:00 - 15:00', 4.5),
(15, 'Rumah Makan Malah Dicubo', 'Jl. Pelajar Pejuang 45 No. 25, Lengkong', 1, '/public/uploads/malahdicubo.jpg', 'Rumah makan Sunda rumahan dengan aneka pepes dan tumisan segar.', '10:00 - 21:00', 4.4);

CREATE TABLE `menus` (
  `id` int NOT NULL,
  `restaurant_id` int DEFAULT NULL,
  `name` varchar(255) NOT NULL,
  `price` decimal(10,2) NOT NULL,
  `description` text,
  `image` varchar(255) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

INSERT INTO `menus` (`id`, `restaurant_id`, `name`, `price`, `description`, `image`) VALUES
(153, 1, 'Bubur Ayam Orginal', 12000.00, 'Bubur ayam polos gurih', '/public/uploads/1776938694882.jpg'),
(154, 1, 'Bubur Komplit', 20000.00, 'Bubur topping full', '/public/uploads/1776938885278.jpg'),
(155, 1, 'Bubur Ati Ampela', 18000.00, 'Bubur dengan ati ampela', '/public/uploads/1776938977072.jpg'),
(156, 1, 'Bubur telur', 16000.00, 'Bubur dengan telur rebus', '/public/uploads/1776939564426.jpg'),
(157, 1, 'Kerupuk', 3000.00, 'Kerupuk pelengkap', '/public/uploads/1776939641988.jpg'),
(158, 1, 'Teh Manis Hangat', 5000.00, 'Minuman hangat', '/public/uploads/1776939812159.jpg'),
(159, 1, 'Teh Tawar', 3000.00, 'Teh tanpa gula', '/public/uploads/1776939893340.jpg'),
(160, 1, 'Air Mineral ', 4000.00, 'Air Minum', '/public/uploads/1776939948987.jpg'),
(161, 2, 'Sate Jando', 25000.00, 'Sate lemak sapi khas', '/public/uploads/1776940127978.jpg'),
(163, 2, 'Sate Daging', 30000.00, 'Sate daging sapi', '/public/uploads/1776940334493.jpg'),
(164, 2, 'Sate Campur', 32000.00, 'Campuran daging dan jando', '/public/uploads/1776940426054.jpg'),
(165, 2, 'Lontong ', 5000.00, 'Pelengkap sate', '/public/uploads/1776940488755.jpg'),
(166, 2, 'Nasi Putih', 7000.00, 'Nasi Hangat', '/public/uploads/1776940546513.jpg'),
(167, 2, 'Sate Kulit', 20000.00, 'Kulit sapi bakar', '/public/uploads/1776940589420.jpg'),
(168, 2, 'Sate Pedas', 28000.00, 'Sate dengan sambal pedas', '/public/uploads/1776940640330.jpg'),
(169, 2, 'Es Teh', 6000.00, 'Minuman dingin', '/public/uploads/1776940696531.jpg'),
(170, 2, 'Teh Hangta', 5000.00, 'Minuman hangat', '/public/uploads/1776940736770.jpg'),
(171, 2, 'Jeruk Peras', 8000.00, 'Minuman jeruk segar', '/public/uploads/1776940795101.jpg'),
(172, 3, 'Nasi Timbel Komplit', 35000.00, 'Paket lengkap khas Sunda', '/public/uploads/1776940867108.jpg'),
(173, 3, 'Ayam Goreng', 20000.00, 'Ayam goreng gurih', '/public/uploads/1776940944515.jpg'),
(174, 3, 'Ayam Bakar', 22000.00, 'Ayam bakar manis', '/public/uploads/1776940985502.jpg'),
(175, 3, 'Gurame Goreng', 40000.00, 'Ikan gurame goreng', '/public/uploads/1776941032841.jpg'),
(176, 3, 'Sayur Asem ', 10000.00, 'Sayur asem segar', '/public/uploads/1776941070812.jpg'),
(177, 3, 'Karedok', 12000.00, 'Sayur mentah bumbu kacang', '/public/uploads/1776941111557.jpg'),
(181, 1, 'Siomay', 5000.00, 'Siomay enak bgt', '/public/uploads/1777354721735.png');

ALTER TABLE `restaurants`
  ADD PRIMARY KEY (`id`);

ALTER TABLE `menus`
  ADD PRIMARY KEY (`id`),
  ADD KEY `restaurant_id` (`restaurant_id`);

ALTER TABLE `restaurants`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=16;

ALTER TABLE `menus`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=182;

ALTER TABLE `menus`
  ADD CONSTRAINT `menus_ibfk_1` FOREIGN KEY (`restaurant_id`) REFERENCES `restaurants` (`id`) ON DELETE CASCADE;