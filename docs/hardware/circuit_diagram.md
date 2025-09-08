# Circuit Diagrams and Hardware Setup

This document provides detailed information about the hardware circuit designs for all remote laboratory experiments including resistor measurement, LED PWM control, temperature sensing, light measurement, and logic gate simulation.

## 1. Resistor Measurement Circuit

The resistor measurement experiment uses a voltage divider circuit to determine unknown resistance values.

### Circuit Diagram

```
    3.3V
     |
     R1 (10kΩ - Known Resistor)
     |
     +---- GPIO34 (ADC Input)
     |
     R2 (Unknown Resistor)
     |
    GND
```

### Components Required
- 10kΩ Resistor (R1 - Known resistor)
- Unknown resistor to be measured (R2)
- Breadboard and jumper wires

### Pin Connections
| Component | ESP32 Pin | Description |
|-----------|-----------|-------------|
| R1 (10kΩ) | 3.3V | Positive supply |
| Junction | GPIO34 | ADC input for voltage measurement |
| R2 (Unknown) | GND | Ground connection |

## Component Specifications

### Required Components
- **ESP32 Development Board**
- **1x 10kΩ Precision Resistor (1% tolerance)** - R1 (Known resistor)
- **1x Breadboard**
- **Jumper wires** (Male-to-Male)
- **Test resistors** (Various values: 1kΩ, 4.7kΩ, 22kΩ, 47kΩ, 100kΩ)

### Optional Components for Enhanced Accuracy
- **0.1μF Ceramic Capacitor** (for ADC noise filtering)
- **MCP3008 10-bit ADC** (for higher precision)
- **Terminal blocks** (for secure connections)

## Wiring Instructions

1. **Power Connections**
   - Connect ESP32 3.3V pin to breadboard positive rail
   - Connect ESP32 GND pin to breadboard negative rail

2. **Voltage Divider Setup**
   - Place 10kΩ resistor (R1) between 3.3V and a junction point
   - Connect junction point to ESP32 GPIO34 (ADC1_CH6)
   - Place unknown resistor (R2) between junction point and GND

3. **Optional Noise Filter**
   - Connect 0.1μF capacitor between GPIO34 and GND

## Measurement Theory

### Voltage Divider Formula
```
Vout = Vin × (R2 / (R1 + R2))
```

### Solving for Unknown Resistor (R2)
```
R2 = (R1 × Vout) / (Vin - Vout)
```

Where:
- **Vin** = 3.3V (ESP32 supply voltage)
- **Vout** = Measured voltage at GPIO34
- **R1** = 10kΩ (known resistor)
- **R2** = Unknown resistor value

### Measurement Range
- **Minimum**: ~100Ω (limited by ADC resolution)
- **Maximum**: ~1MΩ (limited by input impedance)
- **Optimal range**: 1kΩ to 100kΩ

## Accuracy Considerations

### Sources of Error
1. **ADC Resolution**: ESP32 has 12-bit ADC (4096 levels)
2. **Reference Voltage**: 3.3V may vary ±5%
3. **Component Tolerance**: 1% resistor tolerance
4. **Temperature Effects**: Resistance changes with temperature
5. **Noise**: Electrical interference

### Accuracy Improvements
1. **Multiple Sampling**: Take 20 samples and average
2. **Voltage Validation**: Reject readings outside valid range
3. **Calibration**: Use known test resistors for calibration
4. **Filtering**: Add capacitive filtering for noise reduction

## Safety Considerations

- **Voltage Limits**: Never exceed 3.3V on GPIO34
- **Current Limits**: Keep current below 12mA per GPIO pin
- **ESD Protection**: Use anti-static precautions when handling components
- **Power Supply**: Use stable 3.3V supply for accurate measurements

## Expected Results

| Test Resistor | Expected Reading | Tolerance |
|---------------|------------------|-----------|
| 1kΩ          | 1000Ω ± 50Ω     | ±5%       |
| 4.7kΩ        | 4700Ω ± 235Ω    | ±5%       |
| 10kΩ         | 10000Ω ± 500Ω   | ±5%       |
| 22kΩ         | 22000Ω ± 1100Ω  | ±5%       |
| 47kΩ         | 47000Ω ± 2350Ω  | ±5%       |
| 100kΩ        | 100000Ω ± 5000Ω | ±5%       |

## Troubleshooting

### Common Issues
1. **Readings always 0**: Check GND connection
2. **Readings always max**: Check 3.3V connection or R1
3. **Noisy readings**: Add 0.1μF capacitor for filtering
4. **Inaccurate readings**: Verify R1 value with multimeter

### Calibration Procedure
1. Measure R1 (10kΩ) with precision multimeter
2. Update `KNOWN_RESISTOR` value in firmware
3. Test with known resistor values
4. Apply correction factors if needed
