# Testing and Validation Guide

## System Testing Checklist

### Hardware Tests
- [ ] ESP32 powers on and connects to WiFi
- [ ] ADC reads voltage correctly (test with known voltages)
- [ ] Voltage divider circuit assembled correctly
- [ ] All connections secure and properly wired

### Firmware Tests
- [ ] Serial monitor shows IP address after WiFi connection
- [ ] WebSocket server starts on port 81
- [ ] HTTP server starts on port 80
- [ ] ADC sampling works (check serial output)
- [ ] JSON responses formatted correctly

### Web Interface Tests
- [ ] HTML page loads correctly
- [ ] WebSocket connection establishes
- [ ] Measurement button triggers firmware
- [ ] Real-time data updates in interface
- [ ] Chart displays measurement history
- [ ] Data export functionality works

### Communication Protocol Tests
- [ ] Ping/pong commands work
- [ ] Error handling for invalid commands
- [ ] JSON parsing works both ways
- [ ] Connection recovery after network issues

## Test Procedures

### 1. Basic Connectivity Test
```bash
# Test if ESP32 is accessible
ping [ESP32_IP_ADDRESS]

# Test HTTP server
curl http://[ESP32_IP_ADDRESS]/

# Test WebSocket (using websocat if available)
echo '{"command":"ping"}' | websocat ws://[ESP32_IP_ADDRESS]:81
```

### 2. Resistor Measurement Validation
1. Use precision multimeter to measure test resistors
2. Compare multimeter readings with system measurements
3. Calculate percentage error for each measurement
4. Verify measurements are within ±5% tolerance

### 3. Stress Testing
- Multiple simultaneous connections
- Rapid measurement requests
- Network disconnection/reconnection
- Power cycle recovery

## Expected Performance Metrics

| Metric | Target | Acceptable |
|--------|--------|------------|
| Measurement Accuracy | ±2% | ±5% |
| Response Time | <2 seconds | <5 seconds |
| Connection Stability | >99% uptime | >95% uptime |
| Valid Sample Rate | >90% | >75% |

## Troubleshooting Common Issues

### WiFi Connection Issues
- Verify SSID/password in firmware
- Check signal strength
- Try different WiFi channels

### Measurement Issues
- Check circuit wiring
- Verify component values
- Test with known resistors

### Web Interface Issues
- Clear browser cache
- Check browser console for errors
- Verify WebSocket connection
