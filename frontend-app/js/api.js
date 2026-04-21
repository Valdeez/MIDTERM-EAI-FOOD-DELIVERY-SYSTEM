// file: js/api.js

const BASE_URL = "http://localhost:3000/api";

// Fungsi helper untuk mengirim data (POST)
async function apiPost(endpoint, data) {
  try {
    const response = await fetch(`${BASE_URL}${endpoint}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    });

    const result = await response.json();
    if (!response.ok)
      throw new Error(
        result.error || result.message || "Terjadi kesalahan server",
      );

    return result;
  } catch (error) {
    throw error;
  }
}

// Fungsi helper untuk mengambil data (GET)
async function apiGet(endpoint) {
  try {
    const response = await fetch(`${BASE_URL}${endpoint}`);
    const result = await response.json();

    if (!response.ok)
      throw new Error(result.error || result.message || "Gagal mengambil data");

    return result;
  } catch (error) {
    throw error;
  }
}
