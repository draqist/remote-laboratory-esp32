# Remote Laboratory User Manual

## Getting Started

### System Requirements
- Modern web browser (Chrome, Firefox, Edge, Safari)
- ESP32 device with firmware installed
- Local network connection

### First Time Setup

1. **Hardware Assembly**
   - Follow the circuit diagram in `docs/hardware/circuit_diagram.md`
   - Ensure all connections are secure
   - Power on the ESP32

2. **Network Configuration**
   - ESP32 will display its IP address in serial monitor
   - Note this IP address for web interface connection

3. **Web Interface Access**
   - Open `web_interface/index.html` in your browser
   - Or navigate to `http://[ESP32_IP_ADDRESS]` if serving from device

## Using the Web Interface

### Connecting to the Device

1. **Enter Device IP**
   - Input the ESP32's IP address in the connection field
   - Click "Connect" button

2. **Connection Status**
   - Green status: Successfully connected
   - Red status: Connection failed or lost
   - Yellow status: Attempting to connect

### Making Measurements

1. **Insert Test Resistor**
   - Place unknown resistor in the measurement circuit
   - Ensure secure connections

2. **Take Measurement**
   - Click "Measure Resistor" button
   - Wait for measurement to complete (~2 seconds)
   - View result in the measurement display

3. **Interpret Results**
   - Resistance value displayed with appropriate units (Ω, kΩ, MΩ)
   - Quality indicator shows measurement reliability
   - Uncertainty value indicates measurement precision

### Viewing Data

1. **Real-time Display**
   - Current measurement shown prominently
   - Progress bar indicates measurement status

2. **History Chart**
   - Interactive chart shows last 20 measurements
   - Hover over points for detailed information
   - Automatic scaling based on data range

3. **Data Management**
   - Clear history to start fresh
   - Export data as CSV for analysis

## Measurement Guidelines

### Best Practices

1. **Preparation**
   - Verify circuit connections before measuring
   - Allow system to stabilize after power-on
   - Use resistors within the optimal range (1kΩ-100kΩ)

2. **Taking Measurements**
   - Ensure resistor is properly inserted
   - Avoid touching circuit during measurement
   - Take multiple measurements for better accuracy

3. **Data Analysis**
   - Compare with expected values
   - Consider measurement uncertainty
   - Document any anomalies

### Measurement Range

| Range | Accuracy | Notes |
|-------|----------|-------|
| 100Ω - 1kΩ | ±10% | Lower accuracy due to ADC resolution |
| 1kΩ - 10kΩ | ±2% | Optimal measurement range |
| 10kΩ - 100kΩ | ±5% | Good accuracy |
| 100kΩ - 1MΩ | ±10% | Reduced accuracy at high values |

## Troubleshooting

### Connection Issues

**Cannot Connect to Device**
- Verify ESP32 IP address
- Check WiFi network connectivity
- Ensure ESP32 is powered and running
- Try refreshing the web page

**Connection Drops Frequently**
- Check WiFi signal strength
- Verify network stability
- Restart ESP32 if needed

### Measurement Issues

**No Measurement Results**
- Check circuit wiring
- Verify resistor is properly connected
- Ensure 3.3V power supply is stable

**Inaccurate Readings**
- Verify known resistor value (should be 10kΩ ±1%)
- Check for loose connections
- Calibrate with known test resistors

**Noisy or Unstable Readings**
- Add 0.1μF capacitor for filtering
- Check for electromagnetic interference
- Ensure stable power supply

## Advanced Features

### Data Export
- Click "Export Data" to download CSV file
- File contains timestamp and resistance values
- Import into Excel or other analysis software

### Multiple Measurements
- Take several measurements of same resistor
- Calculate average and standard deviation
- Assess measurement repeatability

### Calibration
- Use precision multimeter as reference
- Measure known resistors with both devices
- Apply correction factors if needed

## Safety Information

### Electrical Safety
- Never exceed 3.3V on ESP32 pins
- Disconnect power when modifying circuit
- Use proper grounding techniques

### Equipment Care
- Handle components with anti-static precautions
- Store resistors in organized manner
- Keep workspace clean and organized

## Educational Exercises

### Exercise 1: Basic Measurements
1. Measure 5 different resistor values
2. Compare with color code or marked values
3. Calculate percentage error for each

### Exercise 2: Repeatability Study
1. Measure same resistor 10 times
2. Calculate mean and standard deviation
3. Assess measurement precision

### Exercise 3: Range Analysis
1. Test resistors from 100Ω to 1MΩ
2. Plot accuracy vs. resistance value
3. Identify optimal measurement range

### Exercise 4: Error Analysis
1. Identify sources of measurement error
2. Quantify each error source
3. Propose improvements to reduce error

## Technical Support

### Common Questions

**Q: Why are my measurements inconsistent?**
A: Check connections, use multiple samples, add noise filtering

**Q: Can I measure very small resistances?**
A: System is optimized for 1kΩ-100kΩ range. Very small resistances have higher error

**Q: How do I improve accuracy?**
A: Use precision components, calibrate regularly, take multiple measurements

**Q: Can I add more experiments?**
A: Yes, the system is designed to be extensible for additional measurements

### Getting Help
- Review troubleshooting section
- Check hardware connections
- Verify firmware upload
- Contact technical support if issues persist

---

**Version**: 1.0.0  
**Last Updated**: September 2025  
**Compatibility**: ESP32, Modern web browsers
