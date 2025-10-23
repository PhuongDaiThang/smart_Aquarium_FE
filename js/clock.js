// === Clock Module ===
// Quản lý đồng hồ hiển thị thời gian thực

export function initClock() {
  const clockEl = document.getElementById("clock");

  const tickClock = () => {
    const d = new Date();
    const pad = (n) => String(n).padStart(2, "0");
    clockEl.textContent = `${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(
      d.getSeconds()
    )}`;
  };

  setInterval(tickClock, 1000);
  tickClock();
}
