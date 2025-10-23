// === Temperature Module ===
// Quản lý hiển thị nhiệt độ và gauge (đồng hồ nhiệt độ)

import { pushHistory } from "./history.js";
import { API_ENDPOINTS, DEMO_MODE, POLLING_INTERVAL } from "./config.js";
import { setControlsEnabled } from "./controls.js";

const gauge = document.getElementById("gauge");
const tempNum = document.getElementById("tempNum");
const tempStatus = document.getElementById("tempStatus");
const floatStatus = document.getElementById("floatStatus");
const btnRefresh = document.getElementById("btn-refresh");

let pollingInterval = null;

/**
 * Cập nhật giá trị nhiệt độ và trạng thái
 * @param {number} val - Giá trị nhiệt độ (°C)
 */
export function setTemp(val) {
  const v = Math.max(0, Math.min(50, Number(val) || 0));
  gauge.style.setProperty("--value", v);
  tempNum.innerHTML = `${v.toFixed(1)}<small>°C</small>`;

  let status = "Ổn định",
    cls = "state-pill";
  if (v < 24) {
    status = "Quá lạnh";
    cls += " off";
  } else if (v > 28) {
    status = "Quá nóng";
    cls += " warn";
  } else {
    status = "Ổn định";
    cls += " on";
  }

  tempStatus.className = cls;
  tempStatus.textContent = status;
}

/**
 * Cập nhật trạng thái phao (float sensor)
 * @param {string} level - "HIGH" hoặc "LOW"
 */
function updateFloatStatus(level) {
  if (!floatStatus) return;

  floatStatus.textContent = level === "HIGH" ? "Cao" : "Thấp";
  floatStatus.className = "state-pill " + (level === "HIGH" ? "on" : "off");
}

/**
 * Fetch dữ liệu từ ESP32 (nhiệt độ + trạng thái)
 * TẤT CẢ dữ liệu phải từ phần cứng - KHÔNG có giá trị mặc định!
 */
async function fetchStatus() {
  if (DEMO_MODE) {
    console.warn(
      "⚠️ DEMO MODE đang BẬT! Đổi DEMO_MODE = false trong config.js để dùng phần cứng thật!"
    );
    // Demo mode: random data
    const v = 24 + Math.random() * 8;
    setTemp(v);
    updateFloatStatus(Math.random() > 0.5 ? "HIGH" : "LOW");
    return;
  }

  try {
    const response = await fetch(API_ENDPOINTS.status, {
      method: "GET",
      cache: "no-cache", // Không cache, luôn lấy data mới
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    console.log("📡 Data từ ESP32:", data); // Debug log

    // ✅ KẾT NỐI THÀNH CÔNG - Enable controls
    setControlsEnabled(true);

    // Update temperature - BẮT BUỘC phải có từ ESP32
    if (data.temperature !== undefined && data.temperature !== null) {
      setTemp(data.temperature);
    } else {
      console.error("❌ Không nhận được nhiệt độ từ ESP32!");
      tempNum.innerHTML = `ERR<small>°C</small>`;
    }

    // Update float sensor status - BẮT BUỘC phải có từ ESP32
    if (data.float && data.float.level) {
      updateFloatStatus(data.float.level);
    } else {
      console.error("❌ Không nhận được trạng thái phao từ ESP32!");
      floatStatus.textContent = "ERR";
    }

    // Update pump state from ESP32
    if (data.pump && data.pump.state !== undefined) {
      console.log(
        "🔄 Pump từ ESP32:",
        data.pump.state,
        "Auto:",
        data.pump.auto
      );
      // Sync UI với trạng thái thật từ ESP32
      const swPump = document.getElementById("sw-pump");
      if (swPump && swPump.checked !== data.pump.state) {
        swPump.checked = data.pump.state;
        const stPump = document.getElementById("state-pump");
        if (stPump) {
          stPump.className = "state-pill " + (data.pump.state ? "on" : "off");
          stPump.textContent = data.pump.state ? "Bật" : "Tắt";
        }
      }
    }
  } catch (error) {
    console.error("❌ Lỗi kết nối ESP32:", error);
    tempStatus.textContent = "Mất kết nối";
    tempStatus.className = "state-pill off";

    // ❌ MẤT KẾT NỐI - Disable controls
    setControlsEnabled(false);

    // Hiển thị lỗi rõ ràng
    if (error.message.includes("Failed to fetch")) {
      console.error("💡 Kiểm tra:");
      console.error("   1. ESP32 đã bật chưa?");
      console.error(
        "   2. ESP32_IP đúng chưa? Hiện tại:",
        API_ENDPOINTS.status
      );
      console.error("   3. Máy tính và ESP32 cùng mạng WiFi?");
    }
  }
}

/**
 * Khởi tạo chức năng nhiệt độ
 */
export function initTemperature() {
  btnRefresh.addEventListener("click", async () => {
    await fetchStatus();
    const currentTemp = parseFloat(tempNum.textContent.replace(/[^0-9.]/g, ""));
    if (!isNaN(currentTemp)) {
      pushHistory("Cập nhật nhiệt độ", `${currentTemp.toFixed(1)} °C`);
    }
  });

  // KHÔNG có giá trị khởi tạo cứng - TẤT CẢ từ phần cứng ESP32!
  // Hiển thị loading state ban đầu
  tempNum.innerHTML = `--<small>°C</small>`;
  if (floatStatus) floatStatus.textContent = "--";
  tempStatus.textContent = "Đang kết nối...";
  tempStatus.className = "state-pill";

  console.log("🔄 Đang kết nối ESP32 để lấy dữ liệu thật...");

  // Fetch ngay lập tức từ ESP32 - KHÔNG có giá trị mặc định
  fetchStatus();

  // Auto-update status định kỳ
  pollingInterval = setInterval(fetchStatus, POLLING_INTERVAL);
}

/**
 * Cleanup khi page unload
 */
export function cleanupTemperature() {
  if (pollingInterval) {
    clearInterval(pollingInterval);
  }
}
