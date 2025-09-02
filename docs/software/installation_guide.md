# Installation and Setup Guide

## System Requirements

### Hardware Requirements
- ESP32 development board (ESP32-DevKitC recommended)
- 10kΩ precision resistor (1% tolerance)
- Breadboard and jumper wires
- USB cable for programming
- Computer with USB port

### Software Requirements
- PlatformIO Core or Arduino IDE
- Modern web browser
- Python 3.7+ (for testing scripts)

## Installation Steps

### 1. Development Environment Setup

#### Option A: PlatformIO (Recommended)
```bash
# Install PlatformIO
pip install -U platformio

# Verify installation
pio --version
```

#### Option B: Arduino IDE
1. Download Arduino IDE from arduino.cc
2. Install ESP32 board package
3. Install required libraries manually

### 2. Project Setup

```bash
# Clone or download project
cd /path/to/your/projects
git clone [repository-url] remote-lab
cd remote-lab

# Navigate to firmware directory
cd firmware
```

### 3. Firmware Configuration

1. **Edit WiFi credentials** in `remote_lab.ino`:
```cpp
const char* ssid = "YourActualWiFiName";
const char* password = "YourActualWiFiPassword";
```

2. **Verify pin configuration**:
```cpp
const int RESISTOR_MEASURE_PIN = 34;  // GPIO34
const int KNOWN_RESISTOR = 10000;     // 10kΩ
```

### 4. Hardware Assembly

1. **Connect ESP32 to breadboard**
2. **Wire voltage divider**:
   - 3.3V → 10kΩ resistor → GPIO34
   - GPIO34 → Unknown resistor → GND
3. **Add optional noise filter**:
   - 0.1μF capacitor between GPIO34 and GND

### 5. Firmware Upload

```bash
# Build and upload firmware
pio run -t upload

# Monitor serial output
pio device monitor
```

### 6. Web Interface Setup

#### Option A: Serve from ESP32
- Access via `http://[ESP32_IP_ADDRESS]`

#### Option B: Local Files
- Open `web_interface/index.html` in browser
- Enter ESP32 IP address to connect

## Verification Steps

### 1. Hardware Verification
- [ ] ESP32 powers on (LED indicator)
- [ ] Serial monitor shows WiFi connection
- [ ] IP address displayed
- [ ] Circuit continuity verified

### 2. Software Verification
- [ ] Firmware uploads without errors
- [ ] WebSocket server starts (port 81)
- [ ] HTTP server starts (port 80)
- [ ] Web interface loads correctly

### 3. Communication Verification
- [ ] WebSocket connection establishes
- [ ] Ping command works
- [ ] Measurement command responds
- [ ] Data displays in web interface

## Testing Installation

### Quick Test
```bash
# Test HTTP server
curl http://[ESP32_IP]:80/

# Test with Python script
cd firmware
python test_script.py [ESP32_IP]
```

### Full System Test
1. Open `web_interface/test.html`
2. Enter ESP32 IP address
3. Run all protocol tests
4. Verify all tests pass

## Common Installation Issues

### PlatformIO Issues
**Error**: "Platform espressif32 not found"
```bash
pio platform install espressif32
```

**Error**: "Library not found"
```bash
pio lib install
```

### ESP32 Upload Issues
**Error**: "Failed to connect"
- Check USB cable connection
- Press BOOT button during upload
- Try different USB port

**Error**: "Permission denied"
```bash
# Linux/Mac: Add user to dialout group
sudo usermod -a -G dialout $USER
# Then logout and login again
```

### WiFi Connection Issues
**ESP32 doesn't connect**
- Verify SSID/password spelling
- Check WiFi signal strength
- Ensure 2.4GHz network (ESP32 doesn't support 5GHz)

## Advanced Configuration

### Custom Calibration
1. Measure known resistor with precision multimeter
2. Update `KNOWN_RESISTOR` value in firmware
3. Adjust `RESISTANCE_CORRECTION_FACTOR` in `calibration.h`

### Network Security
1. Change default WiFi credentials
2. Implement authentication if needed
3. Use HTTPS for production deployment

### Performance Tuning
1. Adjust sampling rate in firmware
2. Modify ADC resolution settings
3. Optimize WebSocket message frequency

## Maintenance

### Regular Maintenance
- Check circuit connections monthly
- Verify calibration with known resistors
- Update firmware as needed
- Clean breadboard contacts

### Troubleshooting Tools
- Multimeter for circuit verification
- Serial monitor for debugging
- Browser developer tools for web issues
- Python test script for protocol testing

---

For detailed technical information, see the README.md and individual component documentation.
