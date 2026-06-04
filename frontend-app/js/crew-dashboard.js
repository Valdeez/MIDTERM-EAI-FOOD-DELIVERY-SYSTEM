const MENU_API = "http://localhost:3001/api";
const ORDER_API = "http://localhost:3002/api";

const checkRole = localStorage.getItem("user_role");

if (!checkRole || checkRole != "crew") {
  alert("Akses Ditolak! Halaman ini khusus untuk Crew Restoran.");
  window.location.href = "login.html";
}

if (!localStorage.getItem("crew_resto_id")) {
  localStorage.setItem("crew_resto_id", "1");
}
const CREW_RESTO_ID = localStorage.getItem("crew_resto_id");

document.addEventListener("DOMContentLoaded", () => {
  let crewName = "Crew";
  const sessionData = localStorage.getItem("user_session");

  if (sessionData) {
    const parsedSession = JSON.parse(sessionData);
    crewName = parsedSession.name || "Crew";
  }

  document.getElementById("crew-greeting").innerHTML =
    `Halo, <span class="fw-bold text-dark">Crew ${crewName}</span>!`;

  loadRestoProfile();
  loadOrders();
  loadMenus();
});

async function loadOrders() {
  const tbody = document.getElementById("table-orders");
  tbody.innerHTML = `<tr><td colspan="4" class="text-center py-4"><div class="spinner-border text-primary spinner-border-sm"></div> Memuat...</td></tr>`;

  try {
    const res = await fetch(`${ORDER_API}/orders`);
    const result = await res.json();

    let orders = result.data || [];
    orders = orders.filter((o) => o.restaurant_id == CREW_RESTO_ID).reverse();

    if (orders.length === 0) {
      tbody.innerHTML = `<tr><td colspan="4" class="text-center text-muted py-4">Belum ada pesanan masuk.</td></tr>`;
      return;
    }

    let html = "";
    orders.forEach((order) => {
      let badge = "bg-secondary";
      let actionBtn = "-";

      if (order.status === "Pending") {
        badge = "bg-warning text-dark";
        actionBtn = `<button class="btn btn-sm btn-success fw-medium" onclick="approveOrder(${order.id})"><i class="bi bi-check-lg"></i> Terima Pesanan</button>`;
      } else if (order.status === "Diproses") {
        badge = "bg-info text-dark";
        actionBtn = `<button class="btn btn-sm btn-primary fw-medium" onclick="finishOrder(${order.id})"><i class="bi bi-flag"></i> Selesaikan</button>`;
      } else {
        badge = "bg-success";
        actionBtn = `<span class="text-muted small"><i class="bi bi-check-all"></i> Selesai</span>`;
      }

      html += `
                <tr>
                    <td class="fw-bold">#ORD-${order.id}</td>
                    <td class="text-primary fw-semibold">Rp ${parseInt(order.total_amount).toLocaleString("id-ID")}</td>
                    <td><span class="badge ${badge} px-2 py-1">${order.status}</span></td>
                    <td class="text-center">${actionBtn}</td>
                </tr>
            `;
    });
    tbody.innerHTML = html;
  } catch (e) {
    tbody.innerHTML = `<tr><td colspan="4" class="text-center text-danger">Gagal memuat pesanan.</td></tr>`;
  }
}

async function approveOrder(orderId) {
  if (!confirm("Terima pesanan ini dan mulai proses memasak?")) return;
  updateOrderStatus(orderId, "Diproses");
}

async function finishOrder(orderId) {
  if (!confirm("Tandai pesanan ini selesai dan siap diambil/diantar?")) return;
  updateOrderStatus(orderId, "Selesai");
}

async function updateOrderStatus(orderId, newStatus) {
  try {
    const res = await fetch(`${ORDER_API}/orders/${orderId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: newStatus }),
    });

    if (res.ok) {
      loadOrders();
    } else {
      alert("Gagal mengupdate status pesanan.");
    }
  } catch (e) {
    console.error(e);
    alert("Terjadi kesalahan koneksi ke Order Service.");
  }
}

let menuModalInstance;

async function loadMenus() {
  const tbody = document.getElementById("table-menus");
  try {
    const res = await fetch(
      `${MENU_API}/menus/detail?restaurant_id=${CREW_RESTO_ID}`,
    );
    const result = await res.json();
    const menus = result.data || [];

    let html = "";
    menus.forEach((menu) => {
      const desc = menu.description || "-";
      const safeDesc = desc.replace(/'/g, "\\'");
      const safeName = menu.name.replace(/'/g, "\\'");

      html += `
                <tr>
                    <td class="fw-bold text-dark">${menu.name}</td>
                    <td>Rp ${parseInt(menu.price).toLocaleString("id-ID")}</td>
                    <td class="text-muted small">${desc}</td>
                    <td class="text-center">
                        <button class="btn btn-sm btn-light border me-1" onclick="openMenuModal('${menu.id}', '${safeName}', '${menu.price}', '${safeDesc}')"><i class="bi bi-pencil"></i></button>
                        <button class="btn btn-sm btn-outline-danger" onclick="deleteMenu(${menu.id})"><i class="bi bi-trash"></i></button>
                    </td>
                </tr>
            `;
    });
    tbody.innerHTML =
      html ||
      `<tr><td colspan="4" class="text-center text-muted">Belum ada menu.</td></tr>`;
  } catch (e) {
    console.error(e);
  }
}

function openMenuModal(id = "", name = "", price = "", desc = "") {
  document.getElementById("menu-id").value = id;
  document.getElementById("menu-name").value = name;
  document.getElementById("menu-price").value = price;
  document.getElementById("menu-desc").value = desc !== "-" ? desc : "";
  document.getElementById("menu-image").value = "";

  document.getElementById("menuModalTitle").innerText = id
    ? "Edit Menu"
    : "Tambah Menu Baru";

  if (!menuModalInstance) {
    menuModalInstance = new bootstrap.Modal(
      document.getElementById("menuModal"),
    );
  }
  menuModalInstance.show();
}

async function saveMenu() {
  const id = document.getElementById("menu-id").value;

  const formData = new FormData();
  formData.append("restaurant_id", CREW_RESTO_ID);
  formData.append("crew_restaurant_id", CREW_RESTO_ID);
  formData.append("name", document.getElementById("menu-name").value);
  formData.append("price", document.getElementById("menu-price").value);
  formData.append("description", document.getElementById("menu-desc").value);

  const imageFile = document.getElementById("menu-image").files[0];
  if (imageFile) {
    formData.append("image", imageFile);
  }

  const url = id ? `${MENU_API}/menus/${id}` : `${MENU_API}/menus`;
  const method = id ? "PUT" : "POST";

  try {
    const res = await fetch(url, {
      method: method,
      body: formData,
    });

    if (res.ok) {
      menuModalInstance.hide();
      loadMenus();
    } else {
      const err = await res.json();
      alert("Gagal menyimpan menu: " + err.message);
    }
  } catch (e) {
    console.error(e);
  }
}

async function deleteMenu(id) {
  if (!confirm("Hapus menu ini secara permanen?")) return;
  try {
    const res = await fetch(`${MENU_API}/menus/${id}`, {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ crew_restaurant_id: CREW_RESTO_ID }),
    });
    if (res.ok) loadMenus();
  } catch (e) {
    console.error(e);
  }
}

async function loadRestoProfile() {
  try {
    const res = await fetch(
      `${MENU_API}/restaurants/detail?id=${CREW_RESTO_ID}`,
    );
    const result = await res.json();
    const resto = result.data;

    document.getElementById("dash-resto-name").innerText = resto.name;
    document.getElementById("dash-resto-address").innerText = resto.address;

    document.getElementById("prof-name").value = resto.name;
    document.getElementById("prof-address").value = resto.address;
    document.getElementById("prof-hours").value = resto.jam_operasional || "";
    document.getElementById("prof-desc").value = resto.deskripsi || "";
    document.getElementById("prof-active").value = resto.is_active ? "1" : "0";
  } catch (e) {
    console.error("Gagal memuat profil restoran");
  }
}

async function saveRestoProfile() {
  const formData = new FormData();
  formData.append("name", document.getElementById("prof-name").value);
  formData.append("address", document.getElementById("prof-address").value);
  formData.append(
    "jam_operasional",
    document.getElementById("prof-hours").value,
  );
  formData.append("deskripsi", document.getElementById("prof-desc").value);
  formData.append("is_active", document.getElementById("prof-active").value);
  formData.append("crew_restaurant_id", CREW_RESTO_ID);

  const imageFile = document.getElementById("prof-image").files[0];
  if (imageFile) {
    formData.append("image", imageFile);
  }

  try {
    const res = await fetch(`${MENU_API}/restaurants/${CREW_RESTO_ID}`, {
      method: "PUT",
      body: formData,
    });

    if (res.ok) {
      alert("Profil restoran berhasil diperbarui!");
      document.getElementById("prof-image").value = "";
      loadRestoProfile();
    } else {
      const err = await res.json();
      alert("Gagal memperbarui profil: " + err.message);
    }
  } catch (e) {
    console.error(e);
  }
}

function executeLogout() {
  localStorage.removeItem("user_session");
  localStorage.removeItem("user_role");
  localStorage.removeItem("crew_resto_id");
  window.location.href = "home.html";
}
