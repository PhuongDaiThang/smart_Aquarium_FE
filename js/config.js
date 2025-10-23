// === Configuration Module ===
// Cấu hình kết nối ESP32

// Địa chỉ IP của ESP32
// Thay đổi theo IP thực tế của ESP32 (xem Serial Monitor sau khi ESP32 kết nối WiFi)
export const ESP32_IP = "192.168.1.100"; // ⚠️ THAY ĐỔI IP NÀY

// Base URL cho API
export const API_BASE_URL = `http://${ESP32_IP}`;

// API Endpoints
export const API_ENDPOINTS = {
  status: `${API_BASE_URL}/api/status`,
  temperature: `${API_BASE_URL}/api/temperature`,
  pump: `${API_BASE_URL}/api/pump`,
  light: `${API_BASE_URL}/api/light`,
  feed: `${API_BASE_URL}/api/feed`,
};

// Polling interval (ms)
export const POLLING_INTERVAL = 2000; // Update every 2 seconds

// Demo mode (nếu true, không connect ESP32, dùng random data)
export const DEMO_MODE = true; // Đổi thành false khi connect ESP32 thật
