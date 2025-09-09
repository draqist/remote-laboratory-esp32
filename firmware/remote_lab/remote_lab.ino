#include <WiFi.h>
#include <WebSocketsServer.h>
#include <WebServer.h>
#include <ArduinoJson.h>
#include <SPIFFS.h>
#include <SPI.h>
#include <FS.h>
#include "calibration.h"

// WiFi credentials
const char* ssid = "Dråq™ Pro";
const char* password = "Hackth8rite";

// Pin definitions with corrected GPIO assignments
// ESP32 ADC1 pins that work with WiFi enabled
const int RESISTOR_MEASURE_PIN = 36;    // GPIO36 (ADC1_CH0) - Corrected from 34
const int LIGHT_SENSOR_PIN = 39;        // GPIO39 (ADC1_CH3) - Corrected from 32
const int TEMP_SENSOR_PIN = 34;         // GPIO34 (ADC1_CH6) - Corrected from 35

// LED PWM control
const int LED_PIN = 2;                   // Built-in LED (or external LED with resistor)
const int PWM_CHANNEL = 0;               // PWM channel 0-15
const int PWM_FREQUENCY = 1000;          // 1KHz PWM frequency
const int PWM_RESOLUTION = 8;            // 8-bit resolution (0-255)

// Logic gate simulation pins
const int LOGIC_INPUT_A_PIN = 25;        // GPIO25 for input A (with internal pullup)
const int LOGIC_INPUT_B_PIN = 26;        // GPIO26 for input B (with internal pullup)
const int LOGIC_OUTPUT_PIN = 27;         // GPIO27 for output LED

// Calibration constants - ADJUST THESE FOR YOUR SETUP
const float VREF = 3.3;                 // Reference voltage
const int ADC_RESOLUTION = 4095;        // 12-bit ADC
const int KNOWN_RESISTOR = 10000;       // 10kΩ reference resistor
const float ADC_OFFSET = 0.0;           // ADC offset correction
const float ADC_GAIN = 1.0;             // ADC gain correction

// Temperature sensor calibration (for LM35)
const float TEMP_OFFSET = 0.0;          // Temperature offset in °C
const float TEMP_GAIN = 100.0;          // LM35: 10mV/°C = 100°C/V

// LDR calibration parameters
const float LDR_DARK_RESISTANCE = 100000;   // LDR resistance in dark (Ω)
const float LDR_BRIGHT_RESISTANCE = 1000;   // LDR resistance in bright light (Ω)
const float LUX_DARK = 1;                   // Lux value in dark
const float LUX_BRIGHT = 1000;              // Lux value in bright light

// Global variables
bool temperatureMonitoring = false;
unsigned long lastTempReading = 0;
const unsigned long TEMP_INTERVAL = 2000; // 2 seconds

// Debugging flags
bool debugMode = true;

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
void sendError(uint8_t client, const char* message);
void debugPrint(String message);
void testADCPins();
float readCalibratedVoltage(int pin);

void setup() {
  // Start serial communication
  Serial.begin(115200);
  delay(1000);
  Serial.println("\n=== ESP32 Remote Lab Starting ===");
  
  // Test ADC pins first
  testADCPins();
  
  // Initialize file system
  if (!SPIFFS.begin(true)) {
    Serial.println("Error mounting SPIFFS");
    while (1) delay(1000); // Halt if SPIFFS fails
  }
  
  // Connect to WiFi
  WiFi.mode(WIFI_STA);
  WiFi.begin(ssid, password);
  
  Serial.print("Connecting to WiFi");
  while (WiFi.status() != WL_CONNECTED) {
    delay(500);
    Serial.print(".");
  }
  Serial.println("\nWiFi connected");
  Serial.print("IP address: ");
  Serial.println(WiFi.localIP());
  
  // Start WebSocket server
  webSocket.begin();
  webSocket.onEvent(webSocketEvent);
  
  // Configure HTTP server
  server.on("/", handleRoot);
  server.on("/app.js", HTTP_GET, []() {
    if (!handleFileRead("/app.js")) {
      server.send(404, "text/plain", "app.js not found");
    }
  });
  
  server.on("/styles.css", HTTP_GET, []() {
    if (!handleFileRead("/styles.css")) {
      server.send(404, "text/plain", "styles.css not found");
    }
  });
  
  server.onNotFound([]() {
    if (!handleFileRead(server.uri())) {
      server.send(404, "text/plain", "File not found");
    }
  });
  
  server.begin();
  Serial.println("HTTP server started");
  
  // Configure ADC with proper settings
  analogReadResolution(12);        // 12-bit resolution (0-4095)
  analogSetAttenuation(ADC_11db);  // Full range 0-3.6V (not 3.3V!)
  
  // Configure PWM for LED
  ledcAttach(LED_PIN, PWM_FREQUENCY, PWM_RESOLUTION);
  // ledcAttachPin(LED_PIN, PWM_CHANNEL);
  ledcWrite(PWM_CHANNEL, 0);  // Start with LED off
  
  // Configure logic gate pins
  pinMode(LOGIC_INPUT_A_PIN, INPUT_PULLUP);
  pinMode(LOGIC_INPUT_B_PIN, INPUT_PULLUP);
  pinMode(LOGIC_OUTPUT_PIN, OUTPUT);
  digitalWrite(LOGIC_OUTPUT_PIN, LOW);
  
  // Print pin configuration
  Serial.println("\n--- Pin Configuration ---");
  Serial.printf("Resistor Measure: GPIO%d\n", RESISTOR_MEASURE_PIN);
  Serial.printf("Light Sensor:     GPIO%d\n", LIGHT_SENSOR_PIN);
  Serial.printf("Temperature:      GPIO%d\n", TEMP_SENSOR_PIN);
  Serial.printf("LED PWM:          GPIO%d (Channel %d)\n", LED_PIN, PWM_CHANNEL);
  Serial.printf("Logic Input A:    GPIO%d\n", LOGIC_INPUT_A_PIN);
  Serial.printf("Logic Input B:    GPIO%d\n", LOGIC_INPUT_B_PIN);
  Serial.printf("Logic Output:     GPIO%d\n", LOGIC_OUTPUT_PIN);
  Serial.println("--------------------------\n");
  
  // Test initial readings
  Serial.println("=== Initial Sensor Test ===");
  float testVolt1 = readCalibratedVoltage(RESISTOR_MEASURE_PIN);
  float testVolt2 = readCalibratedVoltage(LIGHT_SENSOR_PIN);
  float testVolt3 = readCalibratedVoltage(TEMP_SENSOR_PIN);
  
  Serial.printf("Resistor pin voltage: %.3fV\n", testVolt1);
  Serial.printf("Light sensor voltage: %.3fV\n", testVolt2);
  Serial.printf("Temperature voltage: %.3fV\n", testVolt3);
  Serial.println("==============================\n");
  
  Serial.println("Setup complete. Ready for connections.");
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

// Test ADC pins to verify they're working
void testADCPins() {
  Serial.println("\n=== ADC Pin Test ===");
  
  // Test each pin 5 times
  for (int pin : {RESISTOR_MEASURE_PIN, LIGHT_SENSOR_PIN, TEMP_SENSOR_PIN}) {
    Serial.printf("Testing GPIO%d: ", pin);
    for (int i = 0; i < 5; i++) {
      int raw = analogRead(pin);
      Serial.printf("%d ", raw);
      delay(100);
    }
    Serial.println();
  }
  Serial.println("==================\n");
}

// Read calibrated voltage from ADC pin
float readCalibratedVoltage(int pin) {
  const int samples = 50;  // More samples for stability
  uint32_t total = 0;
  
  // Discard first few readings (ADC settling)
  for (int i = 0; i < 5; i++) {
    analogRead(pin);
    delay(1);
  }
  
  // Take actual samples
  for (int i = 0; i < samples; i++) {
    total += analogRead(pin);
    delay(2);  // Small delay between readings
  }
  
  float avgADC = total / (float)samples;
  
  // Apply calibration
  avgADC = (avgADC + ADC_OFFSET) * ADC_GAIN;
  
  // Convert to voltage - ESP32 with 11dB attenuation can read up to ~3.6V
  float voltage = avgADC * (3.6 / ADC_RESOLUTION);
  
  return voltage;
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
      
      // Send welcome message with device info
      StaticJsonDocument<256> welcomeMsg;
      welcomeMsg["type"] = "status";
      welcomeMsg["message"] = "Connected to Remote Lab";
      welcomeMsg["version"] = "1.1.0";
      welcomeMsg["chip_id"] = (uint32_t)ESP.getEfuseMac();
      welcomeMsg["free_heap"] = ESP.getFreeHeap();
      
      String jsonResponse;
      serializeJson(welcomeMsg, jsonResponse);
      webSocket.sendTXT(num, jsonResponse);
      break;
    }
      
    case WStype_TEXT: {
      // Debug log
      String message = String((char*)payload);
      Serial.printf("[%u] Received: %s\n", num, message.c_str());
      
      // Parse incoming JSON
      StaticJsonDocument<256> doc;
      DeserializationError error = deserializeJson(doc, payload);
      
      if (error) {
        Serial.print("JSON parse failed: ");
        Serial.println(error.c_str());
        sendError(num, "Invalid JSON format");
        return;
      }
      
      // Check if command exists
      if (!doc.containsKey("command")) {
        sendError(num, "No command specified");
        return;
      }
      
      const char* command = doc["command"];
      
      // Handle different commands
      if (strcmp(command, "measure_resistor") == 0) {
        measureResistor(num);
      } 
      else if (strcmp(command, "set_led") == 0) {
        if (doc.containsKey("brightness")) {
          int brightness = doc["brightness"];
          setLEDBrightness(num, brightness);
        } else {
          sendError(num, "Missing brightness parameter");
        }
      }
      else if (strcmp(command, "read_light") == 0) {
        readLightIntensity(num);
      }
      else if (strcmp(command, "read_temperature") == 0) {
        readTemperature(num);
      }
      else if (strcmp(command, "set_logic_gate") == 0) {
        if (doc.containsKey("gate") && doc.containsKey("inputA") && doc.containsKey("inputB")) {
          const char* gateType = doc["gate"];
          bool inputA = doc["inputA"];
          bool inputB = doc["inputB"];
          setLogicGate(num, String(gateType), inputA, inputB);
        } else {
          sendError(num, "Missing parameters for set_logic_gate");
        }
      }
      else if (strcmp(command, "start_temp_monitoring") == 0) {
        temperatureMonitoring = true;
        lastTempReading = 0; // Force immediate reading
        
        StaticJsonDocument<128> response;
        response["type"] = "status";
        response["message"] = "Temperature monitoring started";
        
        String jsonResponse;
        serializeJson(response, jsonResponse);
        webSocket.sendTXT(num, jsonResponse);
      }
      else if (strcmp(command, "stop_temp_monitoring") == 0) {
        temperatureMonitoring = false;
        
        StaticJsonDocument<128> response;
        response["type"] = "status";
        response["message"] = "Temperature monitoring stopped";
        
        String jsonResponse;
        serializeJson(response, jsonResponse);
        webSocket.sendTXT(num, jsonResponse);
      }
      else if (strcmp(command, "debug_adc") == 0) {
        // Debug command to test ADC readings
        StaticJsonDocument<300> response;
        response["type"] = "debug_adc";
        
        response["resistor_raw"] = analogRead(RESISTOR_MEASURE_PIN);
        response["resistor_voltage"] = readCalibratedVoltage(RESISTOR_MEASURE_PIN);
        
        response["light_raw"] = analogRead(LIGHT_SENSOR_PIN);
        response["light_voltage"] = readCalibratedVoltage(LIGHT_SENSOR_PIN);
        
        response["temp_raw"] = analogRead(TEMP_SENSOR_PIN);
        response["temp_voltage"] = readCalibratedVoltage(TEMP_SENSOR_PIN);
        
        String jsonResponse;
        serializeJson(response, jsonResponse);
        webSocket.sendTXT(num, jsonResponse);
      }
      else if (strcmp(command, "ping") == 0) {
        // Simple ping-pong for connection testing
        StaticJsonDocument<64> pongMsg;
        pongMsg["type"] = "pong";
        pongMsg["timestamp"] = millis();
        
        String pongResponse;
        serializeJson(pongMsg, pongResponse);
        webSocket.sendTXT(num, pongResponse);
      }
      else {
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

// Helper function to send error messages
void sendError(uint8_t client, const char* message) {
  StaticJsonDocument<128> doc;
  doc["type"] = "error";
  doc["message"] = message;
  
  String jsonResponse;
  serializeJson(doc, jsonResponse);
  webSocket.sendTXT(client, jsonResponse);
}

void measureResistor(uint8_t client) {
  debugPrint("Starting resistor measurement...");
  
  float voltage = readCalibratedVoltage(RESISTOR_MEASURE_PIN);
  
  // Validate voltage reading
  if (voltage < 0.1 || voltage > 3.5) {
    debugPrint("Warning: Voltage out of expected range");
  }
  
  // Calculate resistance using voltage divider: R_unknown = R_known * (Vin - Vout) / Vout
  // Where Vout is the voltage we measure, Vin is 3.3V
  float measuredR = 0;
  bool validReading = false;
  
  if (voltage > 0.05 && voltage < 3.5) {  // Valid voltage range
    // For voltage divider: Vout = Vin * R2 / (R1 + R2)
    // Solving for R2 (unknown): R2 = (Vout * R1) / (Vin - Vout)
    measuredR = (voltage * KNOWN_RESISTOR) / (3.3 - voltage);
    
    // Sanity check
    if (measuredR > 0 && measuredR < 10000000) {  // 0Ω to 10MΩ range
      validReading = true;
    }
  }
  
  // Debug output
  Serial.printf("Resistor - Voltage: %.3fV, Calculated R: %.1fΩ, Valid: %s\n", 
               voltage, measuredR, validReading ? "YES" : "NO");
  
  // Prepare response
  StaticJsonDocument<250> doc;
  doc["type"] = "resistance_measurement";
  doc["resistance"] = validReading ? measuredR : 0;
  doc["voltage"] = voltage;
  doc["raw_adc"] = analogRead(RESISTOR_MEASURE_PIN);
  doc["valid"] = validReading;
  doc["known_resistor"] = KNOWN_RESISTOR;
  doc["unit"] = "ohms";
  doc["timestamp"] = millis();
  
  String jsonResponse;
  serializeJson(doc, jsonResponse);
  webSocket.sendTXT(client, jsonResponse);
}

// LED PWM Control
void setLEDBrightness(uint8_t client, int brightness) {
  // Constrain brightness to 0-100%
  brightness = constrain(brightness, 0, 100);
  
  // Convert percentage to 8-bit PWM (0-255)
  int pwmValue = map(brightness, 0, 100, 0, 255);
  
  // Set PWM output
  ledcWrite(PWM_CHANNEL, pwmValue);
  
  // Debug output
  Serial.printf("LED - Brightness: %d%%, PWM: %d\n", brightness, pwmValue);
  
  // Send response
  StaticJsonDocument<128> doc;
  doc["type"] = "led_status";
  doc["brightness"] = brightness;
  doc["pwm"] = pwmValue;
  doc["timestamp"] = millis();
  
  String jsonResponse;
  serializeJson(doc, jsonResponse);
  webSocket.sendTXT(client, jsonResponse);
}

// Temperature Reading (LM35)
void readTemperature(uint8_t client) {
  debugPrint("Reading temperature...");
  
  float voltage = readCalibratedVoltage(TEMP_SENSOR_PIN);
  
  // LM35 outputs 10mV per degree Celsius
  float temperature = (voltage * TEMP_GAIN) + TEMP_OFFSET;
  
  // Sanity check for temperature
  bool validTemp = (temperature > -40 && temperature < 125);
  
  Serial.printf("Temperature: %.2f°C (Voltage: %.3fV), Valid: %s\n", 
                temperature, voltage, validTemp ? "YES" : "NO");
  
  // Send response
  StaticJsonDocument<150> doc;
  doc["type"] = "temperature_reading";
  doc["temperature"] = validTemp ? temperature : 0;
  doc["voltage"] = voltage;
  doc["raw_adc"] = analogRead(TEMP_SENSOR_PIN);
  doc["valid"] = validTemp;
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
  debugPrint("Reading light intensity...");
  
  float voltage = readCalibratedVoltage(LIGHT_SENSOR_PIN);
  
  // Calculate LDR resistance using voltage divider
  float ldrResistance = 0;
  bool validReading = false;
  
  if (voltage > 0.05 && voltage < 3.5) {
    // LDR is the lower resistor in voltage divider
    // Vout = Vin * R_LDR / (R_fixed + R_LDR)
    // Solving: R_LDR = (Vout * R_fixed) / (Vin - Vout)
    ldrResistance = (voltage * KNOWN_RESISTOR) / (3.3 - voltage);
    
    if (ldrResistance > 0 && ldrResistance < 1000000) {
      validReading = true;
    }
  }
  
  // Convert resistance to approximate lux using logarithmic relationship
  float lightIntensity = 0;
  if (validReading && ldrResistance > 0) {
    // Simple logarithmic mapping from resistance to lux
    // This is a rough approximation - calibrate for your specific LDR
    float logR = log10(ldrResistance);
    float logRdark = log10(LDR_DARK_RESISTANCE);
    float logRbright = log10(LDR_BRIGHT_RESISTANCE);
    
    // Linear interpolation in log space
    float luxFactor = (logRdark - logR) / (logRdark - logRbright);
    luxFactor = constrain(luxFactor, 0, 1);
    
    lightIntensity = LUX_DARK + luxFactor * (LUX_BRIGHT - LUX_DARK);
    lightIntensity = constrain(lightIntensity, 0, 2000);
  }
  
  // Debug output
  Serial.printf("Light Sensor - Voltage: %.3fV, LDR: %.1fΩ, Lux: %.1f, Valid: %s\n", 
               voltage, ldrResistance, lightIntensity, validReading ? "YES" : "NO");
  
  // Send response
  StaticJsonDocument<200> doc;
  doc["type"] = "light_reading";
  doc["light_intensity"] = validReading ? lightIntensity : 0;
  doc["voltage"] = voltage;
  doc["raw_adc"] = analogRead(LIGHT_SENSOR_PIN);
  doc["resistance"] = validReading ? ldrResistance : 0;
  doc["valid"] = validReading;
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

// Debug print helper
void debugPrint(String message) {
  if (debugMode) {
    Serial.println("[DEBUG] " + message);
  }
}

// Web server handlers
void handleRoot() {
  if (!handleFileRead("/index.html")) {
    String html = R"rawliteral(
<!DOCTYPE html>
<html>
<head>
    <title>Remote Laboratory v1.1</title>
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css" rel="stylesheet">
</head>
<body>
    <div class="container mt-4">
        <h1>Remote Laboratory v1.1</h1>
        <p>ESP32 IP: )rawliteral" + WiFi.localIP().toString() + R"rawliteral(</p>
        <p>WebSocket Port: 81</p>
        <p>Status: Ready for connections</p>
        <div class="mt-3">
          <h4>Debug Commands:</h4>
          <p>Send JSON command <code>{"command": "debug_adc"}</code> to test ADC readings</p>
        </div>
        <a href="/app.js" class="btn btn-primary">Download App.js</a>
        <a href="/styles.css" class="btn btn-secondary">Download Styles.css</a>
    </div>
</body>
</html>
)rawliteral";
    server.send(200, "text/html", html);
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