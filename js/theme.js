// === Theme Module ===
// Quản lý chế độ sáng/tối (dark/light mode)

const THEME_KEY = "esp32-theme";
const html = document.documentElement;
const themeToggle = document.getElementById("theme-toggle");
const themeIcon = document.getElementById("theme-icon");

/**
 * Lấy theme hiện tại từ localStorage
 * @returns {string} 'light' hoặc 'dark'
 */
function getTheme() {
  const saved = localStorage.getItem(THEME_KEY);
  if (saved) return saved;

  // Nếu chưa có setting, dùng system preference
  if (
    window.matchMedia &&
    window.matchMedia("(prefers-color-scheme: light)").matches
  ) {
    return "light";
  }
  return "dark"; // Default
}

/**
 * Áp dụng theme
 * @param {string} theme - 'light' hoặc 'dark'
 */
function applyTheme(theme) {
  html.setAttribute("data-theme", theme);
  localStorage.setItem(THEME_KEY, theme);
  updateIcon(theme);
}

/**
 * Cập nhật icon của theme toggle button
 * @param {string} theme - 'light' hoặc 'dark'
 */
function updateIcon(theme) {
  if (!themeIcon) return;

  if (theme === "light") {
    // Icon mặt trăng (chuyển sang dark mode)
    themeIcon.innerHTML = `
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
      </svg>
    `;
  } else {
    // Icon mặt trời (chuyển sang light mode)
    themeIcon.innerHTML = `
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <circle cx="12" cy="12" r="5" stroke="currentColor" stroke-width="2"/>
        <line x1="12" y1="1" x2="12" y2="3" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
        <line x1="12" y1="21" x2="12" y2="23" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
        <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
        <line x1="18.36" y1="18.36" x2="19.78" y2="19.78" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
        <line x1="1" y1="12" x2="3" y2="12" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
        <line x1="21" y1="12" x2="23" y2="12" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
        <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
        <line x1="18.36" y1="5.64" x2="19.78" y2="4.22" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
      </svg>
    `;
  }
}

/**
 * Toggle giữa light và dark mode
 */
function toggleTheme() {
  const current = html.getAttribute("data-theme") || "dark";
  const next = current === "dark" ? "light" : "dark";
  applyTheme(next);
}

/**
 * Khởi tạo theme module
 */
export function initTheme() {
  // Áp dụng theme ngay lập tức (trước khi page render)
  const theme = getTheme();
  applyTheme(theme);

  // Lắng nghe sự kiện click
  if (themeToggle) {
    themeToggle.addEventListener("click", toggleTheme);
  }

  // Lắng nghe system theme changes
  if (window.matchMedia) {
    window
      .matchMedia("(prefers-color-scheme: light)")
      .addEventListener("change", (e) => {
        // Chỉ tự động đổi nếu user chưa set preference
        if (!localStorage.getItem(THEME_KEY)) {
          applyTheme(e.matches ? "light" : "dark");
        }
      });
  }
}
