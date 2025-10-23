# ESP32 Smart Aquarium Dashboard

Dashboard để quản lý và giám sát bể cá thông minh sử dụng ESP32.

## Tính năng

- 🌡️ **Hiển thị nhiệt độ**: Gauge (đồng hồ) nhiệt độ thời gian thực
- 💧 **Điều khiển máy bơm**: Bật/tắt máy bơm từ xa
- 💡 **Điều khiển đèn**: Bật/tắt đèn chiếu sáng
- 🐟 **Cho ăn tự động**: Điều khiển hệ thống cho ăn
- 📊 **Lịch sử hoạt động**: Lưu trữ và xuất lịch sử dưới dạng CSV
- ⏰ **Đồng hồ thời gian thực**: Hiển thị thời gian hiện tại
- 🌓 **Chế độ sáng/tối**: Chuyển đổi giao diện sáng/tối, tự động nhớ lựa chọn

## Cấu trúc dự án

```
smart_Aquarium_FE/
├── index.html              # File HTML chính
├── esp32_webserver.ino     # Arduino sketch cho ESP32
├── css/
│   └── styles.css          # Tất cả các styles CSS
├── js/
│   ├── app.js              # File khởi tạo chính
│   ├── config.js           # Cấu hình ESP32 IP & API
│   ├── theme.js            # Module chế độ sáng/tối
│   ├── clock.js            # Module đồng hồ
│   ├── temperature.js      # Module nhiệt độ & gauge & float sensor
│   ├── controls.js         # Module điều khiển thiết bị
│   └── history.js          # Module lịch sử hoạt động
└── README.md               # Tài liệu dự án
```

## Chi tiết các module

### 1. `esp32_webserver.ino` - ESP32 Arduino Sketch

- Web server chạy trên ESP32
- REST API endpoints
- Hardware control (DS18B20, Float, Relays)
- SPIFFS file serving
- Auto pump control based on float sensor

### 2. `app.js` - Main Application

- Khởi tạo tất cả các module
- Entry point của ứng dụng

### 3. `config.js` - Configuration Module

- Cấu hình ESP32 IP address
- API endpoints
- Demo mode toggle
- Polling interval settings

### 4. `theme.js` - Theme Module

- Chuyển đổi giữa chế độ sáng/tối (dark/light mode)
- Lưu preference trong localStorage
- Tự động phát hiện system theme preference
- Smooth transitions khi đổi theme

### 5. `clock.js` - Clock Module

- Hiển thị đồng hồ thời gian thực
- Cập nhật mỗi giây

### 6. `temperature.js` - Temperature Module

- Fetch nhiệt độ từ ESP32
- Hiển thị nhiệt độ trên gauge (đồng hồ đo)
- Hiển thị trạng thái phao (float sensor)
- Đánh giá trạng thái nhiệt độ (Quá lạnh/Ổn định/Quá nóng)
- Auto-polling mỗi 2 giây

### 7. `controls.js` - Controls Module

- Điều khiển máy bơm qua ESP32
- Điều khiển đèn chiếu sáng
- Điều khiển hệ thống cho ăn (3s auto-off)
- Gửi lệnh qua REST API

### 8. `history.js` - History Module

- Lưu trữ lịch sử trong localStorage
- Xuất lịch sử ra file CSV
- Xóa lịch sử
- Giới hạn 500 mục gần nhất

### 9. `styles.css` - Styles

- CSS variables cho cả dark và light theme
- Responsive design
- Gradient backgrounds
- Smooth animations & transitions

## Cách sử dụng

### Chạy local

Mở file `index.html` trực tiếp trong trình duyệt, hoặc sử dụng live server:

```bash
# Sử dụng Python
python -m http.server 8000

# Sử dụng Node.js (npx)
npx serve

# Hoặc sử dụng Live Server extension trong VS Code
```

Sau đó mở trình duyệt và truy cập `http://localhost:8000`

### Chế độ sáng/tối

Ứng dụng hỗ trợ cả chế độ sáng và tối:

- **Toggle button**: Click nút 🌙/☀️ ở góc phải header để chuyển đổi
- **Tự động lưu**: Lựa chọn của bạn được lưu trong localStorage
- **System preference**: Nếu chưa chọn, ứng dụng sẽ tự động theo theme của hệ điều hành
- **Smooth transition**: Chuyển đổi mượt mà với animation 0.3s

Preference được lưu với key `esp32-theme` trong localStorage.

## Tích hợp ESP32 Hardware

### Phần cứng yêu cầu

- **ESP32** DevKit
- **DS18B20** - Cảm biến nhiệt độ chống nước (GPIO4)
- **Float Sensor** - Phao cảm biến mực nước 2 dây (GPIO13)
- **Relay Module** - 3 kênh:
  - Kênh 1: Máy bơm (GPIO5)
  - Kênh 2: Đèn chiếu sáng (GPIO14)
  - Kênh 3: Máy cho ăn (GPIO15)
- **Điện trở 4.7kΩ** - Pull-up cho DS18B20 (DQ ↔ 3.3V)

### Sơ đồ kết nối

```
ESP32          Device
─────────────────────────────
GPIO4    ──────  DS18B20 (DQ) + 4.7kΩ pull-up to 3.3V
GPIO13   ──────  Float Sensor (LOW = nước thấp, HIGH = nước cao)
GPIO5    ──────  Relay IN1 (Pump)
GPIO14   ──────  Relay IN2 (Light)
GPIO15   ──────  Relay IN3 (Feeder)
GND      ──────  Common Ground
```

### Cài đặt ESP32

#### 1. Cài đặt thư viện Arduino

Cần cài các thư viện sau trong Arduino IDE:

```
- OneWire by Paul Stoffregen
- DallasTemperature by Miles Burton
- ArduinoJson by Benoit Blanchon (v6.x)
- ESP32 Board Support
```

#### 2. Upload code lên ESP32

1. Mở file `esp32_webserver.ino` trong Arduino IDE
2. Sửa WiFi credentials:

```cpp
const char* WIFI_SSID = "TenWiFiCuaBan";
const char* WIFI_PASSWORD = "MatKhauWiFi";
```

3. Chọn board: **ESP32 Dev Module**
4. Chọn COM port và upload
5. Mở Serial Monitor (115200 baud) để xem IP address

#### 3. Upload files lên SPIFFS

ESP32 cần serve các file HTML/CSS/JS từ SPIFFS:

**Option 1: Sử dụng ESP32 Sketch Data Upload**

1. Cài plugin: [ESP32 Sketch Data Upload](https://github.com/me-no-dev/arduino-esp32fs-plugin)
2. Tạo folder `data` trong thư mục sketch
3. Copy toàn bộ file `index.html`, folder `css/`, folder `js/` vào folder `data`
4. Tools → ESP32 Sketch Data Upload

**Option 2: Sử dụng web upload (đơn giản hơn)**

Tạm thời comment phần `handleFileRequest()` và serve trực tiếp từ máy tính (xem phần Development)

#### 4. Cấu hình Frontend

Sửa file `js/config.js`:

```javascript
export const ESP32_IP = "192.168.1.XXX"; // IP từ Serial Monitor
export const DEMO_MODE = false; // Tắt demo mode
```

### Logic hoạt động

**Auto Pump Control (Tự động bơm nước):**

- Phao CAO (HIGH) → Tắt máy bơm
- Phao THẤP (LOW) → Bật máy bơm
- Chống giật (debounce): 120ms
- Thời gian bơm tối thiểu: 5 giây ON/OFF

**Temperature Monitoring:**

- Đọc nhiệt độ mỗi 2 giây
- Dashboard tự động cập nhật (polling 2s)
- Cảnh báo nếu nhiệt độ < 24°C hoặc > 28°C

**Manual Controls:**

- Bật/tắt đèn qua dashboard
- Cho ăn: Bật 3 giây rồi tự tắt
- Override máy bơm (tắt chế độ auto)

### API Endpoints

| Endpoint           | Method | Description           | Body Example   |
| ------------------ | ------ | --------------------- | -------------- |
| `/api/status`      | GET    | Lấy tất cả trạng thái | -              |
| `/api/temperature` | GET    | Lấy nhiệt độ          | -              |
| `/api/pump`        | POST   | Điều khiển máy bơm    | `{"on": true}` |
| `/api/light`       | POST   | Điều khiển đèn        | `{"on": true}` |
| `/api/feed`        | POST   | Kích hoạt cho ăn      | `{"on": true}` |

**Response Example (`/api/status`):**

```json
{
  "temperature": 26.5,
  "pump": { "state": true, "auto": true },
  "light": { "state": false },
  "feed": { "state": false },
  "float": { "level": "HIGH" },
  "wifi": { "rssi": -65 },
  "uptime": 3600
}
```

### Development Mode

Nếu chưa có phần cứng, giữ nguyên:

```javascript
export const DEMO_MODE = true; // trong js/config.js
```

Dashboard sẽ hoạt động với dữ liệu giả lập.

## Responsive Design

- ✅ Desktop (>1000px)
- ✅ Tablet (600px - 1000px)
- ✅ Mobile (<600px)

## Công nghệ sử dụng

- HTML5
- CSS3 (CSS Variables, Grid, Flexbox)
- JavaScript ES6+ (Modules, Arrow Functions)
- LocalStorage API
- Blob API (CSV Export)

## Browser Support

- Chrome/Edge (latest)
- Firefox (latest)
- Safari (latest)

## Giấy phép

MIT License
