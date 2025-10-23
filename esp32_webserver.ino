/*
 * ESP32 Smart Aquarium - Web Server
 * Hardware: DS18B20(GPIO4) + Float(GPIO13) + Pump(GPIO5) + Light(GPIO14) + Feeder(GPIO15)
 * 
 * Chức năng:
 * - Web server serve HTML/CSS/JS dashboard
 * - REST API cho temperature, pump, light, feeder control
 * - Auto pump control dựa vào float sensor
 * - CORS enabled cho development
 */

#include <Arduino.h>
#include <WiFi.h>
#include <WebServer.h>
#include <SPIFFS.h>
#include <OneWire.h>
#include <DallasTemperature.h>
#include <ArduinoJson.h>

// ========== WiFi Configuration ==========
const char* WIFI_SSID = "YOUR_WIFI_SSID";        // Thay đổi
const char* WIFI_PASSWORD = "YOUR_WIFI_PASSWORD"; // Thay đổi

// ========== Hardware Pins ==========
#define DS_PIN             4     // DS18B20 temperature sensor
#define FLOAT_PIN          27    // Float sensor (2-wire) - GPIO27 ↔ GND
#define RELAY_PUMP_PIN     5     // Pump relay
#define RELAY_LIGHT_PIN    14    // Light relay (OPTIONAL - comment if not used)
#define RELAY_FEED_PIN     15    // Feeder relay (OPTIONAL - comment if not used)
#define RELAY_ACTIVE_LOW   true  // Most relays: LOW = ON

// ========== Hardware Configuration ==========
// Bật/tắt thiết bị tùy theo phần cứng thực tế
#define ENABLE_LIGHT       false  // Set true nếu có relay đèn
#define ENABLE_FEEDER      false  // Set true nếu có relay cho ăn

// ========== DS18B20 Setup ==========
OneWire oneWire(DS_PIN);
DallasTemperature sensors(&oneWire);
#define DS_RESOLUTION 12

// ========== State Variables ==========
bool pumpState = false;
bool pumpAutoMode = true;  // true = auto by float, false = manual
bool lightState = false;
bool feedState = false;
float lastTemperature = NAN;

unsigned long pumpLastChange = 0;
const unsigned long PUMP_MIN_ON_MS  = 5000;
const unsigned long PUMP_MIN_OFF_MS = 5000;

unsigned long lastTempRead = 0;
const unsigned long TEMP_READ_INTERVAL = 2000;

// ========== Web Server ==========
WebServer server(80);

// ========== Helper Functions ==========

void pumpSet(bool on) {
  digitalWrite(RELAY_PUMP_PIN, (RELAY_ACTIVE_LOW ? !on : on));
  if (pumpState != on) {
    pumpState = on;
    pumpLastChange = millis();
    Serial.printf("Pump %s\n", on ? "ON" : "OFF");
  }
}

void lightSet(bool on) {
  #if ENABLE_LIGHT
    digitalWrite(RELAY_LIGHT_PIN, (RELAY_ACTIVE_LOW ? !on : on));
    lightState = on;
    Serial.printf("Light %s\n", on ? "ON" : "OFF");
  #else
    Serial.println("Light relay not enabled in hardware config");
  #endif
}

void feedSet(bool on) {
  #if ENABLE_FEEDER
    digitalWrite(RELAY_FEED_PIN, (RELAY_ACTIVE_LOW ? !on : on));
    feedState = on;
    Serial.printf("Feeder %s\n", on ? "ON" : "OFF");
    
    // Auto turn off feeder after 3 seconds
    if (on) {
      delay(3000);
      feedSet(false);
    }
  #else
    Serial.println("Feeder relay not enabled in hardware config");
  #endif
}

// Phao: dùng INPUT_PULLUP → đóng mạch (mực CAO) = LOW
// Logic: Float nổi (nước CAO) → chạm → LOW → return true
//        Float chìm (nước THẤP) → hở → HIGH → return false
bool isHighLevelRaw() {
  return digitalRead(FLOAT_PIN) == LOW;
}

bool isHighLevelDebounced() {
  static bool lastStable = false, lastRead = false;
  static unsigned long lastChange = 0;
  bool now = isHighLevelRaw();
  if (now != lastRead) {
    lastRead = now;
    lastChange = millis();
  }
  if (millis() - lastChange > 120) {
    lastStable = now;
  }
  return lastStable;
}

float readDS18B20C() {
  sensors.requestTemperatures();
  float t = sensors.getTempCByIndex(0);
  if (t < -55 || t > 125) return NAN;
  return t;
}

// ========== CORS Headers ==========
void setCORSHeaders() {
  server.sendHeader("Access-Control-Allow-Origin", "*");
  server.sendHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
  server.sendHeader("Access-Control-Allow-Headers", "Content-Type");
}

// ========== API Endpoints ==========

// GET /api/status - Lấy tất cả trạng thái
void handleApiStatus() {
  setCORSHeaders();
  
  StaticJsonDocument<512> doc;
  doc["temperature"] = isnan(lastTemperature) ? 0 : lastTemperature;
  doc["pump"]["state"] = pumpState;
  doc["pump"]["auto"] = pumpAutoMode;
  doc["light"]["state"] = lightState;
  doc["feed"]["state"] = feedState;
  doc["float"]["level"] = isHighLevelDebounced() ? "HIGH" : "LOW";
  doc["wifi"]["rssi"] = WiFi.RSSI();
  doc["uptime"] = millis() / 1000;
  
  String output;
  serializeJson(doc, output);
  server.send(200, "application/json", output);
}

// GET /api/temperature
void handleApiTemperature() {
  setCORSHeaders();
  
  StaticJsonDocument<128> doc;
  doc["temperature"] = isnan(lastTemperature) ? 0 : lastTemperature;
  doc["unit"] = "celsius";
  
  String output;
  serializeJson(doc, output);
  server.send(200, "application/json", output);
}

// POST /api/pump - Control pump manually
void handleApiPump() {
  setCORSHeaders();
  
  if (server.method() == HTTP_OPTIONS) {
    server.send(200);
    return;
  }
  
  if (!server.hasArg("plain")) {
    server.send(400, "application/json", "{\"error\":\"No body\"}");
    return;
  }
  
  StaticJsonDocument<128> doc;
  DeserializationError error = deserializeJson(doc, server.arg("plain"));
  
  if (error) {
    server.send(400, "application/json", "{\"error\":\"Invalid JSON\"}");
    return;
  }
  
  if (doc.containsKey("on")) {
    bool on = doc["on"];
    pumpAutoMode = false; // Switch to manual mode
    pumpSet(on);
  }
  
  if (doc.containsKey("auto")) {
    pumpAutoMode = doc["auto"];
    Serial.printf("Pump mode: %s\n", pumpAutoMode ? "AUTO" : "MANUAL");
  }
  
  StaticJsonDocument<128> response;
  response["pump"]["state"] = pumpState;
  response["pump"]["auto"] = pumpAutoMode;
  
  String output;
  serializeJson(response, output);
  server.send(200, "application/json", output);
}

// POST /api/light
void handleApiLight() {
  setCORSHeaders();
  
  if (server.method() == HTTP_OPTIONS) {
    server.send(200);
    return;
  }
  
  if (!server.hasArg("plain")) {
    server.send(400, "application/json", "{\"error\":\"No body\"}");
    return;
  }
  
  StaticJsonDocument<128> doc;
  DeserializationError error = deserializeJson(doc, server.arg("plain"));
  
  if (error) {
    server.send(400, "application/json", "{\"error\":\"Invalid JSON\"}");
    return;
  }
  
  if (doc.containsKey("on")) {
    lightSet(doc["on"]);
  }
  
  StaticJsonDocument<128> response;
  response["light"]["state"] = lightState;
  
  String output;
  serializeJson(response, output);
  server.send(200, "application/json", output);
}

// POST /api/feed
void handleApiFeed() {
  setCORSHeaders();
  
  if (server.method() == HTTP_OPTIONS) {
    server.send(200);
    return;
  }
  
  if (!server.hasArg("plain")) {
    server.send(400, "application/json", "{\"error\":\"No body\"}");
    return;
  }
  
  StaticJsonDocument<128> doc;
  DeserializationError error = deserializeJson(doc, server.arg("plain"));
  
  if (error) {
    server.send(400, "application/json", "{\"error\":\"Invalid JSON\"}");
    return;
  }
  
  if (doc.containsKey("on") && doc["on"]) {
    feedSet(true); // Auto turns off after 3 seconds
  }
  
  StaticJsonDocument<128> response;
  response["feed"]["state"] = feedState;
  response["message"] = "Feeder activated for 3 seconds";
  
  String output;
  serializeJson(response, output);
  server.send(200, "application/json", output);
}

// OPTIONS handler for CORS
void handleOptions() {
  setCORSHeaders();
  server.send(200);
}

// Serve files from SPIFFS
void handleFileRequest() {
  String path = server.uri();
  if (path.endsWith("/")) path += "index.html";
  
  String contentType = "text/plain";
  if (path.endsWith(".html")) contentType = "text/html";
  else if (path.endsWith(".css")) contentType = "text/css";
  else if (path.endsWith(".js")) contentType = "application/javascript";
  else if (path.endsWith(".json")) contentType = "application/json";
  else if (path.endsWith(".png")) contentType = "image/png";
  else if (path.endsWith(".jpg")) contentType = "image/jpeg";
  else if (path.endsWith(".ico")) contentType = "image/x-icon";
  
  if (SPIFFS.exists(path)) {
    File file = SPIFFS.open(path, "r");
    server.streamFile(file, contentType);
    file.close();
    return;
  }
  
  server.send(404, "text/plain", "File Not Found");
}

// ========== Setup ==========
void setup() {
  Serial.begin(115200);
  Serial.println("\n=== ESP32 Smart Aquarium Web Server ===");
  Serial.println("Hardware: DS18B20(GPIO4) + Float(GPIO27) + Pump(GPIO5)");
  Serial.printf("Light relay: %s | Feeder relay: %s\n", 
                ENABLE_LIGHT ? "ENABLED" : "DISABLED",
                ENABLE_FEEDER ? "ENABLED" : "DISABLED");
  
  // Setup pins
  pinMode(RELAY_PUMP_PIN, OUTPUT);
  pinMode(FLOAT_PIN, INPUT_PULLUP);
  pumpSet(false); // Tắt bơm khi khởi động (an toàn)
  
  #if ENABLE_LIGHT
    pinMode(RELAY_LIGHT_PIN, OUTPUT);
    lightSet(false);
  #endif
  
  #if ENABLE_FEEDER
    pinMode(RELAY_FEED_PIN, OUTPUT);
    feedSet(false);
  #endif
  
  // Setup DS18B20
  sensors.begin();
  sensors.setResolution(DS_RESOLUTION);
  sensors.setWaitForConversion(true);
  Serial.printf("DS18B20 sensors found: %d\n", sensors.getDeviceCount());
  
  // Connect to WiFi
  WiFi.mode(WIFI_STA);
  WiFi.begin(WIFI_SSID, WIFI_PASSWORD);
  Serial.print("Connecting to WiFi");
  
  int attempts = 0;
  while (WiFi.status() != WL_CONNECTED && attempts < 30) {
    delay(500);
    Serial.print(".");
    attempts++;
  }
  
  if (WiFi.status() == WL_CONNECTED) {
    Serial.println("\nWiFi connected!");
    Serial.print("IP address: ");
    Serial.println(WiFi.localIP());
    Serial.print("RSSI: ");
    Serial.println(WiFi.RSSI());
  } else {
    Serial.println("\nWiFi connection failed!");
  }
  
  // Initialize SPIFFS
  if (!SPIFFS.begin(true)) {
    Serial.println("SPIFFS Mount Failed");
  } else {
    Serial.println("SPIFFS mounted successfully");
  }
  
  // Setup web server routes
  server.on("/api/status", HTTP_GET, handleApiStatus);
  server.on("/api/temperature", HTTP_GET, handleApiTemperature);
  server.on("/api/pump", HTTP_POST, handleApiPump);
  server.on("/api/pump", HTTP_OPTIONS, handleOptions);
  server.on("/api/light", HTTP_POST, handleApiLight);
  server.on("/api/light", HTTP_OPTIONS, handleOptions);
  server.on("/api/feed", HTTP_POST, handleApiFeed);
  server.on("/api/feed", HTTP_OPTIONS, handleOptions);
  
  // Serve static files
  server.onNotFound(handleFileRequest);
  
  server.begin();
  Serial.println("HTTP server started");
  Serial.println("Access dashboard at: http://" + WiFi.localIP().toString());
}

// ========== Main Loop ==========
void loop() {
  server.handleClient();
  
  unsigned long now = millis();
  
  // Read temperature periodically
  if (now - lastTempRead >= TEMP_READ_INTERVAL) {
    lastTempRead = now;
    float t = readDS18B20C();
    if (!isnan(t)) {
      lastTemperature = t;
    }
  }
  
  // Auto pump control based on float sensor
  if (pumpAutoMode) {
    bool highLevel = isHighLevelDebounced();
    
    // HIGH level => turn OFF pump (with min ON time check)
    if (highLevel && pumpState) {
      if (now - pumpLastChange >= PUMP_MIN_ON_MS) {
        pumpSet(false);
      }
    }
    // LOW level => turn ON pump (with min OFF time check)
    else if (!highLevel && !pumpState) {
      if (now - pumpLastChange >= PUMP_MIN_OFF_MS) {
        pumpSet(true);
      }
    }
  }
  
  delay(10);
}

