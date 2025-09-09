// Calibration constants and functions for resistor measurement
#ifndef CALIBRATION_H
#define CALIBRATION_H

// Calibration constants
const float VOLTAGE_REFERENCE = 3.3;  // ESP32 reference voltage
const float ADC_MAX_VALUE = 4095.0;   // 12-bit ADC maximum value

// Calibration factors (adjust based on actual measurements)
const float VOLTAGE_CORRECTION_FACTOR = 1.0;  // Adjust if reference voltage differs
const float RESISTANCE_CORRECTION_FACTOR = 1.0;  // Adjust based on calibration

// Known test resistor values for calibration (in ohms)
const float CALIBRATION_RESISTORS[] = {1000, 4700, 10000, 22000, 47000};
const int NUM_CALIBRATION_RESISTORS = 5;

// Function to apply calibration correction
float applyCalibratedMeasurement(float rawResistance) {
  return rawResistance * RESISTANCE_CORRECTION_FACTOR;
}

// Function to validate measurement range
bool isValidMeasurement(float resistance) {
  return (resistance >= 50.0 && resistance <= 2000000.0);  // 50Ω to 2MΩ
}

// Function to calculate measurement uncertainty
float calculateUncertainty(float resistance, int numSamples) {
  // Basic uncertainty calculation based on ADC resolution and component tolerances
  float adcUncertainty = (VOLTAGE_REFERENCE / ADC_MAX_VALUE) * 100.0 / resistance;  // %
  float componentUncertainty = 1.0;  // 1% resistor tolerance
  float totalUncertainty = sqrt(pow(adcUncertainty, 2) + pow(componentUncertainty, 2));
  
  return totalUncertainty;
}

#endif
