// Konfigurasi API
const API_BASE_URL = "http://localhost:3001/api";
const ORDER_API_URL = "http://localhost:3002/api";

// State aplikasi
let cart = {};
let currentRestaurantId = null;

document.addEventListener("DOMContentLoaded", () => {
  updateNavbar();
  const urlParams = new URLSearchParams(window.location.search);
  currentRestaurantId = urlParams.get("id");

  if (currentRestaurantId) {
    fetchRestaurantDetail(currentRestaurantId);
    fetchRestaurantMenus(currentRestaurantId);
  } else {
    alert("Restoran tidak ditemukan!");
    window.location.href = "home.html";
  }
});

function updateNavbar() {
  const navAuth = document.getElementById("nav-auth");
  const sessionRaw = localStorage.getItem("user_session");
  const navHistory = document.getElementById("nav-history");

  if (sessionRaw) {
    // User sudah login → tampilkan avatar + nama + tombol logout
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
    // User belum login → tampilkan tombol Login
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

  // (Opsional) Tutup modal secara manual sebelum pindah halaman, biar transisinya lebih mulus
  const modalElement = document.getElementById("logoutModal");
  const modalInstance = bootstrap.Modal.getInstance(modalElement);
  if (modalInstance) {
    modalInstance.hide();
  }

  // Pindah ke halaman login
  window.location.href = "login.html";
}

// 1. Ambil Detail Restoran
async function fetchRestaurantDetail(id) {
  try {
    const response = await fetch(`${API_BASE_URL}/restaurants/detail?id=${id}`);
    const result = await response.json();
    const resto = result.data;

    document.getElementById("resto-name").innerText = resto.name;
    document.getElementById("resto-address").innerText = resto.address;
    document.getElementById("resto-description").innerText =
      resto.deskripsi || "Tidak ada deskripsi.";
    document.getElementById("resto-hours").innerText =
      resto.jam_operasional || "-";
    document.getElementById("resto-image").src =
      `http://localhost:3001${resto.image}`;
  } catch (error) {
    console.error("Gagal mengambil detail restoran:", error);
  }
}

// 2. Ambil Daftar Menu
async function fetchRestaurantMenus(id) {
  try {
    const response = await fetch(
      `${API_BASE_URL}/menus/detail?restaurant_id=${id}`,
    );
    const result = await response.json();
    renderMenus(result.data);
  } catch (error) {
    console.error("Gagal mengambil menu:", error);
    document.getElementById("menu-items").innerHTML =
      '<p class="text-danger">Gagal memuat menu.</p>';
  }
}

// 3. Render Menu
function renderMenus(menus) {
  const container = document.getElementById("menu-items");
  container.innerHTML = "";

  if (!menus || menus.length === 0) {
    container.innerHTML = '<p class="text-muted">Belum ada menu tersedia.</p>';
    return;
  }

  menus.forEach((menu) => {
    const menuImage = `http://localhost:3001${menu.image}`;

    const itemHtml = `
            <div class="menu-item-card">
                <div class="d-flex align-items-center gap-3">
                    <img src="${menuImage}" alt="${menu.name}" class="menu-item-img shadow-sm">
                    <div>
                        <h6 class="mb-0 fw-bold">${menu.name}</h6>
                        <p class="menu-description">${menu.description}</p>
                        <span class="text-primary fw-bold small">Rp ${parseInt(menu.price).toLocaleString("id-ID")}</span>
                    </div>
                </div>

                <div class="qty-picker">
                    <button class="btn-qty" onclick="changeQty('${menu.id}', -1, '${menu.name}', ${menu.price}, '${menuImage}')">-</button>
                    <span id="qty-${menu.id}" class="fw-bold">0</span>
                    <button class="btn-qty" onclick="changeQty('${menu.id}', 1, '${menu.name}', ${menu.price}, '${menuImage}')">+</button>
                </div>
            </div>
        `;
    container.innerHTML += itemHtml;
  });
}

// 4. Logika Keranjang (Dibuat global agar bisa diakses dari atribut onclick)
// Tambahkan parameter 'image'
window.changeQty = function (id, delta, name, price, image) {
  // Simpan juga imagenya ke dalam cart
  if (!cart[id])
    cart[id] = { name: name, price: parseInt(price), qty: 0, image: image };

  cart[id].qty += delta;
  if (cart[id].qty < 0) cart[id].qty = 0;

  document.getElementById(`qty-${id}`).innerText = cart[id].qty;
  updateCartUI();
};

function updateCartUI() {
  const list = document.getElementById("cart-list");
  let subtotal = 0;
  let totalItems = 0;
  let html = "";

  for (const key in cart) {
    if (cart[key].qty > 0) {
      let itemTotal = cart[key].qty * cart[key].price;
      subtotal += itemTotal;
      totalItems += cart[key].qty;
      html += `
                <div class="d-flex justify-content-between mb-2 small">
                    <span>${cart[key].qty}x ${cart[key].name}</span>
                    <span class="fw-600">Rp ${itemTotal.toLocaleString("id-ID")}</span>
                </div>`;
    }
  }

  if (totalItems === 0) {
    list.innerHTML =
      '<div class="text-center py-3 text-muted small">Belum ada menu dipilih</div>';
    document.getElementById("btn-confirm").disabled = true;
    resetPricing();
  } else {
    list.innerHTML = html;
    document.getElementById("btn-confirm").disabled = false;
    let fee = 2000;
    document.getElementById("item-count").innerText = `${totalItems} Item`;
    document.getElementById("fee").innerText =
      `Rp ${fee.toLocaleString("id-ID")}`;
    document.getElementById("subtotal").innerText =
      `Rp ${subtotal.toLocaleString("id-ID")}`;
    document.getElementById("total").innerText =
      `Rp ${(subtotal + fee).toLocaleString("id-ID")}`;
  }
}

function resetPricing() {
  document.getElementById("item-count").innerText = "0 Item";
  document.getElementById("subtotal").innerText = "Rp 0";
  document.getElementById("fee").innerText = "Rp 0";
  document.getElementById("total").innerText = "Rp 0";
}

// 5. Checkout Action
// Jadikan fungsinya async karena kita butuh await untuk API Fetch
window.handleCheckout = async function () {
  const sessionRaw = localStorage.getItem("user_session");
  if (!sessionRaw) {
    // Panggil modal peringatan login yang sudah kita buat di HTML
    const loginModal = new bootstrap.Modal(
      document.getElementById("loginRequiredModal"),
    );
    loginModal.show();

    return; // Hentikan proses fungsi sampai di sini
  }
  const user = JSON.parse(sessionRaw);
  const userId = user.id;
  const btn = document.getElementById("btn-confirm");
  const totalAmount = parseInt(
    document.getElementById("total").innerText.replace(/[^0-9]/g, ""),
  );

  // Ubah status tombol biar tidak di-spam klik
  btn.disabled = true;
  btn.innerText = "Memproses Pesanan...";

  try {
    // --- PROSES 1: INSERT KE TABEL 'orders' ---
    const orderPayload = {
      user_id: userId, // Simulasi User ID
      restaurant_id: currentRestaurantId,
      total_amount: totalAmount,
    };

    const orderRes = await fetch("http://localhost:3002/api/orders", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(orderPayload),
    });

    const orderResult = await orderRes.json();
    if (!orderRes.ok)
      throw new Error(orderResult.error || "Gagal membuat order");

    const newOrderId = orderResult.order_id;

    // --- PROSES 2: INSERT KE TABEL 'order_items' ---
    const itemPromises = [];

    for (const menuId in cart) {
      if (cart[menuId].qty > 0) {
        const itemPayload = {
          order_id: newOrderId,
          menu_id: menuId,
          qty: cart[menuId].qty,
          price: cart[menuId].price,
        };

        const itemReq = fetch("http://localhost:3002/api/order-items", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(itemPayload),
        });
        itemPromises.push(itemReq);
      }
    }

    // Tunggu semua menu berhasil masuk ke keranjang di database
    await Promise.all(itemPromises);

    // --- PROSES 3: LEMPAR KE HALAMAN PAYMENT ---
    // Bawa data order_id dan amount lewat URL
    // Ganti baris "window.location.href" di detail.js kamu dengan baris ini:
    window.location.href = `payment.html?order_id=${newOrderId}&amount=${totalAmount}&restaurant_id=${currentRestaurantId}`;
  } catch (error) {
    console.error("Checkout error:", error);
    alert(`Terjadi kesalahan: ${error.message}`);

    // Kembalikan tombol seperti semula jika gagal
    btn.disabled = false;
    btn.innerText = "Konfirmasi Pesanan";
  }
};
