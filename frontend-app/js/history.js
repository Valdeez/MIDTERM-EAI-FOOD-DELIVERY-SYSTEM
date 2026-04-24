// file: js/history.js

const ORDER_API = "http://localhost:3002/api";
const MENU_API = "http://localhost:3001/api";

document.addEventListener("DOMContentLoaded", muatDataPesanan);

async function muatDataPesanan() {
  const tbody = document.getElementById("tabelHistori");
  const userId = 1; // Simulasi user yang sedang login

  tbody.innerHTML = `
        <tr>
            <td colspan="5" class="text-center py-5 text-muted">
                <div class="spinner-border spinner-border-sm text-primary mb-2" role="status"></div>
                <br>Menyinkronkan data...
            </td>
        </tr>
    `;

  try {
    // 1. Fetch semua data orders dari Service Order
    const res = await fetch(`${ORDER_API}/orders?user_id=${userId}`);
    const result = await res.json();

    if (!res.ok) throw new Error(result.error || "Gagal mengambil data");

    const orders = result.data || [];

    // 2. Ambil daftar ID Restoran yang unik untuk meminimalkan request API
    const uniqueRestoIds = [...new Set(orders.map((o) => o.restaurant_id))];
    const restoNames = {};

    // 3. Fetch nama asli setiap restoran
    await Promise.all(
      uniqueRestoIds.map(async (id) => {
        try {
          const rRes = await fetch(`${MENU_API}/restaurants/detail?id=${id}`);
          const rData = await rRes.json();
          if (rData.data && rData.data.name) {
            restoNames[id] = rData.data.name;
          } else {
            restoNames[id] = `Resto-${id}`; // Fallback jika tidak ada nama
          }
        } catch (e) {
          restoNames[id] = `Resto-${id}`;
        }
      }),
    );

    // 4. Render tabel dengan data pesanan dan nama restoran asli
    renderTabel(orders, restoNames);
  } catch (error) {
    tbody.innerHTML = `
            <tr>
                <td colspan="5" class="text-center py-5 text-danger">
                    <i class="bi bi-exclamation-triangle fs-3 d-block mb-2"></i>
                    <strong>Error:</strong> ${error.message} <br>
                    <small>Pastikan Order Service (port 3002) berjalan.</small>
                </td>
            </tr>
        `;
  }
}

function renderTabel(orders, restoNames) {
  const tbody = document.getElementById("tabelHistori");
  tbody.innerHTML = "";

  if (!orders || orders.length === 0) {
    tbody.innerHTML = `
            <tr>
                <td colspan="5" class="text-center py-5 text-muted">
                    <i class="bi bi-receipt fs-1 text-light mb-3 d-block"></i>
                    Belum ada riwayat pesanan.
                    <br><a href="home.html" class="btn btn-primary rounded-pill px-4 py-2 mt-3 fw-semibold">Cari Makanan</a>
                </td>
            </tr>
        `;
    return;
  }

  // Reverse agar pesanan terbaru ada di atas
  orders.reverse().forEach((order) => {
    let badgeColor = "bg-secondary";
    if (order.status === "Pending") badgeColor = "bg-warning text-dark";
    if (order.status === "Diproses") badgeColor = "bg-info text-dark";
    if (order.status === "Selesai") badgeColor = "bg-success";

    // Ambil nama restoran dari object restoNames
    const rName =
      restoNames[order.restaurant_id] || `Resto-${order.restaurant_id}`;

    // Mencegah error jika nama resto mengandung tanda kutip (misal: Resto d'Best)
    const safeRestoNameForJS = rName.replace(/'/g, "\\'");
    const safeRestoNameForHTML = rName.replace(/'/g, "&#39;");

    // Format harga agar bulat (misal: 50.000, bukan 50000.00) dan berwarna biru (text-primary)
    const formattedPrice = parseInt(order.total_amount).toLocaleString("id-ID");

    const row = `
        <tr>
            <td class="ps-4 fw-bold text-dark">#ORD-${order.id}</td>
            <td><i class="bi bi-shop text-muted me-1"></i> ${safeRestoNameForHTML}</td>
            <td class="text-primary fw-bold">Rp ${formattedPrice}</td>
            <td><span class="badge ${badgeColor} rounded-pill px-3 py-2 fw-semibold">${order.status}</span></td>
            <td class="pe-4 text-center">
                <button class="btn btn-sm btn-outline-primary rounded-pill px-3" onclick="tampilkanDetail(${order.id}, ${order.restaurant_id}, ${order.total_amount}, '${safeRestoNameForJS}')">
                    Lihat Detail
                </button>
            </td>
        </tr>
    `;
    tbody.innerHTML += row;
  });
}

// === FUNGSI MODAL DETAIL ===
async function tampilkanDetail(
  orderId,
  restaurantId,
  totalAmount,
  restaurantName,
) {
  const modalElement = document.getElementById("detailModal");
  const modalObj = new bootstrap.Modal(modalElement);
  modalObj.show();

  const modalBody = document.getElementById("modal-body-content");
  modalBody.innerHTML = `<div class="text-center py-4"><div class="spinner-border text-primary" role="status"></div><p class="mt-2 text-muted small">Memuat detail pesanan...</p></div>`;

  try {
    // Fetch data Order Items (Port 3002)
    const itemsRes = await fetch(`${ORDER_API}/order-items/${orderId}`);
    const itemsResult = await itemsRes.json();
    const orderItems = itemsResult.data || [];

    // Fetch data Menu untuk mendapatkan Nama Menu (Port 3001)
    let menus = [];
    try {
      const menuRes = await fetch(
        `${MENU_API}/menus/detail?restaurant_id=${restaurantId}`,
      );
      const menuResult = await menuRes.json();
      menus = menuResult.data || [];
    } catch (e) {
      console.warn("Gagal mengambil nama menu");
    }

    // Mengambil metode pembayaran dari LocalStorage yang diset di halaman payment.html
    const paymentMethod =
      localStorage.getItem("last_payment_method") || "QRIS / VA";

    // Render Header Modal dengan Nama Asli dan Metode Pembayaran
    let htmlContent = `
            <div class="d-flex justify-content-between align-items-center mb-3 pb-3 border-bottom">
                <div>
                    <h6 class="mb-0 fw-bold">Pesanan #ORD-${orderId}</h6>
                    <small class="text-muted"><i class="bi bi-shop me-1"></i> ${restaurantName}</small>
                </div>
                <div class="text-end">
                    <small class="text-muted d-block" style="font-size: 0.7rem; text-transform: uppercase; font-weight: 700;">Metode Bayar</small>
                    <span class="badge bg-light text-dark border mt-1">${paymentMethod}</span>
                </div>
            </div>
            <div class="mb-3">
        `;

    // Render setiap menu yang dipesan
    orderItems.forEach((item) => {
      const dataMenu = menus.find((m) => m.id === item.menu_id);
      const namaMenu = dataMenu ? dataMenu.name : `Menu ID-${item.menu_id}`;
      const subtotalItem = parseInt(item.qty) * parseInt(item.price);

      htmlContent += `
                <div class="d-flex justify-content-between mb-2 align-items-center">
                    <div>
                        <span class="fw-semibold text-dark">${item.qty}x</span> <span class="text-dark">${namaMenu}</span>
                    </div>
                    <span class="text-muted small">Rp ${subtotalItem.toLocaleString("id-ID")}</span>
                </div>
            `;
    });

    // Render Total
    htmlContent += `
            </div>
            <div class="d-flex justify-content-between pt-3 border-top mt-2 align-items-center">
                <span class="fw-bold">Total Pembayaran</span>
                <span class="fw-bold text-primary fs-5">Rp ${parseInt(totalAmount).toLocaleString("id-ID")}</span>
            </div>
        `;

    modalBody.innerHTML = htmlContent;
  } catch (error) {
    modalBody.innerHTML = `
            <div class="alert alert-danger mb-0">
                Gagal memuat detail barang pesanan.
            </div>
        `;
  }
}
