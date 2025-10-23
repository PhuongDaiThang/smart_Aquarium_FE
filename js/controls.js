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
    console.warn("⚠️ DEMO MODE - Không gửi lệnh đến ESP32");
    return;
  }

  try {
    console.log(`📤 Gửi lệnh đến ESP32: ${endpoint}`, { on: state });

    const response = await fetch(endpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ on: state }),
      cache: "no-cache",
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    console.log("✅ Phản hồi từ ESP32:", data);

    // Verify trạng thái từ ESP32
    if (data.pump && data.pump.state !== undefined) {
      console.log("🔄 Trạng thái thật từ ESP32:", data.pump.state);
      // Nếu khác với UI, đồng bộ lại
      if (data.pump.state !== state) {
        console.warn("⚠️ Trạng thái UI khác ESP32! Đồng bộ lại...");
      }
    }

    return data;
  } catch (error) {
    console.error("❌ Lỗi gửi lệnh:", error);
    alert(
      `❌ Lỗi kết nối ESP32: ${error.message}\n\nKiểm tra:\n- ESP32 đã bật?\n- IP đúng chưa?\n- Cùng mạng WiFi?`
    );
    throw error;
  }
}

/**
 * Enable/disable controls dựa vào kết nối ESP32
 * @param {boolean} connected - True nếu đã kết nối ESP32
 */
export function setControlsEnabled(connected) {
  // Chỉ enable switch bơm khi đã kết nối ESP32
  if (swPump) {
    swPump.disabled = !connected;
  }

  // Update trạng thái hiển thị
  if (stPump) {
    if (!connected) {
      stPump.className = "state-pill";
      stPump.textContent = "Chưa kết nối";
    }
  }

  console.log(`🔌 Controls ${connected ? "ENABLED" : "DISABLED"}`);
}

/**
 * Khởi tạo điều khiển thiết bị
 */
export function initControls() {
  // BAN ĐẦU: Disable tất cả cho đến khi kết nối ESP32
  setControlsEnabled(false);

  swPump.addEventListener("change", async () => {
    // Kiểm tra có kết nối không
    if (DEMO_MODE) {
      console.warn("⚠️ DEMO MODE - Không thể điều khiển!");
      swPump.checked = !swPump.checked; // Revert
      return;
    }

    if (swPump.disabled) {
      console.error("❌ Chưa kết nối ESP32!");
      swPump.checked = !swPump.checked; // Revert
      return;
    }

    applyState(swPump, stPump, "Máy bơm");

    try {
      await sendControl(API_ENDPOINTS.pump, swPump.checked);
    } catch (error) {
      // Nếu lỗi, revert lại
      swPump.checked = !swPump.checked;
      applyState(swPump, stPump, "Máy bơm");
    }
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
