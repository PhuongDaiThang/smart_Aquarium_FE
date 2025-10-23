# Hướng dẫn Setup nhanh ESP32 Smart Aquarium

## 📋 Checklist chuẩn bị

- [ ] ESP32 DevKit
- [ ] DS18B20 (cảm biến nhiệt độ) + điện trở 4.7kΩ
- [ ] Float sensor (phao 2 dây)
- [ ] Relay module 3 kênh
- [ ] Arduino IDE đã cài đặt
- [ ] Dây jumper và breadboard

## 🔧 Bước 1: Cài đặt Arduino IDE

### 1.1 Cài ESP32 Board Support

1. Mở Arduino IDE
2. File → Preferences
3. Thêm vào "Additional Board Manager URLs":
   ```
   https://raw.githubusercontent.com/espressif/arduino-esp32/gh-pages/package_esp32_index.json
   ```
4. Tools → Board → Boards Manager
5. Tìm "ESP32" và cài đặt "esp32 by Espressif Systems"

### 1.2 Cài thư viện

Tools → Manage Libraries, tìm và cài:

- **OneWire** by Paul Stoffregen
- **DallasTemperature** by Miles Burton
- **ArduinoJson** by Benoit Blanchon (chọn version 6.x)

## 🔌 Bước 2: Kết nối phần cứng

```
ESP32 GPIO → Device
──────────────────────────────────
GPIO4      → DS18B20 DQ pin
3.3V       → DS18B20 VDD + 4.7kΩ → DQ (pull-up)
GND        → DS18B20 GND

GPIO13     → Float sensor (1 dây)
GND        → Float sensor (dây còn lại)

GPIO5      → Relay IN1 (Pump)
GPIO14     → Relay IN2 (Light)
GPIO15     → Relay IN3 (Feeder)
GND        → Relay GND
5V/VCC     → Relay VCC
```

⚠️ **Lưu ý**: Relay thường dùng 5V, có thể cần nguồn ngoài cho relay nếu ESP32 không đủ dòng.

## 💻 Bước 3: Upload code ESP32

### 3.1 Mở và cấu hình sketch

1. Mở file `esp32_webserver.ino`
2. Sửa WiFi credentials (dòng 18-19):

```cpp
const char* WIFI_SSID = "TenWiFiCuaBan";
const char* WIFI_PASSWORD = "MatKhauWiFi";
```

### 3.2 Upload code

1. Tools → Board → **ESP32 Dev Module**
2. Tools → Port → Chọn COM port của ESP32
3. Click nút Upload (➡️)
4. Chờ "Hard resetting via RTS pin..." → Thành công!

### 3.3 Xem IP address

1. Tools → Serial Monitor
2. Baud rate: **115200**
3. Reset ESP32 (nút EN)
4. Note lại IP address, ví dụ: `192.168.1.105`

```
=== ESP32 Smart Aquarium Web Server ===
WiFi connected!
IP address: 192.168.1.105    ← GHI LẠI IP NÀY
HTTP server started
```

## 🌐 Bước 4: Cấu hình Frontend

### 4.1 Sửa file config.js

Mở `js/config.js` và sửa:

```javascript
export const ESP32_IP = "192.168.1.105"; // ← Thay bằng IP của bạn
export const DEMO_MODE = false; // ← Đổi thành false
```

### 4.2 Test kết nối

Mở `index.html` trong trình duyệt:

- ✅ Nhiệt độ hiển thị thực
- ✅ Trạng thái phao hiển thị
- ✅ Bật/tắt relay hoạt động

## 🐛 Troubleshooting

### ESP32 không kết nối WiFi

- Kiểm tra SSID và password có đúng không
- Kiểm tra WiFi có phải 2.4GHz (ESP32 không hỗ trợ 5GHz)
- Reset ESP32 và thử lại

### DS18B20 đọc sai (-127°C hoặc 85°C)

- Kiểm tra điện trở pull-up 4.7kΩ
- Kiểm tra kết nối DQ → GPIO4
- Thử đổi pin GPIO (VD: GPIO2)

### Relay không hoạt động

- Kiểm tra relay có nguồn 5V không
- Kiểm tra jumper JD-VCC trên relay module
- Thử đảo logic: sửa `RELAY_ACTIVE_LOW` thành `false`

### Frontend không connect

- Kiểm tra DEMO_MODE = false
- Kiểm tra IP address đúng
- Mở Console (F12) xem lỗi CORS
- Thử ping ESP32 IP: `ping 192.168.1.105`

### CORS Error

- ESP32 code đã có CORS headers
- Kiểm tra firewall có block không
- Thử tắt antivirus tạm thời

## 📱 Bước 5: Upload Web Files lên SPIFFS (Tùy chọn)

### Option A: ESP32 Sketch Data Upload Plugin

1. Download plugin: https://github.com/me-no-dev/arduino-esp32fs-plugin/releases
2. Giải nén vào: `Arduino/tools/ESP32FS/tool/esp32fs.jar`
3. Restart Arduino IDE
4. Tạo folder `data/` trong thư mục sketch
5. Copy: `index.html`, `css/`, `js/` vào `data/`
6. Tools → **ESP32 Sketch Data Upload**

### Option B: Serve từ máy tính (Development)

Không cần upload, mở `index.html` trực tiếp:

```bash
# Hoặc dùng Live Server
npx serve
# Truy cập http://localhost:3000
```

## ✅ Hoàn thành!

Bây giờ bạn có thể:

- 🌡️ Xem nhiệt độ thời gian thực
- 💧 Máy bơm tự động theo phao
- 💡 Bật/tắt đèn từ xa
- 🐟 Cho ăn tự động
- 📊 Xem lịch sử và xuất CSV

---

**Cần hỗ trợ?** Mở issue trên GitHub hoặc kiểm tra Serial Monitor để debug!
