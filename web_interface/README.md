# Remote Laboratory - Web Interface

This is the web interface for the Remote Laboratory project, allowing users to connect to an ESP32 device and perform resistor measurements remotely.

## Features

- **Real-time Connection**: Connect to your ESP32 device via WebSocket
- **Resistor Measurement**: Measure unknown resistor values in real-time
- **Data Visualization**: View measurement history in an interactive chart
- **Data Export**: Export measurement data as CSV for further analysis
- **Responsive Design**: Works on desktop and mobile devices

## Prerequisites

- Modern web browser (Chrome, Firefox, Edge, or Safari)
- ESP32 device running the remote laboratory firmware
- Local network connection

## Getting Started

1. **Set up the ESP32**
   - Upload the firmware to your ESP32 device
   - Note the IP address displayed in the serial monitor

2. **Access the Web Interface**
   - Open `index.html` in a web browser
   - Enter the IP address of your ESP32
   - Click "Connect"

3. **Measure Resistors**
   - Connect your resistor to the measurement circuit
   - Click "Measure Resistor" to take a measurement
   - View results in real-time and in the history chart

## File Structure

- `index.html` - Main HTML file
- `styles.css` - Styling for the web interface
- `app.js` - JavaScript for application logic and WebSocket communication

## WebSocket Protocol

The web interface communicates with the ESP32 using a simple JSON-based protocol over WebSocket.

### Commands

**Measure Resistor**
```json
{
  "command": "measure_resistor"
}
```

### Responses

**Resistance Measurement**
```json
{
  "type": "resistance_measurement",
  "resistance": 10000.5,
  "unit": "ohms"
}
```

## Browser Compatibility

- Chrome (latest)
- Firefox (latest)
- Edge (latest)
- Safari (latest)

## License

MIT License - See LICENSE for details.
