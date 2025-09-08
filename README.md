# Remote Laboratory Multi-Experiment System

A comprehensive ESP32-based remote laboratory platform for electrical engineering education, enabling students to perform multiple experiments remotely via an interactive web interface. This system supports resistor measurement, LED PWM control, temperature sensing, light measurement, and logic gate simulation.

## 🎯 Project Overview

This remote laboratory system provides:
- **Five Interactive Experiments**: Resistor measurement, LED PWM control, temperature sensing, light measurement, and logic gate simulation
- **Real-time Data Collection** using ESP32 ADC and digital I/O
- **Modern Web Interface** with responsive design and experiment navigation
- **WebSocket Communication** for instant bidirectional data updates
- **Interactive Visualizations** with Chart.js for all experiments
- **Data Export** and measurement history for analysis
- **Educational Value** covering fundamental EE concepts

## 🏗️ System Architecture

```
┌─────────────────┐    WebSocket    ┌─────────────────┐
│   Web Browser   │ ←──────────────→ │     ESP32       │
│                 │    Port 81      │                 │
│  - HTML/CSS/JS  │                 │  - WiFi Module  │
│  - Chart.js     │    HTTP         │  - ADC          │
│  - Bootstrap    │ ←──────────────→ │  - WebSocket    │
└─────────────────┘    Port 80      └─────────────────┘
                                            │
                                            │ GPIO34
                                            ▼
                                    ┌─────────────────┐
                                    │ Voltage Divider │
                                    │   R1 = 10kΩ     │
                                    │   R2 = Unknown  │
                                    └─────────────────┘
```

## 📁 Project Structure

```
remote-lab/
├── firmware/                 # ESP32 firmware
│   ├── remote_lab.ino       # Main firmware file
│   ├── calibration.h        # Calibration functions
│   ├── platformio.ini       # PlatformIO configuration
│   ├── test_script.py       # Python test script
│   └── README.md           # Firmware documentation
├── web_interface/           # Web application
│   ├── index.html          # Main web interface
│   ├── app.js              # JavaScript application logic
│   ├── styles.css          # Custom styling
│   ├── test.html           # Protocol testing page
│   └── README.md           # Web interface documentation
└── docs/                   # Documentation
    ├── hardware/           # Hardware documentation
    │   ├── circuit_diagram.md
    │   └── experiment_guide.md
    └── software/           # Software documentation
        └── testing_guide.md
```

## 🚀 Quick Start Guide

### Prerequisites
- ESP32 development board
- 10kΩ precision resistor (1% tolerance)
- Breadboard and jumper wires
- Test resistors (various values)
- Computer with web browser

### Step 1: Hardware Setup
1. **Assemble the voltage divider circuit**:
   ```
   3.3V → 10kΩ → GPIO34 → Unknown Resistor → GND
   ```
2. **Connect ESP32 to computer via USB**
3. **Verify circuit with multimeter**

### Step 2: Firmware Upload
1. **Install PlatformIO**:
   ```bash
   pip install -U platformio
   ```

2. **Navigate to firmware directory**:
   ```bash
   cd remote-lab/firmware
   ```

3. **Update WiFi credentials** in `remote_lab.ino`:
   ```cpp
   const char* ssid = "YourWiFiSSID";
   const char* password = "YourWiFiPassword";
   ```

4. **Build and upload**:
   ```bash
   pio run -t upload
   pio device monitor
   ```

5. **Note the IP address** displayed in serial monitor

### Step 3: Web Interface Access
1. **Open web browser**
2. **Navigate to**: `http://[ESP32_IP_ADDRESS]`
3. **Or open**: `web_interface/index.html` locally
4. **Enter ESP32 IP** and click "Connect"
5. **Start measuring** resistors!

## 🔧 Hardware Components

### Required Components
| Component | Specification | Quantity | Purpose |
|-----------|---------------|----------|---------|
| ESP32 Dev Board | ESP32-DevKitC | 1 | Main controller |
| Precision Resistor | 10kΩ ±1% | 1 | Known reference |
| Breadboard | Half-size | 1 | Circuit assembly |
| Jumper Wires | M-M | 5 | Connections |
| Test Resistors | Various values | 5-10 | Measurement targets |

### Optional Components
| Component | Specification | Purpose |
|-----------|---------------|---------|
| Capacitor | 0.1μF ceramic | Noise filtering |
| Terminal Blocks | 2-pin | Secure connections |

### 🎯 Educational Features
- **Statistical Analysis** - Multi-sampling with uncertainty calculations
- **Quality Assessment** - Measurement reliability indicators
- **Truth Table Generation** - Automatic logic gate truth tables
- **Calibration Support** - Built-in calibration for improved accuracy
- **Error Handling** - Comprehensive validation and user feedback

## 📊 Measurement Specifications

| Parameter | Value | Notes |
|-----------|-------|-------|
| **Measurement Range** | 100Ω - 1MΩ | Optimal: 1kΩ-100kΩ |
| **Accuracy** | ±5% typical | ±2% in optimal range |
| **Resolution** | ~0.8Ω @ 1kΩ | Limited by 12-bit ADC |
| **Response Time** | <2 seconds | Including 20 samples |
| **Sampling Rate** | 20 samples/measurement | Configurable |

## 🧪 Experiment Procedures

### Basic Measurement
1. Insert test resistor in circuit
2. Click "Measure Resistor"
3. Record displayed value
4. Compare with expected value

### Accuracy Testing
1. Use precision multimeter as reference
2. Measure same resistor with both devices
3. Calculate percentage error
4. Analyze sources of error

### Range Testing
1. Test various resistor values
2. Identify optimal measurement range
3. Document accuracy vs. resistance value

## 🔍 Troubleshooting

### Common Issues

**No WiFi Connection**
- Check SSID/password in firmware
- Verify WiFi signal strength
- Try different network

**WebSocket Connection Failed**
- Verify ESP32 IP address
- Check firewall settings
- Ensure port 81 is accessible

**Inaccurate Measurements**
- Verify circuit wiring
- Check known resistor value
- Calibrate with precision multimeter

**No Measurements**
- Check GPIO34 connection
- Verify 3.3V supply
- Test with known resistor

## 📚 Educational Applications

### Learning Objectives
- **Voltage divider analysis**
- **ADC operation principles**
- **Measurement uncertainty**
- **Remote instrumentation**
- **Web-based control systems**

### Curriculum Integration
- **Circuit Analysis** courses
- **Instrumentation** labs
- **Embedded Systems** projects
- **Web Development** with hardware

## 🛠️ Development and Customization

### Adding New Experiments
1. Extend firmware with new measurement functions
2. Add corresponding web interface controls
3. Update communication protocol
4. Test and validate new functionality

### Hardware Modifications
- Add more ADC channels for multiple measurements
- Integrate additional sensors (temperature, humidity)
- Implement relay control for switching circuits
- Add camera module for visual feedback

## 📄 License

MIT License - See LICENSE file for details

## 👥 Contributors

- **Student Name** - BSc Electronic and Electrical Engineering
- **Supervisor** - [Supervisor Name]
- **Institution** - [University Name]

## 📞 Support

For technical support or questions:
- Check the troubleshooting guide
- Review the testing documentation
- Contact project supervisor

---

**Project Status**: ✅ Complete and ready for testing
