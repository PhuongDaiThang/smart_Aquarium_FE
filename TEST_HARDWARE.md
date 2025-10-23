# Test Hardware - Hướng dẫn kiểm tra từng bước

## 📝 Checklist Test Phần Cứng

### ✅ Test 1: ESP32 + WiFi

**Mục tiêu**: Xác nhận ESP32 kết nối WiFi thành công

**Các bước**:

1. Upload code `esp32_webserver.ino`
2. Mở Serial Monitor (115200 baud)
3. Reset ESP32 (nhấn nút EN)

**Kết quả mong đợi**:

```
=== ESP32 Smart Aquarium Web Server ===
WiFi connected!
IP address: 192.168.1.XXX
HTTP server started
```

**Nếu lỗi**: Kiểm tra SSID/Password WiFi, đảm bảo WiFi 2.4GHz

---

### ✅ Test 2: DS18B20 (Nhiệt độ)

**Mục tiêu**: Đọc được nhiệt độ từ cảm biến

**Kết nối**:

```
DS18B20 VDD → ESP32 3.3V
DS18B20 GND → ESP32 GND
DS18B20 DQ  → ESP32 GPIO4 + 4.7kΩ → 3.3V (pull-up)
```

**Test**:

1. Xem Serial Monitor sau khi upload
2. Tìm dòng: `DS18B20: T=XX.XX°C`

**Kết quả mong đợi**:

```
DS18B20: T=26.50°C | Level=CAO | Pump=OFF
```

**Nếu thấy -127°C hoặc 85°C**:

- ❌ Thiếu điện trở pull-up 4.7kΩ
- ❌ Kết nối DQ pin sai
- ❌ DS18B20 bị hỏng

**Fix**:

- Bắt buộc phải có điện trở 4.7kΩ nối DQ → 3.3V
- Thử đổi sang GPIO2 (sửa `#define DS_PIN 2` trong code)

---

### ✅ Test 3: Float Sensor (Phao)

**Mục tiêu**: Đọc được trạng thái mực nước

**Kết nối**:

```
Float dây 1 → ESP32 GPIO13
Float dây 2 → ESP32 GND
```

**Test**:

1. Nhấc phao LÊN (giả lập nước cao)
2. Hạ phao XUỐNG (giả lập nước thấp)
3. Xem Serial Monitor

**Kết quả mong đợi**:

```
Phao lên:  DS18B20: T=26.50°C | Level=CAO  | Pump=OFF
Phao xuống: DS18B20: T=26.50°C | Level=THAP | Pump=ON
```

**Logic**:

- Phao NỔI (nước cao) → Chạm → GPIO13 = LOW → "CAO" → Tắt bơm
- Phao CHÌM (nước thấp) → Hở → GPIO13 = HIGH → "THAP" → Bật bơm

**Nếu ngược logic**: Phao của bạn có thể dùng normally closed/open khác

- Đổi dòng 81: `return digitalRead(FLOAT_PIN) == HIGH;`

---

### ✅ Test 4: Relay Module (Bơm, Đèn, Cho ăn)

**Mục tiêu**: Điều khiển được relay từ ESP32

**Kết nối**:

```
Relay VCC    → 5V (hoặc nguồn ngoài 5V)
Relay GND    → ESP32 GND
Relay IN1    → ESP32 GPIO5  (Pump)
Relay IN2    → ESP32 GPIO14 (Light)
Relay IN3    → ESP32 GPIO15 (Feeder)
```

**Test thủ công (không cần dashboard)**:

1. Trong `setup()`, thêm code test:

```cpp
void setup() {
  // ... code cũ ...

  // TEST RELAY
  Serial.println("Testing relays...");
  pumpSet(true);   delay(1000); pumpSet(false);
  lightSet(true);  delay(1000); lightSet(false);
  feedSet(true);   delay(1000); feedSet(false);
  Serial.println("Relay test done!");
}
```

2. Upload và nghe:

- **Tiếng "cách cách cách"** → ✅ Relay hoạt động tốt!
- **Không nghe gì** → ❌ Kiểm tra kết nối

**Nếu relay luôn BẬT hoặc luôn TẮT**:

- Relay của bạn có thể dùng active HIGH thay vì LOW
- Sửa: `#define RELAY_ACTIVE_LOW false` (dòng 24)

**Test với Dashboard**:

1. Mở dashboard
2. Bật/tắt từng thiết bị
3. Nghe tiếng relay "cách"

---

### ✅ Test 5: Auto Pump (Tự động bơm)

**Mục tiêu**: Máy bơm tự động theo phao

**Scenario**:

1. **Bắt đầu**: Phao lên (nước cao) → Bơm TẮT
2. **Hạ phao** (nước thấp):
   - Chờ 5 giây → Bơm BẬT tự động
   - Xem Serial: `Pump ON`
3. **Nhấc phao** (nước cao):
   - Chờ 5 giây → Bơm TẮT tự động
   - Xem Serial: `Pump OFF`

**Timing**:

- Có delay 5 giây để tránh giật liên tục
- `PUMP_MIN_ON_MS = 5000` và `PUMP_MIN_OFF_MS = 5000`

**Manual Override**:

- Khi bạn bật/tắt bơm từ dashboard → Tự động tắt auto mode
- Để bật lại auto: Cần thêm button "Auto" trên dashboard (hiện chưa có UI)

---

### ✅ Test 6: Frontend ↔ ESP32 API

**Mục tiêu**: Dashboard kết nối và điều khiển được ESP32

**Chuẩn bị**:

```javascript
// js/config.js
export const ESP32_IP = "192.168.1.XXX"; // IP từ Serial Monitor
export const DEMO_MODE = false; // Phải là false!
```

**Test API thủ công**:

**1. Test GET /api/status**
Mở trình duyệt, vào:

```
http://192.168.1.XXX/api/status
```

Kết quả mong đợi:

```json
{
  "temperature": 26.5,
  "pump": { "state": false, "auto": true },
  "light": { "state": false },
  "feed": { "state": false },
  "float": { "level": "HIGH" },
  "wifi": { "rssi": -65 },
  "uptime": 120
}
```

**2. Test POST /api/pump**
Dùng Postman hoặc curl:

```bash
curl -X POST http://192.168.1.XXX/api/pump \
  -H "Content-Type: application/json" \
  -d '{"on": true}'
```

Nghe tiếng relay "cách" → ✅

**3. Test Dashboard**

1. Mở `index.html`
2. Mở Console (F12)
3. Kiểm tra:
   - ✅ Không có lỗi CORS
   - ✅ Nhiệt độ hiển thị đúng
   - ✅ Phao hiển thị đúng
   - ✅ Bật/tắt relay hoạt động

**Nếu CORS Error**:

- Code ESP32 đã có CORS headers
- Thử tắt antivirus/firewall
- Kiểm tra ESP32 và máy tính cùng mạng WiFi

---

## 🔧 Debug Tips

### 1. Serial Monitor là bạn thân!

Luôn mở Serial Monitor (115200 baud) để xem:

- Nhiệt độ đọc được
- Trạng thái phao
- Pump ON/OFF
- API requests

### 2. Test từng phần

Không test tất cả cùng lúc:

1. WiFi first
2. DS18B20 second
3. Float sensor third
4. Relay fourth
5. Dashboard last

### 3. Dùng LED test

Thêm LED vào breadboard để test:

```cpp
digitalWrite(LED_BUILTIN, pumpState);  // LED sáng khi bơm chạy
```

### 4. Check nguồn điện

- ESP32: 3.3V logic, 5V power
- Relay: Thường cần 5V, có thể cần nguồn ngoài
- DS18B20: 3.3V hoặc 5V đều được

---

## 📊 Expected Serial Output (Khi mọi thứ OK)

```
=== ESP32 Smart Aquarium Web Server ===
DS18B20 sensors found: 1
Connecting to WiFi.....
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

---

## ✅ Final Checklist

- [ ] ESP32 kết nối WiFi, có IP
- [ ] DS18B20 đọc nhiệt độ bình thường (không -127 hay 85)
- [ ] Float sensor đổi trạng thái CAO/THAP
- [ ] Relay nghe tiếng "cách" khi bật/tắt
- [ ] Auto pump: Phao thấp → Bơm bật, Phao cao → Bơm tắt
- [ ] Dashboard mở được, nhiệt độ update real-time
- [ ] Bật/tắt từ dashboard → Relay phản ứng
- [ ] Console không có lỗi CORS

Nếu tất cả đều ✅ → **Chúc mừng, hệ thống hoạt động hoàn hảo!** 🎉

---

**Gặp vấn đề?** Kiểm tra từng test trên theo thứ tự!
