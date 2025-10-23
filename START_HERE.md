# 🚀 BẮT ĐẦU TẠI ĐÂY - Phần Cứng Thật!

## ✅ DEMO MODE ĐÃ TẮT - SẴN SÀNG DÙNG PHẦN CỨNG!

### 📌 Phần cứng bạn có:

```
✅ DS18B20    → GPIO4  (Nhiệt độ)
✅ Float      → GPIO27 (Phao mực nước)
✅ Relay Pump → GPIO5  (Máy bơm)
```

---

## 🔥 QUICK START (3 bước)

### Bước 1: Upload ESP32 (2 phút)

1. Mở `esp32_webserver.ino` trong Arduino IDE
2. Sửa **2 dòng WiFi** (dòng 21-22):

```cpp
const char* WIFI_SSID = "TenWiFiCuaBan";
const char* WIFI_PASSWORD = "MatKhauWiFi";
```

3. Upload lên ESP32
4. Mở Serial Monitor (115200) → **Ghi lại IP**:

```
IP address: 192.168.1.105  ← IP này!
```

### Bước 2: Cấu hình Dashboard (30 giây)

Mở `js/config.js` và sửa **dòng 14**:

```javascript
export const ESP32_IP = "192.168.1.105"; // ← Thay IP vừa lấy
```

**Dòng 20 đã sẵn sàng**:

```javascript
export const DEMO_MODE = false; // ✅ ĐÃ TẮT DEMO!
```

### Bước 3: Mở Dashboard

Mở file `index.html` trong trình duyệt → **XONG!**

---

## ✅ Bạn sẽ thấy:

- 🌡️ **Nhiệt độ THẬT** từ DS18B20 (update mỗi 2s)
- 💧 **Mực nước** CAO/THẤP từ phao
- ⚡ **Máy bơm tự động** theo phao
- 📊 **Lịch sử** tất cả hoạt động

---

## 🔌 Kết nối phần cứng:

```
DS18B20:
  VDD → 3.3V
  GND → GND
  DQ  → GPIO4 + điện trở 4.7kΩ → 3.3V (QUAN TRỌNG!)

Float Sensor (2 dây):
  Dây 1 → GPIO27
  Dây 2 → GND

Relay Pump:
  VCC → 5V
  GND → GND
  IN  → GPIO5
```

**⚠️ BẮT BUỘC**: DS18B20 phải có điện trở 4.7kΩ nối DQ → 3.3V!

---

## 🎯 Logic tự động:

```
Phao THẤP → Bơm BẬT  (sau 5 giây)
Phao CAO  → Bơm TẮT (sau 5 giây)
```

**Bạn cũng có thể bật/tắt thủ công từ dashboard!**

---

## 🐛 Không chạy?

### 1. Nhiệt độ hiển thị random?

→ Kiểm tra `DEMO_MODE = false` trong `js/config.js`

### 2. DS18B20 đọc -127°C?

→ Thiếu điện trở 4.7kΩ pull-up!

### 3. Dashboard không connect?

→ Kiểm tra IP có đúng không

### 4. Phao không hoạt động?

→ Kiểm tra GPIO27, không phải GPIO13!

**Chi tiết:** Xem file `HARDWARE_REAL.md` hoặc `TEST_HARDWARE.md`

---

## 📁 Files quan trọng:

| File                   | Mô tả                           |
| ---------------------- | ------------------------------- |
| `esp32_webserver.ino`  | Code ESP32 - ĐÃ CẤU HÌNH GPIO27 |
| `js/config.js`         | Config IP - DEMO_MODE = false   |
| `index.html`           | Dashboard                       |
| **`HARDWARE_REAL.md`** | ⭐ Hướng dẫn chi tiết           |
| `TEST_HARDWARE.md`     | Test từng bước                  |

---

## ✅ Test nhanh:

1. **Cầm DS18B20 trong tay** → Nhiệt độ tăng
2. **Nhấc phao lên** → "Mực nước: Cao", Bơm tắt
3. **Hạ phao xuống** → "Mực nước: Thấp", Bơm bật

**Nếu 3 cái này OK → Hoàn hảo!** 🎉

---

## 🎨 Giao diện:

Dashboard có **Dark/Light mode** - Click nút 🌙/☀️ góc phải!

---

## 📝 Note về Đèn & Cho ăn:

Hiện tại **DISABLED** (không cần thiết):

- Relay đèn (GPIO14): Tùy chọn
- Relay cho ăn (GPIO15): Tùy chọn

**Muốn thêm?** Xem phần cuối `HARDWARE_REAL.md`

---

## 🚀 TÓM TẮT:

✅ DEMO_MODE = **false** (đã tắt demo)  
✅ FLOAT_PIN = **GPIO27** (đúng hardware)  
✅ ESP32 connect WiFi → Lấy IP  
✅ Sửa IP trong `js/config.js`  
✅ Mở `index.html` → **CHẠY NGAY!**

**Chúc bạn thành công! 🎉**
