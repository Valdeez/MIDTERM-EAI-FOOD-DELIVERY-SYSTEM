const ORDER_API = "http://localhost:3002/api";
const MENU_API = "http://localhost:3001/api";

document.addEventListener("DOMContentLoaded", () => {
  muatDataPesanan();
  updateNavbar();
});

function updateNavbar() {
  const navAuth = document.getElementById("nav-auth");
  const sessionRaw = localStorage.getItem("user_session");
  const navHistory = document.getElementById("nav-history");

  if (sessionRaw) {
    const user = JSON.parse(sessionRaw);
    const firstName = user.name ? user.name.split(" ")[0] : "User";
    const initial = firstName.charAt(0).toUpperCase();
    if (navHistory) {
      navHistory.classList.remove("d-none");
    }
    navAuth.innerHTML = `
      <div class="user-greeting">
      
      <span class="fw-bold text-dark" style="font-size: 1.15rem;">Hi, ${firstName}!</span>
         <button class="btn-logout-modern" data-bs-toggle="modal" data-bs-target="#logoutModal">
          <i class="bi bi-box-arrow-right"></i>
        </button>
      </div>
     
    `;
  } else {
    if (navHistory) {
      navHistory.classList.add("d-none");
    }
    navAuth.innerHTML = `
      <a href="login.html" class="btn-login-nav shadow-sm">
        <i class="bi bi-person-circle me-1"></i> Masuk
      </a>
    `;
  }
}

function executeLogout() {
  localStorage.removeItem("user_session");

  const modalElement = document.getElementById("logoutModal");
  const modalInstance = bootstrap.Modal.getInstance(modalElement);
  if (modalInstance) {
    modalInstance.hide();
  }

  window.location.href = "login.html";
}

async function muatDataPesanan() {
  const tbody = document.getElementById("tabelHistori");
  const sessionRaw = localStorage.getItem("user_session");
  const user = JSON.parse(sessionRaw);
  const userId = user.id;

  tbody.innerHTML = `
        <tr>
            <td colspan="5" class="text-center py-5 text-muted">
                <div class="spinner-border spinner-border-sm text-primary mb-2" role="status"></div>
                <br>Menyinkronkan data...
            </td>
        </tr>
    `;

  try {
    const res = await fetch(`${ORDER_API}/orders?user_id=${userId}`);
    const result = await res.json();

    if (!res.ok) throw new Error(result.error || "Gagal mengambil data");

    const orders = result.data || [];

    const uniqueRestoIds = [...new Set(orders.map((o) => o.restaurant_id))];
    const restoNames = {};

    await Promise.all(
      uniqueRestoIds.map(async (id) => {
        try {
          const rRes = await fetch(`${MENU_API}/restaurants/detail?id=${id}`);
          const rData = await rRes.json();
          if (rData.data && rData.data.name) {
            restoNames[id] = rData.data.name;
          } else {
            restoNames[id] = `Resto-${id}`;
          }
        } catch (e) {
          restoNames[id] = `Resto-${id}`;
        }
      }),
    );

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

  orders.reverse().forEach((order) => {
    let badgeColor = "bg-secondary";
    if (order.status === "Pending") badgeColor = "bg-warning text-dark";
    if (order.status === "Diproses") badgeColor = "bg-info text-dark";
    if (order.status === "Selesai") badgeColor = "bg-success";

    const rName =
      restoNames[order.restaurant_id] || `Resto-${order.restaurant_id}`;

    const safeRestoNameForJS = rName.replace(/'/g, "\\'");
    const safeRestoNameForHTML = rName.replace(/'/g, "&#39;");

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
    const itemsRes = await fetch(`${ORDER_API}/order-items/${orderId}`);
    const itemsResult = await itemsRes.json();
    const orderItems = itemsResult.data || [];

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

    const paymentMethod =
      localStorage.getItem("last_payment_method") || "QRIS / VA";

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
