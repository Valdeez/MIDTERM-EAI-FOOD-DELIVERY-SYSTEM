// home.js

document.addEventListener("DOMContentLoaded", () => {
  updateNavbar();
  fetchRestaurants();
});

// ── NAVBAR: cek status login dari localStorage ──────────────────────────────
function updateNavbar() {
  const navAuth = document.getElementById("nav-auth");
  const sessionRaw = localStorage.getItem("user_session");

  if (sessionRaw) {
    // User sudah login → tampilkan avatar + nama + tombol logout
    const user = JSON.parse(sessionRaw);
    const firstName = user.name ? user.name.split(" ")[0] : "User";
    const initial = firstName.charAt(0).toUpperCase();

    navAuth.innerHTML = `
      <div class="user-greeting">
      
         <button class="btn-logout-modern" onclick="logout()">
          <span>Keluar</span>
          <i class="bi bi-box-arrow-right"></i>
        </button>
       <span class="fw-bold text-dark" style="font-size: 1.15rem;">Hi, ${firstName}!</span>
      </div>
     
    `;
  } else {
    // User belum login → tampilkan tombol Login
    navAuth.innerHTML = `
      <a href="login.html" class="btn-login-nav shadow-sm">
        <i class="bi bi-person-circle me-1"></i> Masuk
      </a>
    `;
  }
}

function logout() {
  localStorage.removeItem("user_session");
  window.location.href = "login.html";
}

// ── FETCH & RENDER RESTORAN ──────────────────────────────────────────────────
async function fetchRestaurants() {
  const restoCount = document.getElementById("resto-count");
  try {
    const response = await fetch("http://localhost:3001/api/restaurants");
    const result = await response.json();

    if (result.data) {
      restoCount.innerText = `${result.data.length} Restoran ditemukan`;
      renderRestaurants(result.data);
    }
  } catch (error) {
    console.error("Gagal mengambil data restoran:", error);
    restoCount.innerText = "Gagal memuat";
  }
}

function renderRestaurants(restaurants) {
  const container = document.getElementById("restaurant-container");
  if (!container) return;
  container.innerHTML = "";

  restaurants.forEach((resto) => {
    const baseUrl = "http://localhost:3001";
    const imageSrc = resto.image
      ? resto.image.startsWith("http")
        ? resto.image
        : `${baseUrl}${resto.image}`
      : "https://via.placeholder.com/300";

    const card = `
      <div class="col-md-4 mb-4">
        <div class="card h-100 border-0 shadow-sm" style="border-radius: 16px; overflow: hidden;">
          <img src="${imageSrc}" class="card-img-top" alt="${resto.name}" style="height: 200px; object-fit: cover;">
          <div class="card-body">
            <div class="d-flex justify-content-between align-items-center mb-2">
              <span class="badge ${resto.is_active ? "bg-success" : "bg-danger"} small">
                ${resto.is_active ? "Open" : "Closed"}
              </span>
            </div>
            <h5 class="fw-bold mb-1">${resto.name}</h5>
            <p class="text-muted small mb-3">${resto.address}</p>
            <div class="d-flex justify-content-between align-items-center">
              <div class="text-warning small">${renderStars(resto.rating)}</div>
              <a href="detail.html?id=${resto.id}" class="btn btn-outline-primary btn-sm px-3" style="border-radius: 50px;">Detail</a>
            </div>
          </div>
        </div>
      </div>
    `;
    container.innerHTML += card;
  });
}

function renderStars(rating) {
  let stars = "";
  for (let i = 0; i < 5; i++) {
    stars += i < rating
      ? '<i class="bi bi-star-fill"></i>'
      : '<i class="bi bi-star"></i>';
  }
  return stars;
}