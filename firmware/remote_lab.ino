#include <WiFi.h>
#include <WebSocketsServer.h>
#include <WebServer.h>
#include <ArduinoJson.h>
#include <SPIFFS.h>
#include <SPI.h>
#include <FS.h>
#include "calibration.h"

// WiFi credentials
const char* ssid = "YourWiFiSSID";
const char* password = "YourWiFiPassword";

// Pin definitions
const int RESISTOR_MEASURE_PIN = 34;  // GPIO34 is an ADC1 channel
const int KNOWN_RESISTOR = 10000;     // 10kΩ known resistor in voltage divider

// LED PWM experiment pins
const int LED_PIN = 2;                // Built-in LED or external LED
const int PWM_CHANNEL = 0;
const int PWM_FREQUENCY = 5000;
const int PWM_RESOLUTION = 8;         // 8-bit resolution (0-255)

// Temperature sensor pins (LM35)
const int TEMP_SENSOR_PIN = 35;       // GPIO35 for LM35

// Light sensor pins (LDR)
const int LIGHT_SENSOR_PIN = 32;      // GPIO32 for LDR with voltage divider

// Logic gate simulation pins
const int LOGIC_INPUT_A_PIN = 25;     // GPIO25 for input A
const int LOGIC_INPUT_B_PIN = 26;     // GPIO26 for input B
const int LOGIC_OUTPUT_PIN = 27;      // GPIO27 for output LED

// Global variables
bool temperatureMonitoring = false;
unsigned long lastTempReading = 0;
const unsigned long TEMP_INTERVAL = 2000; // 2 seconds

// Web server on port 80
WebServer server(80);

// WebSocket server on port 81
WebSocketsServer webSocket = WebSocketsServer(81);

// Function prototypes
void handleRoot();
void handleStyle();
void handleAppJS();
void handleNotFound();
void webSocketEvent(uint8_t num, WStype_t type, uint8_t *payload, size_t length);
void measureResistor(uint8_t client);
void setLEDBrightness(uint8_t client, int brightness);
void readTemperature(uint8_t client);
void readLightIntensity(uint8_t client);
void setLogicGate(uint8_t client, String gateType, bool inputA, bool inputB);
String getContentType(String filename);
bool handleFileRead(String path);

void setup() {
  Serial.begin(115200);
  
  // Initialize SPIFFS
  if (!SPIFFS.begin(true)) {
    Serial.println("An error occurred while mounting SPIFFS");
    return;
  }
  
  // Connect to WiFi
  WiFi.mode(WIFI_STA);
  WiFi.begin(ssid, password);
  
  Serial.println("Connecting to WiFi...");
  while (WiFi.status() != WL_CONNECTED) {
    delay(500);
    Serial.print(".");
  }
  
  Serial.println("");
  Serial.println("WiFi connected");
  Serial.print("IP address: ");
  Serial.println(WiFi.localIP());
  
  // Start WebSocket server
  webSocket.begin();
  webSocket.onEvent(webSocketEvent);
  
  // Set up web server routes
  server.on("/", HTTP_GET, handleRoot);
  server.on("/styles.css", HTTP_GET, handleStyle);
  server.on("/app.js", HTTP_GET, handleAppJS);
  
  // Handle file requests
  server.onNotFound([]() {
    if (!handleFileRead(server.uri())) {
      server.send(404, "text/plain", "File not found");
    }
  });
  
  // Start web server
  server.begin();
  Serial.println("HTTP server started");
  
  // Configure ADC
  analogReadResolution(12);  // Set ADC resolution to 12 bits (0-4095)
  analogSetAttenuation(ADC_11db);  // For full 0-3.3V range
  
  // Set pin modes
  pinMode(RESISTOR_MEASURE_PIN, INPUT);
  pinMode(TEMP_SENSOR_PIN, INPUT);
  pinMode(LIGHT_SENSOR_PIN, INPUT);
  pinMode(LOGIC_INPUT_A_PIN, INPUT_PULLUP);
  pinMode(LOGIC_INPUT_B_PIN, INPUT_PULLUP);
  pinMode(LOGIC_OUTPUT_PIN, OUTPUT);
  
  // Initialize PWM for LED
  ledcSetup(PWM_CHANNEL, PWM_FREQUENCY, PWM_RESOLUTION);
  ledcAttachPin(LED_PIN, PWM_CHANNEL);
  ledcWrite(PWM_CHANNEL, 0); // Start with LED off
}

void loop() {
  webSocket.loop();
  server.handleClient();
  
  // Handle temperature monitoring
  if (temperatureMonitoring && (millis() - lastTempReading > TEMP_INTERVAL)) {
    lastTempReading = millis();
    readTemperature(0); // Send to all clients
  }
}

// WebSocket event handler
void webSocketEvent(uint8_t num, WStype_t type, uint8_t *payload, size_t length) {
  switch (type) {
    case WStype_DISCONNECTED:
      Serial.printf("[%u] Disconnected!\n", num);
      break;
      
    case WStype_CONNECTED: {
      IPAddress ip = webSocket.remoteIP(num);
      Serial.printf("[%u] Connected from %d.%d.%d.%d\n", num, ip[0], ip[1], ip[2], ip[3]);
      
      // Send welcome message
      StaticJsonDocument<128> welcomeMsg;
      welcomeMsg["type"] = "status";
      welcomeMsg["message"] = "Connected to ESP32";
      welcomeMsg["version"] = "1.0.0";
      
      String jsonResponse;
      serializeJson(welcomeMsg, jsonResponse);
      webSocket.sendTXT(num, jsonResponse);
      break;
    }
      
    case WStype_TEXT: {
      // Log the received message
      Serial.printf("[%u] Received text: %s\n", num, payload);
      
      // Parse JSON message
      StaticJsonDocument<256> doc;
      DeserializationError error = deserializeJson(doc, payload);
      
      if (error) {
        Serial.print("deserializeJson() failed: ");
        Serial.println(error.c_str());
        
        // Send error response
        StaticJsonDocument<128> errorMsg;
        errorMsg["type"] = "error";
        errorMsg["message"] = "Invalid JSON format";
        
        String errorResponse;
        serializeJson(errorMsg, errorResponse);
        webSocket.sendTXT(num, errorResponse);
        return;
      }
      
      // Handle different commands
      const char* command = doc["command"];
      
      if (strcmp(command, "measure_resistor") == 0) {
        measureResistor(num);
      } else if (strcmp(command, "set_led_brightness") == 0) {
        int brightness = doc["brightness"] | 0;
        setLEDBrightness(num, brightness);
      } else if (strcmp(command, "read_temperature") == 0) {
        readTemperature(num);
      } else if (strcmp(command, "start_temperature_monitoring") == 0) {
        temperatureMonitoring = true;
        StaticJsonDocument<64> response;
        response["type"] = "status";
        response["message"] = "Temperature monitoring started";
        String jsonResponse;
        serializeJson(response, jsonResponse);
        webSocket.sendTXT(num, jsonResponse);
      } else if (strcmp(command, "stop_temperature_monitoring") == 0) {
        temperatureMonitoring = false;
        StaticJsonDocument<64> response;
        response["type"] = "status";
        response["message"] = "Temperature monitoring stopped";
        String jsonResponse;
        serializeJson(response, jsonResponse);
        webSocket.sendTXT(num, jsonResponse);
      } else if (strcmp(command, "read_light") == 0) {
        readLightIntensity(num);
      } else if (strcmp(command, "set_logic_gate") == 0) {
        String gateType = doc["gate_type"] | "AND";
        bool inputA = doc["input_a"] | false;
        bool inputB = doc["input_b"] | false;
        setLogicGate(num, gateType, inputA, inputB);
      } else if (strcmp(command, "ping") == 0) {
        // Simple ping-pong for connection testing
        StaticJsonDocument<64> pongMsg;
        pongMsg["type"] = "pong";
        pongMsg["timestamp"] = millis();
        
        String pongResponse;
        serializeJson(pongMsg, pongResponse);
        webSocket.sendTXT(num, pongResponse);
      } else {
        // Unknown command
        StaticJsonDocument<128> errorMsg;
        errorMsg["type"] = "error";
        errorMsg["message"] = "Unknown command";
        errorMsg["command"] = command;
        
        String errorResponse;
        serializeJson(errorMsg, errorResponse);
        webSocket.sendTXT(num, errorResponse);
      }
      break;
    }
      
    case WStype_ERROR:
      Serial.printf("[%u] Error!\n", num);
      break;
  }
}

void measureResistor(uint8_t client) {
  Serial.println("Starting resistor measurement...");
  
  // Take multiple samples and average for better accuracy
  const int numSamples = 20;
  float total = 0;
  int validSamples = 0;
  float minReading = 999999;
  float maxReading = 0;
  
  for (int i = 0; i < numSamples; i++) {
    int adcValue = analogRead(RESISTOR_MEASURE_PIN);
    float voltage = adcValue * (VOLTAGE_REFERENCE / ADC_MAX_VALUE) * VOLTAGE_CORRECTION_FACTOR;
    
    Serial.printf("Sample %d: ADC=%d, Voltage=%.3fV\n", i+1, adcValue, voltage);
    
    // Calculate unknown resistor using voltage divider formula
    // Vout = Vin * (R2 / (R1 + R2))
    // Solving for R2: R2 = (R1 * Vout) / (Vin - Vout)
    if (voltage > 0.05 && voltage < (VOLTAGE_REFERENCE - 0.05)) {  // Valid voltage range
      float r2 = (KNOWN_RESISTOR * voltage) / (VOLTAGE_REFERENCE - voltage);
      
      if (isValidMeasurement(r2)) {
        total += r2;
        validSamples++;
        
        if (r2 < minReading) minReading = r2;
        if (r2 > maxReading) maxReading = r2;
      }
    }
    delay(50);  // Small delay between samples
  }
  
  float avgResistance = 0;
  float uncertainty = 0;
  
  if (validSamples > 0) {
    avgResistance = total / validSamples;
    avgResistance = applyCalibratedMeasurement(avgResistance);
    uncertainty = calculateUncertainty(avgResistance, validSamples);
  }
  
  // Calculate standard deviation
  float variance = 0;
  if (validSamples > 1) {
    variance = pow(maxReading - minReading, 2) / (4 * validSamples);  // Approximation
  }
  float stdDev = sqrt(variance);
  
  Serial.printf("Measurement complete: %.2f ± %.2f ohms (%d valid samples)\n", 
                avgResistance, uncertainty, validSamples);
  
  // Send comprehensive measurement data back to client
  StaticJsonDocument<300> doc;
  doc["type"] = "resistance_measurement";
  doc["resistance"] = avgResistance;
  doc["unit"] = "ohms";
  doc["uncertainty"] = uncertainty;
  doc["samples"] = validSamples;
  doc["total_samples"] = numSamples;
  doc["min_reading"] = minReading;
  doc["max_reading"] = maxReading;
  doc["std_deviation"] = stdDev;
  doc["timestamp"] = millis();
  doc["quality"] = (validSamples >= 15) ? "good" : (validSamples >= 10) ? "fair" : "poor";
  
  String jsonResponse;
  serializeJson(doc, jsonResponse);
  webSocket.sendTXT(client, jsonResponse);
}

// LED PWM Brightness Control
void setLEDBrightness(uint8_t client, int brightness) {
  Serial.printf("Setting LED brightness to %d%%\n", brightness);
  
  // Constrain brightness to valid range
  brightness = constrain(brightness, 0, 100);
  
  // Convert percentage to PWM value (0-255)
  int pwmValue = map(brightness, 0, 100, 0, 255);
  
  // Set PWM output
  ledcWrite(PWM_CHANNEL, pwmValue);
  
  // Send response
  StaticJsonDocument<128> doc;
  doc["type"] = "led_status";
  doc["brightness"] = brightness;
  doc["pwm_value"] = pwmValue;
  doc["timestamp"] = millis();
  
  String jsonResponse;
  serializeJson(doc, jsonResponse);
  webSocket.sendTXT(client, jsonResponse);
}

// Temperature Reading (LM35)
void readTemperature(uint8_t client) {
  Serial.println("Reading temperature...");
  
  // Take multiple samples for accuracy
  const int numSamples = 10;
  float totalVoltage = 0;
  
  for (int i = 0; i < numSamples; i++) {
    int adcValue = analogRead(TEMP_SENSOR_PIN);
    float voltage = adcValue * (3.3 / 4095.0); // Convert to voltage
    totalVoltage += voltage;
    delay(10);
  }
  
  float avgVoltage = totalVoltage / numSamples;
  
  // LM35 outputs 10mV per degree Celsius
  float temperature = avgVoltage * 100.0; // Convert to Celsius
  
  Serial.printf("Temperature: %.2f°C (Voltage: %.3fV)\n", temperature, avgVoltage);
  
  // Send response
  StaticJsonDocument<128> doc;
  doc["type"] = "temperature_reading";
  doc["temperature"] = temperature;
  doc["voltage"] = avgVoltage;
  doc["unit"] = "celsius";
  doc["timestamp"] = millis();
  
  String jsonResponse;
  serializeJson(doc, jsonResponse);
  
  if (client == 0) {
    // Broadcast to all clients (for monitoring mode)
    webSocket.broadcastTXT(jsonResponse);
  } else {
    webSocket.sendTXT(client, jsonResponse);
  }
}

// Light Intensity Reading (LDR)
void readLightIntensity(uint8_t client) {
  Serial.println("Reading light intensity...");
  
  // Take multiple samples for accuracy
  const int numSamples = 10;
  float totalVoltage = 0;
  
  for (int i = 0; i < numSamples; i++) {
    int adcValue = analogRead(LIGHT_SENSOR_PIN);
    float voltage = adcValue * (3.3 / 4095.0);
    totalVoltage += voltage;
    delay(10);
  }
  
  float avgVoltage = totalVoltage / numSamples;
  
  // Convert voltage to light intensity (approximate lux calculation)
  // This assumes a voltage divider with LDR and 10kΩ resistor
  float resistance = (10000.0 * (3.3 - avgVoltage)) / avgVoltage;
  
  // Approximate lux calculation (calibration may be needed)
  float lightIntensity = 500000.0 / resistance; // Rough approximation
  lightIntensity = constrain(lightIntensity, 0, 2000); // Reasonable range
  
  Serial.printf("Light intensity: %.1f lux (Voltage: %.3fV, Resistance: %.1fΩ)\n", 
                lightIntensity, avgVoltage, resistance);
  
  // Send response
  StaticJsonDocument<150> doc;
  doc["type"] = "light_reading";
  doc["light_intensity"] = lightIntensity;
  doc["voltage"] = avgVoltage;
  doc["resistance"] = resistance;
  doc["unit"] = "lux";
  doc["timestamp"] = millis();
  
  String jsonResponse;
  serializeJson(doc, jsonResponse);
  webSocket.sendTXT(client, jsonResponse);
}

// Logic Gate Simulation
void setLogicGate(uint8_t client, String gateType, bool inputA, bool inputB) {
  Serial.printf("Logic gate: %s, A=%d, B=%d\n", gateType.c_str(), inputA, inputB);
  
  bool output = false;
  
  // Calculate output based on gate type
  if (gateType == "AND") {
    output = inputA && inputB;
  } else if (gateType == "OR") {
    output = inputA || inputB;
  } else if (gateType == "NOT") {
    output = !inputA; // Use only input A for NOT gate
  } else if (gateType == "NAND") {
    output = !(inputA && inputB);
  } else if (gateType == "NOR") {
    output = !(inputA || inputB);
  } else if (gateType == "XOR") {
    output = inputA != inputB;
  }
  
  // Set physical output LED
  digitalWrite(LOGIC_OUTPUT_PIN, output ? HIGH : LOW);
  
  Serial.printf("Logic gate output: %d\n", output);
  
  // Send response
  StaticJsonDocument<150> doc;
  doc["type"] = "logic_gate_result";
  doc["gate_type"] = gateType;
  doc["input_a"] = inputA;
  doc["input_b"] = inputB;
  doc["output"] = output;
  doc["timestamp"] = millis();
  
  String jsonResponse;
  serializeJson(doc, jsonResponse);
  webSocket.sendTXT(client, jsonResponse);
}

// Web server handlers
void handleRoot() {
  if (!handleFileRead("/index.html")) {
    String html = R"rawliteral(
<!DOCTYPE html>
<html>
<head>
    <title>Remote Laboratory</title>
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css" rel="stylesheet">
</head>
<body>
    <div class="container mt-4">
        <h1>Remote Laboratory</h1>
        <p>ESP32 IP: )rawliteral" + WiFi.localIP().toString() + R"rawliteral(</p>
        <p>WebSocket Port: 81</p>
        <p>Status: Ready for connections</p>
        <a href="/app.js" class="btn btn-primary">Download App.js</a>
        <a href="/styles.css" class="btn btn-secondary">Download Styles.css</a>
    </div>
</body>
</html>
)rawliteral";
    server.send(200, "text/html", html);
  }
}

void handleStyle() {
  if (!handleFileRead("/styles.css")) {
    server.send(200, "text/css", "/* Styles not found in SPIFFS */");
  }
}

void handleAppJS() {
  if (!handleFileRead("/app.js")) {
    server.send(200, "application/javascript", "// App.js not found in SPIFFS");
  }
}

// Handle file reading from SPIFFS
bool handleFileRead(String path) {
  Serial.println("handleFileRead: " + path);
  
  if (path.endsWith("/")) {
    path += "index.html";
  }
  
  String contentType = getContentType(path);
  
  if (SPIFFS.exists(path)) {
    File file = SPIFFS.open(path, "r");
    server.streamFile(file, contentType);
    file.close();
    return true;
  }
  
  Serial.println("File not found: " + path);
  return false;
}

// Get content type based on file extension
String getContentType(String filename) {
  if (filename.endsWith(".html")) return "text/html";
  else if (filename.endsWith(".css")) return "text/css";
  else if (filename.endsWith(".js")) return "application/javascript";
  else if (filename.endsWith(".png")) return "image/png";
  else if (filename.endsWith(".gif")) return "image/gif";
  else if (filename.endsWith(".jpg")) return "image/jpeg";
  else if (filename.endsWith(".ico")) return "image/x-icon";
  else if (filename.endsWith(".xml")) return "text/xml";
  else if (filename.endsWith(".pdf")) return "application/pdf";
  else if (filename.endsWith(".zip")) return "application/zip";
  return "text/plain";
}
