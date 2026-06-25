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
