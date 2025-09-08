# Multi-Experiment Hardware Setup Guide

This guide provides step-by-step instructions for setting up all five experiments in the remote laboratory system.

## Overview

The remote laboratory supports five different experiments:
1. **Resistor Measurement** - Voltage divider circuit analysis
2. **LED PWM Control** - Pulse Width Modulation brightness control
3. **Temperature Sensing** - LM35 temperature sensor reading
4. **Light Measurement** - LDR light intensity detection
5. **Logic Gate Simulation** - Digital logic operations

## Complete Parts List

### Essential Components
- **1x ESP32 Development Board** (ESP32-WROOM-32 or similar)
- **1x Full-size Breadboard** (830 tie points)
- **1x Set of Jumper Wires** (Male-to-Male, various colors)
- **1x USB Cable** (for ESP32 programming and power)

### Resistor Measurement Experiment
- **1x 10kΩ Precision Resistor** (1% tolerance, known resistor)
- **Test Resistors**: 1kΩ, 4.7kΩ, 22kΩ, 47kΩ, 100kΩ (for testing)

### LED PWM Control Experiment
- **1x LED** (any color, 5mm or 3mm)
- **1x 220Ω Resistor** (current limiting)

### Temperature Sensing Experiment
- **1x LM35 Temperature Sensor** (TO-92 package)
- **1x 0.1µF Ceramic Capacitor** (optional, for noise filtering)

### Light Measurement Experiment
- **1x LDR (Light Dependent Resistor)** (5-10kΩ in daylight)
- **1x 10kΩ Resistor** (pull-down resistor)

### Logic Gate Simulation Experiment
- **2x Push Button Switches** (momentary or toggle)
- **1x LED** (for output indication)
- **1x 220Ω Resistor** (for output LED)

## Step-by-Step Assembly

### Step 1: ESP32 Placement
1. Place the ESP32 development board on the breadboard
2. Ensure the board spans across the center gap
3. Connect power rails: 3.3V to positive rail, GND to negative rail

### Step 2: Resistor Measurement Circuit
```
Breadboard Layout:
Row 1: 3.3V --- 10kΩ --- Junction (GPIO34) --- Unknown R --- GND
```

**Connections:**
1. Connect 3.3V to one end of the 10kΩ resistor
2. Connect the other end of 10kΩ resistor to GPIO34 and one end of unknown resistor
3. Connect the other end of unknown resistor to GND

### Step 3: LED PWM Control Circuit
```
Breadboard Layout:
GPIO2 --- 220Ω --- LED Anode --- LED Cathode --- GND
```

**Connections:**
1. Connect GPIO2 to one end of 220Ω resistor
2. Connect other end of resistor to LED anode (longer leg)
3. Connect LED cathode (shorter leg) to GND

### Step 4: Temperature Sensor Circuit
```
Breadboard Layout:
3.3V --- LM35 Pin 1 (Vs)
GPIO35 --- LM35 Pin 2 (Vout)
GND --- LM35 Pin 3 (GND)
```

**Connections (LM35 flat side facing you):**
1. Left pin (Vs) to 3.3V
2. Middle pin (Vout) to GPIO35
3. Right pin (GND) to GND
4. Optional: 0.1µF capacitor between Vout and GND

### Step 5: Light Sensor Circuit
```
Breadboard Layout:
3.3V --- LDR --- Junction (GPIO32) --- 10kΩ --- GND
```

**Connections:**
1. Connect 3.3V to one terminal of LDR
2. Connect other terminal of LDR to GPIO32 and one end of 10kΩ resistor
3. Connect other end of 10kΩ resistor to GND

### Step 6: Logic Gate Simulation Circuit
```
Breadboard Layout:
Switch A: 3.3V --- Switch --- GPIO25 (internal pull-up)
Switch B: 3.3V --- Switch --- GPIO26 (internal pull-up)
Output: GPIO27 --- 220Ω --- LED --- GND
```

**Connections:**
1. Connect one terminal of Switch A to 3.3V, other to GPIO25
2. Connect one terminal of Switch B to 3.3V, other to GPIO26
3. Connect GPIO27 to 220Ω resistor, then to LED anode
4. Connect LED cathode to GND

## Complete Wiring Diagram

```
ESP32 Pin Layout:
                    ESP32
                 ┌─────────┐
            3.3V │1      30│ GPIO21
             GND │2      29│ GPIO19
            GPIO4│3      28│ GPIO18
            GPIO2│4      27│ GPIO5     ← LED PWM
            GPIO15│5     26│ GPIO17
            GPIO13│6     25│ GPIO16
            GPIO12│7     24│ GPIO4
            GPIO14│8     23│ GPIO0
            GPIO27│9     22│ GPIO2     ← Logic Output LED
            GPIO26│10    21│ GPIO15    ← Logic Input B
            GPIO25│11    20│ GPIO13    ← Logic Input A
            GPIO33│12    19│ GPIO12
            GPIO32│13    18│ GPIO14    ← Light Sensor
            GPIO35│14    17│ GPIO27    ← Temperature Sensor
            GPIO34│15    16│ GPIO26    ← Resistor Measurement
                 └─────────┘
```

## Pin Assignment Summary

| GPIO Pin | Function | Experiment | Component |
|----------|----------|------------|-----------|
| GPIO2 | PWM Output | LED Control | LED (via 220Ω) |
| GPIO25 | Digital Input | Logic Gates | Switch A |
| GPIO26 | Digital Input | Logic Gates | Switch B |
| GPIO27 | Digital Output | Logic Gates | Output LED |
| GPIO32 | ADC Input | Light Sensor | LDR voltage divider |
| GPIO34 | ADC Input | Resistor Measurement | Voltage divider junction |
| GPIO35 | ADC Input | Temperature | LM35 output |

## Power Requirements

- **ESP32**: 3.3V, ~240mA (typical)
- **LEDs**: ~20mA each (with 220Ω resistors)
- **LM35**: ~60µA (negligible)
- **Total**: <300mA (can be powered via USB)

## Safety Considerations

1. **Voltage Levels**: All circuits operate at 3.3V - safe for handling
2. **Current Limiting**: All LEDs have appropriate current limiting resistors
3. **ESD Protection**: Handle ESP32 with care to avoid static damage
4. **Connections**: Ensure all connections are secure before powering on

## Testing Each Circuit

### 1. Power Test
- Connect ESP32 via USB
- Verify 3.3V on power rails with multimeter
- Check for any short circuits

### 2. Individual Circuit Tests
- **Resistor**: Measure voltage at GPIO34 with multimeter
- **LED**: Should light up when controlled via web interface
- **Temperature**: LM35 output should be ~10mV per °C
- **Light**: LDR resistance should change with light level
- **Logic**: Switches should register on web interface

### 3. System Integration Test
- Upload firmware to ESP32
- Connect to WiFi network
- Access web interface
- Test each experiment individually

## Troubleshooting

### Common Issues

**ESP32 Not Connecting to WiFi:**
- Check WiFi credentials in firmware
- Verify network is 2.4GHz (ESP32 doesn't support 5GHz)
- Check serial monitor for connection status

**Inaccurate Measurements:**
- Verify all connections are secure
- Check component values with multimeter
- Ensure proper grounding

**Web Interface Not Loading:**
- Check ESP32 IP address in serial monitor
- Verify ESP32 and computer are on same network
- Try different web browser

**Experiments Not Responding:**
- Check WebSocket connection status
- Verify GPIO pin assignments match firmware
- Test with multi_experiment_test.py script

## Calibration

### Resistor Measurement
- Use precision multimeter to measure known resistor
- Adjust VOLTAGE_CORRECTION_FACTOR in calibration.h if needed

### Temperature Sensor
- Compare readings with calibrated thermometer
- LM35 should read ~10mV per °C at room temperature

### Light Sensor
- Calibrate against known light sources
- Adjust conversion formula in firmware if needed

## Maintenance

1. **Regular Checks**: Verify all connections monthly
2. **Component Testing**: Test individual components if readings seem off
3. **Firmware Updates**: Keep firmware updated for bug fixes
4. **Documentation**: Record any modifications or calibrations

## Educational Extensions

### Advanced Experiments
1. **PID Control**: Use temperature sensor for feedback control
2. **Data Logging**: Store measurements over time
3. **Wireless Sensors**: Add multiple sensor nodes
4. **Machine Learning**: Pattern recognition in sensor data

### Learning Objectives
- **Circuit Analysis**: Voltage dividers, Ohm's law
- **Digital Systems**: Logic gates, truth tables
- **Sensors**: Transduction principles, calibration
- **Programming**: Embedded systems, web interfaces
- **Communication**: WebSocket protocols, JSON data

This setup provides a comprehensive platform for learning fundamental electrical and electronic engineering concepts through hands-on experimentation.
