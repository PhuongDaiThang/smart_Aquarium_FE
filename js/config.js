// === Configuration Module ===
// Cấu hình kết nối ESP32

// ============================================
// ⚠️ CẤU HÌNH QUAN TRỌNG - ĐỌC KỸ!
// ============================================

// 📍 Bước 1: Lấy IP của ESP32
// - Upload code esp32_webserver.ino lên ESP32
// - Mở Serial Monitor (115200 baud)
// - Tìm dòng: "IP address: 192.168.1.XXX"
// - Copy IP đó vào dưới đây

export const ESP32_IP = "192.168.1.100"; // ⚠️ THAY ĐỔI IP NÀY!

// 🎭 Bước 2: Tắt DEMO MODE
// - DEMO_MODE = true  → Dữ liệu RANDOM (giả lập) ❌
// - DEMO_MODE = false → TẤT CẢ từ phần cứng ESP32 ✅

export const DEMO_MODE = false; // ✅ ĐÃ TẮT DEMO - TẤT CẢ TỪ PHẦN CỨNG!
// ⚠️ Khi DEMO_MODE = false:
//    - Nhiệt độ từ DS18B20 (GPIO4)
//    - Phao từ cảm biến (GPIO27)
//    - Pump state từ ESP32
//    - KHÔNG có giá trị mặc định nào!

// ============================================
// Không cần sửa phần dưới
// ============================================

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

// Polling interval (ms) - Update mỗi 2 giây
export const POLLING_INTERVAL = 2000;
