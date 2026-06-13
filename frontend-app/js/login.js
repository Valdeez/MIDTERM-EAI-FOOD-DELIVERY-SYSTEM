const API_BASE = "http://localhost:3004/";

const authContainer = document.getElementById("auth-container");
const loginView = document.getElementById("login-view");
const regView = document.getElementById("register-view");
const loginAlert = document.getElementById("login-alert");
const regAlert = document.getElementById("reg-alert");
const linkToReg = document.getElementById("link-to-reg");
const linkToLogin = document.getElementById("link-to-login");
const eyeLogin = document.getElementById("eye-login");
const lPassword = document.getElementById("l-password");

function switchView(view) {
  loginAlert.style.display = "none";
  regAlert.style.display = "none";
  authContainer.classList.remove("fade-in");
  void authContainer.offsetWidth;
  authContainer.classList.add("fade-in");

  if (view === "reg") {
    loginView.style.display = "none";
    regView.style.display = "block";
  } else {
    regView.style.display = "none";
    loginView.style.display = "block";
  }
}

linkToReg.addEventListener("click", () => switchView("reg"));
linkToLogin.addEventListener("click", () => switchView("login"));

eyeLogin.addEventListener("click", function () {
  const type =
    lPassword.getAttribute("type") === "password" ? "text" : "password";
  lPassword.setAttribute("type", type);
  this.classList.toggle("fa-eye");
  this.classList.toggle("fa-eye-slash");
});

document
  .getElementById("register-form")
  .addEventListener("submit", async (e) => {
    e.preventDefault();
    const name = document.getElementById("r-username").value;
    const password = document.getElementById("r-password").value;

    try {
      const response = await fetch(API_BASE, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          query: `
            mutation Register($name: String!, $password: String!, $role: String) {
              register(name: $name, password: $password, role: $role) {
                message
                user_id
              }
            }
          `,
          variables: { name: name, password: password, role: "customer" }
        }),
      });

      const result = await response.json();

      if (!result.errors && result.data && result.data.register) {
        regAlert.className = "status-alert status-success";
        regAlert.innerHTML =
          '<i class="fa-solid fa-circle-check"></i> Berhasil daftar! Silakan login.';
        regAlert.style.display = "flex";
        setTimeout(() => switchView("login"), 2000);
      } else {
        regAlert.className = "status-alert status-error";
        regAlert.innerHTML =
          '<i class="fa-solid fa-circle-xmark"></i> Gagal daftar. Nama mungkin sudah ada.';
        regAlert.style.display = "flex";
        console.error(result.errors);
      }
    } catch (err) {
      regAlert.className = "status-alert status-error";
      regAlert.innerHTML =
        '<i class="fa-solid fa-plug-circle-xmark"></i> Server tidak merespon.';
      regAlert.style.display = "flex";
      console.error(err);
    }
  });

document.getElementById("login-form").addEventListener("submit", async (e) => {
  e.preventDefault();
  const name = document.getElementById("l-username").value;
  const password = lPassword.value;

  try {
    const response = await fetch(API_BASE, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        query: `
          mutation Login($name: String!, $password: String!) {
            login(name: $name, password: $password) {
              message
              data {
                id
                name
                role
                restaurant_id
              }
            }
          }
        `,
        variables: { name: name, password: password }
      }),
    });

    const result = await response.json();

    if (!result.errors && result.data && result.data.login) {
      loginAlert.className = "status-alert status-success";
      loginAlert.innerHTML = `<i class="fa-solid fa-circle-check"></i> Berhasil! Mengalihkan...`;
      loginAlert.style.display = "flex";

      const userData = result.data.login.data;

      localStorage.setItem("user_session", JSON.stringify(userData));
      localStorage.setItem("user_id", userData.id);
      localStorage.setItem("user_role", userData.role);

      setTimeout(() => {
        if (userData.role === "crew") {
          localStorage.setItem("crew_resto_id", userData.restaurant_id);
          window.location.href = "crew-dashboard.html";
        } else {
          window.location.href = "home.html";
        }
      }, 1000);
    } else {
      loginAlert.className = "status-alert status-error";
      loginAlert.innerHTML =
        '<i class="fa-solid fa-circle-exclamation"></i> Username/Password salah.';
      loginAlert.style.display = "flex";
      console.error(result.errors);
    }
  } catch (err) {
    loginAlert.className = "status-alert status-error";
    loginAlert.innerHTML =
      '<i class="fa-solid fa-plug-circle-xmark"></i> Server mati.';
    loginAlert.style.display = "flex";
    console.error(err);
  }
});