// === Temperature Module ===
// Quản lý hiển thị nhiệt độ và gauge (đồng hồ nhiệt độ)

import { pushHistory } from "./history.js";
import { API_ENDPOINTS, DEMO_MODE, POLLING_INTERVAL } from "./config.js";

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
 */
async function fetchStatus() {
  if (DEMO_MODE) {
    // Demo mode: random data
    const v = 24 + Math.random() * 8;
    setTemp(v);
    updateFloatStatus(Math.random() > 0.5 ? "HIGH" : "LOW");
    return;
  }

  try {
    const response = await fetch(API_ENDPOINTS.status);
    if (!response.ok) throw new Error("Network response was not ok");

    const data = await response.json();

    // Update temperature
    if (data.temperature !== undefined) {
      setTemp(data.temperature);
    }

    // Update float sensor status
    if (data.float && data.float.level) {
      updateFloatStatus(data.float.level);
    }

    // Update pump state if needed
    if (data.pump && data.pump.state !== undefined) {
      // Có thể sync với UI controls nếu cần
      console.log("Pump state:", data.pump.state, "Auto:", data.pump.auto);
    }
  } catch (error) {
    console.error("Error fetching status:", error);
    // Keep showing last value on error
  }
}

/**
 * Khởi tạo chức năng nhiệt độ
 */
export function initTemperature() {
  btnRefresh.addEventListener("click", async () => {
    await fetchStatus();
    const currentTemp = parseFloat(tempNum.textContent.replace(/[^0-9.]/g, ""));
    pushHistory("Cập nhật nhiệt độ", `${currentTemp.toFixed(1)} °C`);
  });

  // Khởi tạo giá trị ban đầu
  setTemp(27.3);
  updateFloatStatus("HIGH");

  // Auto-update status định kỳ
  fetchStatus(); // Fetch ngay lập tức
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
