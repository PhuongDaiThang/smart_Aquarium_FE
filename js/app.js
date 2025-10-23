// === Main Application ===
// Khởi tạo tất cả các module của ứng dụng

import { initTheme } from "./theme.js";
import { initClock } from "./clock.js";
import { initTemperature } from "./temperature.js";
import { initControls } from "./controls.js";
import { initHistory } from "./history.js";

/**
 * Khởi tạo ứng dụng
 */
function init() {
  initTheme(); // Khởi tạo theme trước để apply theme sớm nhất
  initClock();
  initTemperature();
  initControls();
  initHistory();
}

// Chạy khi DOM đã sẵn sàng
if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", init);
} else {
  init();
}
