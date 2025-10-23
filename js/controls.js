// === Controls Module ===
// Quản lý điều khiển các thiết bị (máy bơm, đèn, cho ăn)

import { pushHistory } from "./history.js";
import { API_ENDPOINTS, DEMO_MODE } from "./config.js";

const swPump = document.getElementById("sw-pump");
const swLight = document.getElementById("sw-light");
const swFeed = document.getElementById("sw-feed");
const stPump = document.getElementById("state-pump");
const stLight = document.getElementById("state-light");
const stFeed = document.getElementById("state-feed");

/**
 * Áp dụng trạng thái cho thiết bị
 * @param {HTMLInputElement} el - Element checkbox
 * @param {HTMLElement} stateEl - Element hiển thị trạng thái
 * @param {string} name - Tên thiết bị
 */
function applyState(el, stateEl, name) {
  const on = el.checked;
  stateEl.className = "state-pill " + (on ? "on" : "off");
  stateEl.textContent = on ? "Bật" : "Tắt";
  pushHistory(`Thiết bị: ${name}`, on ? "Bật" : "Tắt");
}

/**
 * Gửi lệnh điều khiển đến ESP32
 * @param {string} endpoint - API endpoint
 * @param {boolean} state - Trạng thái on/off
 */
async function sendControl(endpoint, state) {
  if (DEMO_MODE) {
    return; // Demo mode, không gửi request
  }

  try {
    const response = await fetch(endpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ on: state }),
    });

    if (!response.ok) {
      throw new Error("Network response was not ok");
    }

    const data = await response.json();
    console.log("Control response:", data);
    return data;
  } catch (error) {
    console.error("Error sending control command:", error);
    alert(`Lỗi kết nối ESP32: ${error.message}`);
  }
}

/**
 * Khởi tạo điều khiển thiết bị
 */
export function initControls() {
  swPump.addEventListener("change", async () => {
    applyState(swPump, stPump, "Máy bơm");
    await sendControl(API_ENDPOINTS.pump, swPump.checked);
  });

  swLight.addEventListener("change", async () => {
    applyState(swLight, stLight, "Đèn chiếu sáng");
    await sendControl(API_ENDPOINTS.light, swLight.checked);
  });

  swFeed.addEventListener("change", async () => {
    // Feed luôn bật rồi tắt sau 3s (xử lý ở ESP32)
    if (swFeed.checked) {
      applyState(swFeed, stFeed, "Cho ăn");
      await sendControl(API_ENDPOINTS.feed, true);

      // Tự động tắt UI sau 3 giây
      setTimeout(() => {
        swFeed.checked = false;
        applyState(swFeed, stFeed, "Cho ăn");
      }, 3000);
    }
  });
}
