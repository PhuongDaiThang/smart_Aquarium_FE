// === History Module ===
// Quản lý lịch sử hoạt động (lưu trong localStorage, xuất CSV, xoá)

const KEY = "esp32-history";
const tbody = document.getElementById("history");
const btnClear = document.getElementById("btn-clear");
const btnExport = document.getElementById("btn-export");

/**
 * Tải lịch sử từ localStorage
 * @returns {Array} Mảng các mục lịch sử
 */
function loadHistory() {
  try {
    return JSON.parse(localStorage.getItem(KEY) || "[]");
  } catch {
    return [];
  }
}

/**
 * Lưu lịch sử vào localStorage
 * @param {Array} items - Mảng các mục lịch sử
 */
function saveHistory(items) {
  localStorage.setItem(KEY, JSON.stringify(items));
}

/**
 * Render lịch sử lên bảng
 */
function renderHistory() {
  const items = loadHistory();
  tbody.innerHTML = items
    .map(
      (it) =>
        `<tr><td>${it.time}</td><td>${it.action}</td><td>${
          it.detail || ""
        }</td></tr>`
    )
    .join("");
}

/**
 * Lấy chuỗi thời gian hiện tại
 * @returns {string} Chuỗi thời gian định dạng YYYY-MM-DD HH:MM:SS
 */
function nowStr() {
  const d = new Date();
  const p = (n) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())} ${p(
    d.getHours()
  )}:${p(d.getMinutes())}:${p(d.getSeconds())}`;
}

/**
 * Thêm một mục vào lịch sử
 * @param {string} action - Hành động
 * @param {string} detail - Chi tiết
 */
export function pushHistory(action, detail) {
  const items = loadHistory();
  items.unshift({ time: nowStr(), action, detail });
  saveHistory(items.slice(0, 500)); // Giới hạn 500 mục
  renderHistory();
}

/**
 * Escape chuỗi cho CSV
 * @param {string} s - Chuỗi cần escape
 * @returns {string} Chuỗi đã escape
 */
function quote(s) {
  return '"' + String(s).replace(/"/g, '""') + '"';
}

/**
 * Khởi tạo chức năng lịch sử
 */
export function initHistory() {
  btnClear.addEventListener("click", () => {
    if (confirm("Xoá toàn bộ lịch sử?")) {
      localStorage.removeItem(KEY);
      renderHistory();
    }
  });

  btnExport.addEventListener("click", () => {
    const rows = loadHistory();
    const csv = [
      "time,action,detail",
      ...rows.map(
        (r) => `${quote(r.time)},${quote(r.action)},${quote(r.detail || "")}`
      ),
    ].join("\n");

    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "esp32_history.csv";
    a.click();
    URL.revokeObjectURL(url);
  });

  // Render lịch sử ban đầu
  renderHistory();
}
