# Resistor Measurement Experiment Guide

## Experiment Objectives

1. **Understand voltage divider principles**
2. **Apply Ohm's Law in practical measurements**
3. **Analyze measurement accuracy and error sources**
4. **Compare theoretical vs. measured values**

## Pre-Experiment Setup

### Hardware Assembly
1. Connect ESP32 to breadboard
2. Wire voltage divider circuit as per circuit diagram
3. Verify all connections with multimeter
4. Power on ESP32 and note IP address

### Software Setup
1. Upload firmware to ESP32
2. Open web interface in browser
3. Connect to ESP32 using IP address
4. Verify WebSocket connection

## Experiment Procedures

### Procedure 1: Basic Resistance Measurement

**Objective**: Measure known resistor values and compare with expected values

**Steps**:
1. Insert 1kΩ resistor as R2 in circuit
2. Click "Measure Resistor" in web interface
3. Record measured value
4. Repeat with 4.7kΩ, 10kΩ, 22kΩ, 47kΩ, 100kΩ
5. Calculate percentage error for each measurement

**Expected Results**:
- Measurements within ±5% of nominal values
- Better accuracy in 1kΩ-47kΩ range

### Procedure 2: Measurement Repeatability

**Objective**: Analyze measurement consistency and precision

**Steps**:
1. Use 10kΩ test resistor
2. Take 10 consecutive measurements
3. Calculate mean, standard deviation, and coefficient of variation
4. Analyze measurement stability

**Data Analysis**:
- Mean resistance value
- Standard deviation (should be <2% of mean)
- Coefficient of variation (CV = σ/μ × 100%)

### Procedure 3: Range Testing

**Objective**: Determine measurement limits and optimal range

**Steps**:
1. Test very low resistance (100Ω, 220Ω, 470Ω)
2. Test very high resistance (220kΩ, 470kΩ, 1MΩ)
3. Identify range where accuracy degrades
4. Document measurement limitations

## Data Collection Template

### Single Measurement Record
```
Date: ___________
Time: ___________
Nominal Resistance: _____ Ω
Measured Resistance: _____ Ω
Percentage Error: _____ %
Number of Valid Samples: _____
Notes: _________________
```

### Repeatability Test Record
```
Test Resistor: _____ Ω
Number of Measurements: 10

Measurement 1: _____ Ω
Measurement 2: _____ Ω
...
Measurement 10: _____ Ω

Mean: _____ Ω
Standard Deviation: _____ Ω
Coefficient of Variation: _____ %
```

## Error Analysis

### Theoretical Error Sources
1. **ADC Quantization Error**: ±0.8mV (3.3V/4096)
2. **Reference Voltage Tolerance**: ±5% (±165mV)
3. **Known Resistor Tolerance**: ±1% (±100Ω for 10kΩ)
4. **Temperature Coefficient**: ±100ppm/°C

### Error Propagation Formula
```
δR/R = √[(δV₁/V₁)² + (δV₂/V₂)² + (δR₁/R₁)²]
```

Where:
- δR/R = Relative error in measured resistance
- δV₁, δV₂ = Voltage measurement errors
- δR₁ = Known resistor tolerance

## Calibration Procedures

### Single-Point Calibration
1. Measure known 10kΩ precision resistor
2. Calculate correction factor: CF = R_actual / R_measured
3. Apply correction factor to all measurements

### Multi-Point Calibration
1. Measure 5 different known resistors
2. Create calibration curve (linear regression)
3. Apply curve correction to measurements

## Safety Protocols

### Electrical Safety
- **Voltage Check**: Verify 3.3V supply before connecting circuit
- **Polarity Check**: Ensure correct GND and VCC connections
- **Isolation**: Disconnect power when modifying circuit

### Equipment Safety
- **ESD Protection**: Use anti-static wrist strap
- **Component Handling**: Avoid touching component leads
- **Storage**: Store components in anti-static bags

## Troubleshooting Guide

### Problem: No Readings
- Check WiFi connection
- Verify ESP32 power
- Check circuit continuity

### Problem: Inaccurate Readings
- Verify known resistor value
- Check for loose connections
- Calibrate with known values

### Problem: Noisy Readings
- Add 0.1μF filter capacitor
- Check for electromagnetic interference
- Ensure stable power supply

## Educational Outcomes

Students will learn:
1. **Voltage divider analysis**
2. **ADC operation and limitations**
3. **Measurement uncertainty and error analysis**
4. **Remote instrumentation concepts**
5. **Digital communication protocols**
