# Remote Laboratory - ESP32 Firmware

This firmware runs on the ESP32 microcontroller and provides a WebSocket server for remote resistor measurement.

## Features

- WebSocket server for real-time communication
- Resistor measurement using voltage divider method
- JSON-based command/response protocol
- WiFi connectivity

## Hardware Setup

1. Connect a 10kΩ resistor in series with the unknown resistor to form a voltage divider
2. Connect the junction between the resistors to GPIO34 (ADC1_CH6)
3. Connect the other end to 3.3V and GND respectively

## Configuration

1. Update `ssid` and `password` in `remote_lab.ino` with your WiFi credentials
2. Adjust `KNOWN_RESISTOR` value if using a different value than 10kΩ

## Dependencies

- PlatformIO Core
- ESP32 Arduino Core
- Required libraries (managed by PlatformIO):
  - ArduinoJson
  - WebSockets
  - ESP Async WebServer
  - AsyncTCP

## Building and Uploading

1. Install PlatformIO Core if not already installed:
   ```bash
   pip install -U platformio
   ```

2. Connect your ESP32 board via USB

3. Build and upload the firmware:
   ```bash
   cd firmware
   pio run -t upload
   ```

4. Monitor the serial output:
   ```bash
   pio device monitor
   ```

## Usage

1. After uploading, check the serial monitor for the ESP32's IP address
2. Open the web interface in a browser (to be implemented)
3. The WebSocket server runs on port 81

## Protocol

### Commands

```json
{
  "command": "measure_resistor"
}
```

### Responses

```json
{
  "type": "resistance_measurement",
  "resistance": 10000.5,
  "unit": "ohms"
}
```

## Troubleshooting

- If the ADC readings are noisy, try adding a 0.1μF capacitor between the ADC pin and GND
- Ensure the input voltage doesn't exceed 3.3V
- Check WiFi connectivity if the WebSocket server doesn't start

## License

MIT License - See LICENSE for details.
