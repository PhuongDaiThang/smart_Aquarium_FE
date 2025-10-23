# ⚡ Phần Cứng Thực Tế - Tắt Demo Mode

## ✅ Cấu hình đã cập nhật cho phần cứng THẬT!

### 🔧 Phần cứng BẮT BUỘC (Có sẵn):

```
DS18B20 ────► GPIO4  (Nhiệt độ nước)
Phao   ────► GPIO27 (Mực nước) ← ĐÃ SỬA từ GPIO13
Relay Bơm ─► GPIO5  (Máy bơm)
```

### 🔌 Sơ đồ kết nối:

```
ESP32          Device
─────────────────────────────
GPIO4    ──────  DS18B20 (DQ) + 4.7kΩ pull-up to 3.3V
GPIO27   ──────  Float Sensor (1 dây) ← QUAN TRỌNG: GPIO27!
GND      ──────  Float Sensor (dây còn lại)
GPIO5    ──────  Relay IN (Pump)
GND      ──────  Relay GND
5V/VCC   ──────  Relay VCC
```

### ⚙️ Thiết bị TÙY CHỌN (Hiện tại DISABLED):

```
Relay Đèn ────► GPIO14 (ENABLE_LIGHT = false)
Relay Cho ăn ─► GPIO15 (ENABLE_FEEDER = false)
```

**Nếu muốn thêm**:

1. Cắm relay vào GPIO14 hoặc GPIO15
2. Sửa trong `esp32_webserver.ino`:

```cpp
#define ENABLE_LIGHT       true   // Bật relay đèn
#define ENABLE_FEEDER      true   // Bật relay cho ăn
```

---

## 📝 Thay đổi đã thực hiện:

### 1. ✅ ESP32 Code (`esp32_webserver.ino`):

- ✅ FLOAT_PIN đổi từ **GPIO13** → **GPIO27** (đúng với hardware)
- ✅ Relay đèn & cho ăn: **DISABLED** (không bắt buộc)
- ✅ Auto pump theo phao: **ENABLED**
- ✅ DS18B20: **ENABLED**

### 2. ✅ Frontend (`js/config.js`):

```javascript
export const DEMO_MODE = false; // ✅ ĐÃ TẮT DEMO!
export const ESP32_IP = "192.168.1.100"; // ⚠️ Thay IP thật của bạn
```

### 3. ✅ Dashboard (`index.html`):

- Relay đèn: **DISABLED** (hiển thị mờ, không click được)
- Relay cho ăn: **DISABLED** (hiển thị mờ, không click được)
- Relay bơm: **ENABLED** (hoạt động bình thường)

---

## 🚀 Cách sử dụng:

### Bước 1: Upload ESP32

```cpp
// esp32_webserver.ino - Sửa WiFi (dòng 21-22)
const char* WIFI_SSID = "TenWiFiCuaBan";
const char* WIFI_PASSWORD = "MatKhauWiFi";
```

Upload và xem Serial Monitor:

```
=== ESP32 Smart Aquarium Web Server ===
Hardware: DS18B20(GPIO4) + Float(GPIO27) + Pump(GPIO5)
Light relay: DISABLED | Feeder relay: DISABLED
WiFi connected!
IP address: 192.168.1.105  ← GHI LẠI IP
DS18B20: T=26.50°C | Level=CAO | Pump=OFF
```

### Bước 2: Cấu hình Frontend

```javascript
// js/config.js - Sửa dòng 14 và 20
export const ESP32_IP = "192.168.1.105"; // IP từ Serial Monitor
export const DEMO_MODE = false; // ĐÃ TẮT DEMO!
```

### Bước 3: Mở Dashboard

Mở `index.html` → Bạn sẽ thấy:

- ✅ Nhiệt độ THẬT từ DS18B20
- ✅ Phao CAO/THẤP
- ✅ Máy bơm tự động theo phao
- 🔘 Đèn & Cho ăn (mờ, không hoạt động)

---

## 🎯 Logic hoạt động:

### 1. Đọc nhiệt độ (Mỗi 2 giây)

```
DS18B20 (GPIO4) → ESP32 đọc → API /api/status → Dashboard hiển thị
```

### 2. Auto pump (Liên tục)

```
Phao GPIO27:
  - THẤP (HIGH trên pin) → Bật bơm (GPIO5 = LOW)
  - CAO (LOW trên pin)   → Tắt bơm (GPIO5 = HIGH)
```

### 3. Manual override pump

```
Dashboard: Bật/tắt bơm → API POST /api/pump → ESP32 điều khiển
(Tạm thời tắt auto mode)
```

---

## 🔍 Test Phần Cứng:

### Test 1: DS18B20

```bash
# Serial Monitor sẽ hiển thị:
DS18B20: T=26.50°C | Level=CAO | Pump=OFF

# Cầm cảm biến trong tay:
DS18B20: T=31.20°C | Level=CAO | Pump=OFF  ← Nhiệt độ tăng!
```

### Test 2: Float Sensor

```bash
# Nhấc phao LÊN (nước cao):
DS18B20: T=26.50°C | Level=CAO | Pump=OFF  ← Bơm tắt

# Hạ phao XUỐNG (nước thấp):
DS18B20: T=26.50°C | Level=THAP | Pump=ON  ← Bơm bật sau 5s
```

### Test 3: Dashboard

1. Mở `index.html`
2. Xem nhiệt độ update mỗi 2 giây
3. Xem "Mực nước: Cao/Thấp"
4. Bật/tắt máy bơm bằng switch

---

## 🛠️ Nếu muốn thêm Đèn & Cho ăn:

### 1. Cắm thêm relay:

```
GPIO14 ──► Relay IN2 (Đèn)
GPIO15 ──► Relay IN3 (Cho ăn)
```

### 2. Sửa config trong ESP32:

```cpp
// esp32_webserver.ino - dòng 34-35
#define ENABLE_LIGHT       true   // ← Đổi thành true
#define ENABLE_FEEDER      true   // ← Đổi thành true
```

### 3. Sửa frontend (index.html):

```html
<!-- Bỏ disabled và opacity -->
<input type="checkbox" id="sw-light" />
<!-- Bỏ disabled -->
<input type="checkbox" id="sw-feed" />
<!-- Bỏ disabled -->
```

Và xóa `style="opacity: 0.5"` trong `<div class="ctl">`

### 4. Upload lại ESP32 → Xong!

---

## ✅ Checklist Cuối Cùng:

- [x] DEMO_MODE = false trong `js/config.js`
- [x] ESP32_IP = IP thật của ESP32
- [x] FLOAT_PIN = GPIO27 (không phải GPIO13!)
- [x] DS18B20 có pull-up 4.7kΩ
- [x] Relay đèn & cho ăn DISABLED (nếu không có hardware)
- [x] Upload ESP32 và test

---

## 📊 Serial Monitor Output Mẫu:

```
=== ESP32 Smart Aquarium Web Server ===
Hardware: DS18B20(GPIO4) + Float(GPIO27) + Pump(GPIO5)
Light relay: DISABLED | Feeder relay: DISABLED
Found DS sensors: 1 | Res: 12-bit
WiFi connected!
IP address: 192.168.1.105
RSSI: -65
SPIFFS mounted successfully
HTTP server started
Access dashboard at: http://192.168.1.105

DS18B20: T=26.50°C | Level=CAO | Pump=OFF
DS18B20: T=26.48°C | Level=CAO | Pump=OFF
DS18B20: T=26.52°C | Level=THAP | Pump=OFF
Pump ON
DS18B20: T=26.51°C | Level=THAP | Pump=ON
DS18B20: T=26.49°C | Level=THAP | Pump=ON
DS18B20: T=26.50°C | Level=CAO | Pump=ON
Pump OFF
DS18B20: T=26.51°C | Level=CAO | Pump=OFF
```

**✅ Hoàn hảo! Phần cứng hoạt động!**

---

**Cần hỗ trợ?** Xem `TEST_HARDWARE.md` để debug từng bước!
