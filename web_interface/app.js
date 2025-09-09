// // Global variables
// let socket = null;
// let isConnected = false;
// let currentExperiment = 'resistor';
// let experimentData = {
//     resistor: [],
//     temperature: [],
//     light: [],
//     pwm: []
// };
// let charts = {};
// let temperatureMonitoring = false;
// let monitoringInterval = null;

// // DOM Elements - Common
// let connectBtn, deviceIpInput, connectionStatus, connectionIndicator;

// // Experiment-specific DOM elements
// let measureResistorBtn, brightnessSlider, readTempBtn, readLightBtn;
// let resistanceValue, temperatureValue, lightValue;

// // Initialize the application
// document.addEventListener('DOMContentLoaded', () => {
//     console.log('DOM Content Loaded - Initializing application...');
    
//     // Initialize DOM elements
//     initializeDOMElements();
    
//     // Initialize charts for all experiments
//     initializeCharts();
    
//     // Load saved device IP if available
//     const savedIp = localStorage.getItem('deviceIp');
//     if (savedIp) {
//         deviceIpInput.value = savedIp;
//     }
    
//     // Load saved experiment data
//     loadExperimentData();
    
//     // Set up event listeners
//     setupEventListeners();
    
//     // Initialize experiment navigation
//     setupExperimentNavigation();
    
//     // Initialize logic gates
//     initializeLogicGates();
    
//     console.log('Application initialized successfully');
// });

// function initializeDOMElements() {
//     // Common elements
//     connectBtn = document.getElementById('connect-btn');
//     deviceIpInput = document.getElementById('device-ip');
//     connectionStatus = document.getElementById('connection-status');
//     connectionIndicator = document.getElementById('connection-indicator');
    
//     // Experiment-specific elements
//     measureResistorBtn = document.getElementById('measure-resistor-btn');
//     brightnessSlider = document.getElementById('brightness-slider');
//     readTempBtn = document.getElementById('read-temperature-btn');
//     readLightBtn = document.getElementById('read-light-btn');
    
//     // Display elements
//     resistanceValue = document.getElementById('resistance-value');
//     temperatureValue = document.getElementById('temperature-value');
//     lightValue = document.getElementById('light-value');
    
//     console.log('DOM elements initialized');
// }

// function setupEventListeners() {
//     console.log('Setting up event listeners...');
    
//     // Connection controls
//     if (connectBtn) {
//         connectBtn.addEventListener('click', toggleConnection);
//     }
    
//     const testConnectionBtn = document.getElementById('test-connection-btn');
//     if (testConnectionBtn) {
//         testConnectionBtn.addEventListener('click', testConnection);
//     }
    
//     // Handle Enter key in IP input
//     if (deviceIpInput) {
//         deviceIpInput.addEventListener('keypress', (e) => {
//             if (e.key === 'Enter') {
//                 toggleConnection();
//             }
//         });
//     }
    
//     // Resistor experiment
//     if (measureResistorBtn) {
//         measureResistorBtn.addEventListener('click', () => {
//             console.log('Measure resistor button clicked');
//             sendCommand('measure_resistor');
//         });
//     }
    
//     // LED PWM experiment
//     if (brightnessSlider) {
//         brightnessSlider.addEventListener('input', updateBrightness);
//     }
    
//     const ledOnBtn = document.getElementById('led-on-btn');
//     const ledOffBtn = document.getElementById('led-off-btn');
//     if (ledOnBtn) {
//         ledOnBtn.addEventListener('click', () => setLED(100));
//     }
//     if (ledOffBtn) {
//         ledOffBtn.addEventListener('click', () => setLED(0));
//     }
    
//     // Temperature experiment
//     if (readTempBtn) {
//         readTempBtn.addEventListener('click', () => {
//             console.log('Read temperature button clicked');
//             sendCommand('read_temperature');
//         });
//     }
    
//     const startMonitoringBtn = document.getElementById('start-monitoring-btn');
//     const stopMonitoringBtn = document.getElementById('stop-monitoring-btn');
//     if (startMonitoringBtn) {
//         startMonitoringBtn.addEventListener('click', startTemperatureMonitoring);
//     }
//     if (stopMonitoringBtn) {
//         stopMonitoringBtn.addEventListener('click', stopTemperatureMonitoring);
//     }
    
//     // Light sensor experiment
//     if (readLightBtn) {
//         readLightBtn.addEventListener('click', () => {
//             console.log('Read light button clicked');
//             sendCommand('read_light');
//         });
//     }
    
//     // Logic gates experiment
//     const gateType = document.getElementById('gate-type');
//     const inputA = document.getElementById('input-a');
//     const inputB = document.getElementById('input-b');
    
//     if (gateType) {
//         gateType.addEventListener('change', updateLogicGate);
//     }
//     if (inputA) {
//         inputA.addEventListener('change', updateLogicGate);
//     }
//     if (inputB) {
//         inputB.addEventListener('change', updateLogicGate);
//     }
    
//     // Clear history buttons
//     const clearButtons = {
//         'clear-resistor-history': () => clearExperimentData('resistor'),
//         'clear-temp-history': () => clearExperimentData('temperature'),
//         'clear-light-history': () => clearExperimentData('light')
//     };
    
//     Object.keys(clearButtons).forEach(btnId => {
//         const btn = document.getElementById(btnId);
//         if (btn) {
//             btn.addEventListener('click', clearButtons[btnId]);
//         }
//     });
    
//     // Export buttons
//     const exportButtons = {
//         'export-resistor-data': () => exportExperimentData('resistor'),
//         'export-temp-data': () => exportExperimentData('temperature'),
//         'export-light-data': () => exportExperimentData('light')
//     };
    
//     Object.keys(exportButtons).forEach(btnId => {
//         const btn = document.getElementById(btnId);
//         if (btn) {
//             btn.addEventListener('click', exportButtons[btnId]);
//         }
//     });
    
//     console.log('Event listeners set up');
// }

// function setupExperimentNavigation() {
//     console.log('Setting up experiment navigation...');
    
//     const navLinks = document.querySelectorAll('[data-experiment]');
//     const experimentPanels = document.querySelectorAll('.experiment-panel');
    
//     navLinks.forEach(link => {
//         link.addEventListener('click', (e) => {
//             e.preventDefault();
//             const experiment = link.getAttribute('data-experiment');
            
//             // Update navigation
//             navLinks.forEach(l => l.classList.remove('active'));
//             link.classList.add('active');
            
//             // Update panels
//             experimentPanels.forEach(panel => panel.classList.remove('active'));
//             const targetPanel = document.getElementById(`${experiment}-experiment`);
//             if (targetPanel) {
//                 targetPanel.classList.add('active');
//                 currentExperiment = experiment;
//             }
            
//             console.log(`Switched to ${experiment} experiment`);
//         });
//     });
// }

// function initializeCharts() {
//     console.log('Initializing charts...');
    
//     // Initialize resistor chart
//     const resistorCtx = document.getElementById('resistor-chart');
//     if (resistorCtx) {
//         charts.resistor = new Chart(resistorCtx.getContext('2d'), {
//             type: 'line',
//             data: {
//                 labels: [],
//                 datasets: [{
//                     label: 'Resistance (Ω)',
//                     data: [],
//                     borderColor: 'rgb(75, 192, 192)',
//                     backgroundColor: 'rgba(75, 192, 192, 0.2)',
//                     tension: 0.1
//                 }]
//             },
//             options: getChartOptions('Resistance (Ω)')
//         });
//     }
    
//     // Initialize temperature chart
//     const temperatureCtx = document.getElementById('temperature-chart');
//     if (temperatureCtx) {
//         charts.temperature = new Chart(temperatureCtx.getContext('2d'), {
//             type: 'line',
//             data: {
//                 labels: [],
//                 datasets: [{
//                     label: 'Temperature (°C)',
//                     data: [],
//                     borderColor: 'rgb(255, 99, 132)',
//                     backgroundColor: 'rgba(255, 99, 132, 0.2)',
//                     tension: 0.1
//                 }]
//             },
//             options: getChartOptions('Temperature (°C)')
//         });
//     }
    
//     // Initialize light chart
//     const lightCtx = document.getElementById('light-chart');
//     if (lightCtx) {
//         charts.light = new Chart(lightCtx.getContext('2d'), {
//             type: 'line',
//             data: {
//                 labels: [],
//                 datasets: [{
//                     label: 'Light Intensity (lux)',
//                     data: [],
//                     borderColor: 'rgb(255, 205, 86)',
//                     backgroundColor: 'rgba(255, 205, 86, 0.2)',
//                     tension: 0.1
//                 }]
//             },
//             options: getChartOptions('Light Intensity (lux)')
//         });
//     }
    
//     // Initialize PWM chart
//     const pwmCtx = document.getElementById('pwm-chart');
//     if (pwmCtx) {
//         charts.pwm = new Chart(pwmCtx.getContext('2d'), {
//             type: 'line',
//             data: {
//                 labels: [],
//                 datasets: [{
//                     label: 'PWM Duty Cycle (%)',
//                     data: [],
//                     borderColor: 'rgb(54, 162, 235)',
//                     backgroundColor: 'rgba(54, 162, 235, 0.2)',
//                     tension: 0.1
//                 }]
//             },
//             options: getChartOptions('PWM Duty Cycle (%)')
//         });
//     }
    
//     console.log('Charts initialized');
// }

// function getChartOptions(yAxisLabel) {
//     return {
//         responsive: true,
//         maintainAspectRatio: false,
//         scales: {
//             y: {
//                 beginAtZero: true,
//                 title: {
//                     display: true,
//                     text: yAxisLabel
//                 }
//             },
//             x: {
//                 title: {
//                     display: true,
//                     text: 'Time'
//                 }
//             }
//         },
//         plugins: {
//             legend: {
//                 display: true,
//                 position: 'top',
//             }
//         }
//     };
// }

// function initializeLogicGates() {
//     console.log('Initializing logic gates...');
//     updateTruthTable('AND'); // Initialize with AND gate
// }

// function toggleConnection() {
//     if (isConnected) {
//         disconnect();
//     } else {
//         connect();
//     }
// }

// function connect() {
//     const deviceIp = deviceIpInput.value.trim();
    
//     if (!deviceIp) {
//         showAlert('Please enter a valid device IP address', 'danger');
//         return;
//     }
    
//     console.log(`Connecting to ${deviceIp}...`);
    
//     // Save the IP for future use
//     localStorage.setItem('deviceIp', deviceIp);
    
//     // Create WebSocket connection
//     try {
//         socket = new WebSocket(`ws://${deviceIp}:81`);
        
//         // Connection opened
//         socket.addEventListener('open', () => {
//             console.log('WebSocket connection opened');
//             isConnected = true;
//             updateConnectionStatus(true);
//             showAlert('Connected to device', 'success');
//         });
        
//         // Listen for messages
//         socket.addEventListener('message', handleWebSocketMessage);
        
//         // Handle errors
//         socket.addEventListener('error', (error) => {
//             console.error('WebSocket error:', error);
//             showAlert('Connection error. Please check the IP and try again.', 'danger');
//             disconnect();
//         });
        
//         // Handle connection close
//         socket.addEventListener('close', () => {
//             console.log('WebSocket connection closed');
//             if (isConnected) {
//                 disconnect();
//                 showAlert('Connection closed', 'warning');
//             }
//         });
        
//     } catch (error) {
//         console.error('Error creating WebSocket:', error);
//         showAlert('Failed to connect. Please check the IP and try again.', 'danger');
//     }
// }

// function disconnect() {
//     if (socket) {
//         // Remove all event listeners to prevent memory leaks
//         socket.onopen = null;
//         socket.onclose = null;
//         socket.onerror = null;
//         socket.onmessage = null;
        
//         // Close the connection
//         try {
//             socket.close();
//         } catch (e) {
//             console.warn('Error while closing WebSocket:', e);
//         }
//         socket = null;
//     }
    
//     isConnected = false;
//     updateConnectionStatus(false);
    
//     // Stop temperature monitoring if active
//     if (temperatureMonitoring) {
//         stopTemperatureMonitoring();
//     }
// }

// function updateConnectionStatus(connected) {
//     if (connectBtn) {
//         connectBtn.textContent = connected ? 'Disconnect' : 'Connect';
//         connectBtn.className = connected ? 'btn btn-danger' : 'btn btn-primary';
//     }
    
//     // Update connection status text (small text)
//     const connectionStatusText = document.getElementById('connection-status-text');
//     if (connectionStatusText) {
//         connectionStatusText.textContent = connected ? 'Connected' : 'Not connected';
//         connectionStatusText.className = `small ${connected ? 'text-success' : 'text-muted'}`;
//     }
    
//     // Update connection alert box
//     const connectionAlert = document.getElementById('connection-alert');
//     if (connectionAlert) {
//         const icon = connectionAlert.querySelector('i');
//         const text = connectionAlert.querySelector('span');
        
//         if (connected) {
//             connectionAlert.className = 'alert alert-success mb-0 d-flex align-items-center';
//             if (icon) icon.className = 'bi bi-power me-2';
//             if (text) text.textContent = 'Status: Connected';
//         } else {
//             connectionAlert.className = 'alert alert-secondary mb-0 d-flex align-items-center';
//             if (icon) icon.className = 'bi bi-power me-2';
//             if (text) text.textContent = 'Status: Not connected';
//         }
//     }
    
//     // Update connection indicator in navbar
//     if (connectionIndicator) {
//         connectionIndicator.textContent = connected ? 'Connected' : 'Disconnected';
//         connectionIndicator.className = connected ? 'badge bg-success' : 'badge bg-secondary';
//     }
    
//     // Enable/disable experiment controls
//     enableExperimentControls(connected);
// }

// function enableExperimentControls(enabled) {
//     const controlIds = [
//         'measure-resistor-btn', 'brightness-slider', 'led-on-btn', 'led-off-btn',
//         'read-temperature-btn', 'start-monitoring-btn', 'stop-monitoring-btn',
//         'read-light-btn', 'gate-type', 'input-a', 'input-b'
//     ];
    
//     controlIds.forEach(id => {
//         const element = document.getElementById(id);
//         if (element) {
//             element.disabled = !enabled;
//         }
//     });
// }

// function testConnection() {
//     if (!isConnected || !socket) {
//         showAlert('Not connected to device', 'danger');
//         return;
//     }
    
//     console.log('Testing connection...');
//     sendCommand('ping');
// }

// function sendCommand(command, params = {}) {
//     if (!isConnected || !socket) {
//         showAlert('Not connected to device', 'danger');
//         return false;
//     }
    
//     const message = {
//         command: command,
//         ...params
//     };
    
//     console.log('Sending command:', message);
    
//     try {
//         socket.send(JSON.stringify(message));
//         return true;
//     } catch (error) {
//         console.error('Error sending command:', error);
//         showAlert('Error sending command to device', 'danger');
//         return false;
//     }
// }

// function handleWebSocketMessage(event) {
//     try {
//         console.log('Raw WebSocket message:', event.data);
//         const data = JSON.parse(event.data);
//         console.log('Parsed WebSocket data:', data);
        
//         switch (data.type) {
//             case 'resistance_measurement':
//                 handleResistanceMeasurement(data);
//                 break;
//             case 'temperature_reading':
//                 handleTemperatureReading(data);
//                 break;
//             case 'light_reading':
//                 handleLightReading(data);
//                 break;
//             case 'led_status':
//                 handleLEDStatus(data);
//                 break;
//             case 'logic_gate_result':
//                 handleLogicGateResult(data);
//                 break;
//             case 'debug_adc':
//                 handleDebugADC(data);
//                 break;
//             case 'status':
//                 console.log('Status:', data.message);
//                 showAlert(data.message, 'info');
//                 break;
//             case 'pong':
//                 console.log('Pong received');
//                 showAlert('Connection test successful!', 'success');
//                 break;
//             case 'error':
//                 console.error('Error from device:', data.message);
//                 showAlert(`Device error: ${data.message}`, 'danger');
//                 break;
//             default:
//                 console.warn('Unknown message type:', data.type);
//         }
//     } catch (error) {
//         console.error('Error parsing WebSocket message:', error);
//         showAlert('Error parsing server response', 'danger');
//     }
// }

// function handleResistanceMeasurement(data) {
//     console.log('Handling resistance measurement:', data);
    
//     if (!data.valid) {
//         showAlert('Invalid resistance measurement received', 'warning');
//         if (resistanceValue) {
//             resistanceValue.textContent = 'Invalid';
//         }
//         return;
//     }
    
//     const resistance = data.resistance;
    
//     // Update display
//     if (resistanceValue) {
//         let displayValue, unit;
//         if (resistance >= 1e6) {
//             displayValue = (resistance / 1e6).toFixed(2);
//             unit = 'MΩ';
//         } else if (resistance >= 1e3) {
//             displayValue = (resistance / 1e3).toFixed(2);
//             unit = 'kΩ';
//         } else {
//             displayValue = resistance.toFixed(2);
//             unit = 'Ω';
//         }
//         resistanceValue.textContent = `${displayValue} ${unit}`;
//     }
    
//     // Update progress bar
//     const progressBar = document.getElementById('resistor-progress');
//     if (progressBar) {
//         progressBar.style.width = '100%';
//         progressBar.className = 'progress-bar bg-success';
//     }
    
//     // Add to data and update chart
//     addDataPoint('resistor', resistance);
//     updateChart('resistor');
// }

// function handleTemperatureReading(data) {
//     console.log('Handling temperature reading:', data);
    
//     if (!data.valid) {
//         showAlert('Invalid temperature reading received', 'warning');
//         if (temperatureValue) {
//             temperatureValue.textContent = 'Invalid';
//         }
//         return;
//     }
    
//     const temperature = data.temperature;
    
//     // Update display
//     if (temperatureValue) {
//         temperatureValue.textContent = temperature.toFixed(1);
//     }
    
//     // Add to data and update chart
//     addDataPoint('temperature', temperature);
//     updateChart('temperature');
// }

// function handleLightReading(data) {
//     console.log('Handling light reading:', data);
    
//     if (!data.valid) {
//         showAlert('Invalid light reading received', 'warning');
//         if (lightValue) {
//             lightValue.textContent = 'Invalid';
//         }
//         return;
//     }
    
//     const lightIntensity = data.light_intensity;
//     const resistance = data.resistance;
    
//     // Update display
//     if (lightValue) {
//         lightValue.textContent = lightIntensity.toFixed(0);
//     }
    
//     // Update resistance display
//     const resistanceDisplay = document.querySelector('#light-experiment #resistance-value');
//     if (resistanceDisplay) {
//         let displayValue, unit;
//         if (resistance >= 1e6) {
//             displayValue = (resistance / 1e6).toFixed(2);
//             unit = 'MΩ';
//         } else if (resistance >= 1e3) {
//             displayValue = (resistance / 1e3).toFixed(2);
//             unit = 'kΩ';
//         } else {
//             displayValue = resistance.toFixed(0);
//             unit = 'Ω';
//         }
//         resistanceDisplay.textContent = `${displayValue} ${unit}`;
//     }
    
//     // Update progress bar
//     const progressBar = document.getElementById('light-progress');
//     if (progressBar) {
//         const percentage = Math.min((lightIntensity / 1000) * 100, 100);
//         progressBar.style.width = `${percentage}%`;
//     }
    
//     // Add to data and update chart
//     addDataPoint('light', lightIntensity);
//     updateChart('light');
// }

// function handleLEDStatus(data) {
//     console.log('Handling LED status:', data);
    
//     const brightness = data.brightness;
    
//     // Update slider
//     if (brightnessSlider) {
//         brightnessSlider.value = brightness;
//     }
    
//     // Update brightness value display
//     const brightnessValueDisplay = document.getElementById('brightness-value');
//     if (brightnessValueDisplay) {
//         brightnessValueDisplay.textContent = brightness;
//     }
    
//     // Update LED visual indicator
//     const ledBulb = document.getElementById('led-bulb');
//     if (ledBulb) {
//         const opacity = brightness / 100;
//         ledBulb.style.opacity = opacity;
//         ledBulb.style.backgroundColor = brightness > 0 ? '#ffd700' : '#666';
//     }
    
//     // Add to PWM data and update chart
//     addDataPoint('pwm', brightness);
//     updateChart('pwm');
// }

// function handleLogicGateResult(data) {
//     console.log('Handling logic gate result:', data);
    
//     const output = data.output;
    
//     // Update output display
//     const logicOutput = document.getElementById('logic-output');
//     if (logicOutput) {
//         logicOutput.textContent = `Output: ${output ? 1 : 0}`;
//         logicOutput.className = output ? 'badge bg-success' : 'badge bg-secondary';
//     }
    
//     // Update output LED
//     const outputLed = document.getElementById('output-led');
//     if (outputLed) {
//         outputLed.style.backgroundColor = output ? '#00ff00' : '#666';
//     }
// }

// function handleDebugADC(data) {
//     console.log('Handling debug ADC data:', data);
    
//     let debugInfo = 'ADC Debug Info:\n';
//     debugInfo += `Resistor - Raw: ${data.resistor_raw}, Voltage: ${data.resistor_voltage}V\n`;
//     debugInfo += `Light - Raw: ${data.light_raw}, Voltage: ${data.light_voltage}V\n`;
//     debugInfo += `Temperature - Raw: ${data.temp_raw}, Voltage: ${data.temp_voltage}V`;
    
//     console.log(debugInfo);
//     showAlert('Debug info logged to console', 'info');
// }

// function updateBrightness() {
//     const brightness = parseInt(brightnessSlider.value);
//     const brightnessValueDisplay = document.getElementById('brightness-value');
//     if (brightnessValueDisplay) {
//         brightnessValueDisplay.textContent = brightness;
//     }
    
//     setLED(brightness);
// }

// function setLED(brightness) {
//     sendCommand('set_led', { brightness: brightness });
// }

// function startTemperatureMonitoring() {
//     if (sendCommand('start_temp_monitoring')) {
//         temperatureMonitoring = true;
        
//         const startBtn = document.getElementById('start-monitoring-btn');
//         const stopBtn = document.getElementById('stop-monitoring-btn');
        
//         if (startBtn) startBtn.disabled = true;
//         if (stopBtn) stopBtn.disabled = false;
//     }
// }

// function stopTemperatureMonitoring() {
//     if (sendCommand('stop_temp_monitoring')) {
//         temperatureMonitoring = false;
        
//         const startBtn = document.getElementById('start-monitoring-btn');
//         const stopBtn = document.getElementById('stop-monitoring-btn');
        
//         if (startBtn) startBtn.disabled = false;
//         if (stopBtn) stopBtn.disabled = true;
//     }
// }

// function updateLogicGate() {
//     const gateType = document.getElementById('gate-type').value;
//     const inputA = document.getElementById('input-a').checked;
//     const inputB = document.getElementById('input-b').checked;
    
//     sendCommand('set_logic_gate', {
//         gate: gateType,
//         inputA: inputA,
//         inputB: inputB
//     });
    
//     updateTruthTable(gateType);
// }

// function updateTruthTable(gateType) {
//     const truthTable = {
//         'AND': [0, 0, 0, 1],
//         'OR': [0, 1, 1, 1],
//         'NOT': [1, 1, 0, 0],
//         'NAND': [1, 1, 1, 0],
//         'NOR': [1, 0, 0, 0],
//         'XOR': [0, 1, 1, 0]
//     };
    
//     const values = truthTable[gateType] || [0, 0, 0, 0];
    
//     document.getElementById('tt-00').textContent = values[0];
//     document.getElementById('tt-01').textContent = values[1];
//     document.getElementById('tt-10').textContent = values[2];
//     document.getElementById('tt-11').textContent = values[3];
// }

// function addDataPoint(experiment, value) {
//     const timestamp = new Date();
//     const dataPoint = {
//         value: value,
//         timestamp: timestamp,
//         displayTime: timestamp.toLocaleTimeString()
//     };
    
//     experimentData[experiment].push(dataPoint);
    
//     // Keep only last 50 data points
//     if (experimentData[experiment].length > 50) {
//         experimentData[experiment] = experimentData[experiment].slice(-50);
//     }
    
//     // Save to localStorage
//     localStorage.setItem('experimentData', JSON.stringify(experimentData));
// }

// function updateChart(experiment) {
//     const chart = charts[experiment];
//     if (!chart) return;
    
//     const data = experimentData[experiment];
//     const labels = data.map(d => d.displayTime);
//     const values = data.map(d => d.value);
    
//     chart.data.labels = labels;
//     chart.data.datasets[0].data = values;
//     chart.update();
// }

// function clearExperimentData(experiment) {
//     if (confirm(`Are you sure you want to clear the ${experiment} data?`)) {
//         experimentData[experiment] = [];
//         localStorage.setItem('experimentData', JSON.stringify(experimentData));
//         updateChart(experiment);
//         showAlert(`${experiment} data cleared`, 'success');
//     }
// }

// function exportExperimentData(experiment) {
//     const data = experimentData[experiment];
//     if (data.length === 0) {
//         showAlert(`No ${experiment} data to export`, 'warning');
//         return;
//     }
    
//     let csvContent = 'Timestamp,Value\n';
//     data.forEach(point => {
//         csvContent += `${point.timestamp.toISOString()},${point.value}\n`;
//     });
    
//     const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
//     const url = URL.createObjectURL(blob);
//     const link = document.createElement('a');
    
//     const now = new Date();
//     const filename = `${experiment}_data_${now.getFullYear()}-${(now.getMonth() + 1).toString().padStart(2, '0')}-${now.getDate().toString().padStart(2, '0')}.csv`;
    
//     link.setAttribute('href', url);
//     link.setAttribute('download', filename);
//     link.style.visibility = 'hidden';
    
//     document.body.appendChild(link);
//     link.click();
//     document.body.removeChild(link);
    
//     showAlert(`${experiment} data exported as ${filename}`, 'success');
// }

// function loadExperimentData() {
//     const saved = localStorage.getItem('experimentData');
//     if (saved) {
//         try {
//             const parsed = JSON.parse(saved);
//             // Convert timestamp strings back to Date objects
//             Object.keys(parsed).forEach(experiment => {
//                 parsed[experiment] = parsed[experiment].map(point => ({
//                     ...point,
//                     timestamp: new Date(point.timestamp)
//                 }));
//             });
//             experimentData = parsed;
//             console.log('Loaded experiment data from localStorage');
//         } catch (error) {
//             console.error('Error loading experiment data:', error);
//             experimentData = { resistor: [], temperature: [], light: [], pwm: [] };
//         }
//     }
// }

// function showAlert(message, type = 'info') {
//     console.log(`Alert (${type}): ${message}`);
    
//     // Remove existing alerts
//     const existingAlerts = document.querySelectorAll('.alert[data-auto-dismiss="true"]');
//     existingAlerts.forEach(alert => alert.remove());
    
//     const alertDiv = document.createElement('div');
//     alertDiv.className = `alert alert-${type} alert-dismissible fade show`;
//     alertDiv.setAttribute('data-auto-dismiss', 'true');
//     alertDiv.innerHTML = `
//         ${message}
//         <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
//     `;
    
//     // Add to the top of the container
//     const container = document.querySelector('.container');
//     const firstChild = container.children[1]; // After navbar
//     container.insertBefore(alertDiv, firstChild);
    
//     // Auto-remove after 5 seconds
//     setTimeout(() => {
//         if (alertDiv.parentNode) {
//             alertDiv.remove();
//         }
//     }, 5000);
// }
// Global variables
let socket = null;
let isConnected = false;
let currentExperiment = 'resistor';
let experimentData = {
    resistor: [],
    temperature: [],
    light: [],
    pwm: []
};
let charts = {};
let temperatureMonitoring = false;
let monitoringInterval = null;

// DOM Elements - Common
const connectBtn = document.getElementById('connect-btn');
const deviceIpInput = document.getElementById('device-ip');
const connectionStatus = document.getElementById('connection-status');
const connectionIndicator = document.getElementById('connection-indicator');

// Navigation elements
const navLinks = document.querySelectorAll('[data-experiment]');
const experimentPanels = document.querySelectorAll('.experiment-panel');

// Initialize the application
document.addEventListener('DOMContentLoaded', () => {
    // Initialize charts for all experiments
    initializeCharts();
    
    // Load saved device IP if available
    const savedIp = localStorage.getItem('deviceIp');
    if (savedIp) {
        deviceIpInput.value = savedIp;
    }
    
    // Load saved experiment data
    loadExperimentData();
    
    // Set up event listeners
    setupEventListeners();
    
    // Initialize experiment navigation
    setupExperimentNavigation();
    
    // Initialize logic gates
    initializeLogicGates();
});

function setupEventListeners() {
    // Connect button click handler
    connectBtn.addEventListener('click', toggleConnection);
    
    // Handle Enter key in IP input
    deviceIpInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            toggleConnection();
        }
    });
    
    // Resistor experiment
    const measureResistorBtn = document.getElementById('measure-resistor-btn');
    if (measureResistorBtn) {
        measureResistorBtn.addEventListener('click', () => sendCommand('measure_resistor'));
    }
    
    // LED PWM experiment
    const brightnessSlider = document.getElementById('brightness-slider');
    const ledOnBtn = document.getElementById('led-on-btn');
    const ledOffBtn = document.getElementById('led-off-btn');
    
    if (brightnessSlider) {
        brightnessSlider.addEventListener('input', updateBrightness);
    }
    if (ledOnBtn) {
        ledOnBtn.addEventListener('click', () => setLED(true));
    }
    if (ledOffBtn) {
        ledOffBtn.addEventListener('click', () => setLED(false));
    }
    
    // Temperature experiment
    const readTempBtn = document.getElementById('read-temperature-btn');
    const startMonitoringBtn = document.getElementById('start-monitoring-btn');
    const stopMonitoringBtn = document.getElementById('stop-monitoring-btn');
    
    if (readTempBtn) {
        readTempBtn.addEventListener('click', () => sendCommand('read_temperature'));
    }
    if (startMonitoringBtn) {
        startMonitoringBtn.addEventListener('click', startTemperatureMonitoring);
    }
    if (stopMonitoringBtn) {
        stopMonitoringBtn.addEventListener('click', stopTemperatureMonitoring);
    }
    
    // Light sensor experiment
    const readLightBtn = document.getElementById('read-light-btn');
    if (readLightBtn) {
        readLightBtn.addEventListener('click', () => sendCommand('read_light'));
    }
    
    // Logic gates experiment
    const gateType = document.getElementById('gate-type');
    const inputA = document.getElementById('input-a');
    const inputB = document.getElementById('input-b');
    
    if (gateType) {
        gateType.addEventListener('change', updateLogicGate);
    }
    if (inputA) {
        inputA.addEventListener('change', updateLogicGate);
    }
    if (inputB) {
        inputB.addEventListener('change', updateLogicGate);
    }
}

function toggleConnection() {
    if (isConnected) {
        disconnect();
    } else {
        connect();
    }
}

function connect() {
    const deviceIp = deviceIpInput.value.trim();
    
    if (!deviceIp) {
        showAlert('Please enter a valid device IP address', 'danger');
        return;
    }
    
    // Save the IP for future use
    localStorage.setItem('deviceIp', deviceIp);
    
    // Create WebSocket connection
    try {
        socket = new WebSocket(`ws://${deviceIp}:81`);
        
        // Connection opened
        socket.addEventListener('open', () => {
            isConnected = true;
            updateConnectionStatus(true);
            showAlert('Connected to device', 'success');
            measureBtn.disabled = false;
        });
        
        // Listen for messages
        socket.addEventListener('message', handleWebSocketMessage);
        
        // Handle errors
        socket.addEventListener('error', (error) => {
            console.error('WebSocket error:', error);
            showAlert('Connection error. Please check the IP and try again.', 'danger');
            disconnect();
        });
        
        // Handle connection close
        socket.addEventListener('close', () => {
            if (isConnected) {
                disconnect();
                showAlert('Connection closed', 'warning');
            }
        });
        
    } catch (error) {
        console.error('Error creating WebSocket:', error);
        showAlert('Failed to connect. Please check the IP and try again.', 'danger');
    }
}

function disconnect() {
    if (socket) {
        socket.close();
        socket = null;
    }
    
    isConnected = false;
    updateConnectionStatus(false);
    measureBtn.disabled = true;
    showAlert('Disconnected', 'secondary');
}

function updateConnectionStatus(connected) {
    const statusText = connected ? 'Connected' : 'Not connected';
    const statusClass = connected ? 'alert-success' : 'alert-secondary';
    
    connectionStatus.className = 'alert ' + statusClass + ' mb-0';
    connectionStatus.textContent = `Status: ${statusText}`;
    connectBtn.textContent = connected ? 'Disconnect' : 'Connect';
    connectBtn.className = connected ? 'btn btn-warning' : 'btn btn-primary';
    
    // Update navbar indicator
    if (connectionIndicator) {
        connectionIndicator.textContent = connected ? 'Connected' : 'Disconnected';
        connectionIndicator.className = connected ? 'badge bg-success' : 'badge bg-secondary';
    }
    
    // Enable/disable experiment controls
    enableExperimentControls(connected);
}

function handleWebSocketMessage(event) {
    try {
        const data = JSON.parse(event.data);
        console.log('Received:', data);
        
        switch (data.type) {
            case 'resistance_measurement':
                handleResistanceMeasurement(data);
                break;
            case 'temperature_reading':
                handleTemperatureReading(data);
                break;
            case 'light_reading':
                handleLightReading(data);
                break;
            case 'led_status':
                handleLEDStatus(data);
                break;
            case 'logic_gate_result':
                handleLogicGateResult(data);
                break;
            case 'status':
                console.log('Status:', data.message);
                break;
            case 'error':
                showAlert(data.message, 'danger');
                break;
        }
    } catch (error) {
        console.error('Error parsing WebSocket message:', error);
        showAlert('Error parsing server response', 'danger');
    }
}

function measureResistor() {
    if (!isConnected || !socket) {
        showAlert('Not connected to device', 'danger');
        return;
    }
    
    // Show measurement in progress
    resistanceValue.textContent = 'Measuring...';
    measurementProgress.style.width = '0%';
    measurementProgress.className = 'progress-bar progress-bar-striped progress-bar-animated';
    
    // Simulate progress (will be updated by actual measurement)
    let progress = 0;
    const progressInterval = setInterval(() => {
        progress += 5;
        if (progress <= 100) {
            measurementProgress.style.width = `${progress}%`;
        } else {
            clearInterval(progressInterval);
        }
    }, 50);
    
    // Send measurement command to device
    const command = {
        command: 'measure_resistor'
    };
    
    socket.send(JSON.stringify(command));
}

function updateMeasurement(resistance) {
    // Format the resistance value
    let displayValue;
    let unit = 'Ω';
    
    if (resistance >= 1e6) {
        displayValue = (resistance / 1e6).toFixed(2);
        unit = 'MΩ';
    } else if (resistance >= 1e3) {
        displayValue = (resistance / 1e3).toFixed(2);
        unit = 'kΩ';
    } else {
        displayValue = resistance.toFixed(2);
    }
    
    resistanceValue.textContent = `${displayValue} ${unit}`;
    
    // Update progress bar
    measurementProgress.style.width = '100%';
    measurementProgress.className = 'progress-bar bg-success';
}

function addToHistory(resistance) {
    const now = new Date();
    const timestamp = now.toISOString();
    const displayTime = now.toLocaleTimeString();
    
    measurementHistory.unshift({
        resistance,
        timestamp,
        displayTime
    });
    
    // Keep only the last 50 measurements
    if (measurementHistory.length > 50) {
        measurementHistory = measurementHistory.slice(0, 50);
    }
    
    // Save to localStorage
    localStorage.setItem('measurementHistory', JSON.stringify(measurementHistory));
}

function initChart() {
    const ctx = document.getElementById('chart').getContext('2d');
    
    chart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: [],
            datasets: [{
                label: 'Resistance (Ω)',
                data: [],
                borderColor: 'rgb(75, 192, 192)',
                tension: 0.1,
                fill: false
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                y: {
                    beginAtZero: true,
                    title: {
                        display: true,
                        text: 'Resistance (Ω)'
                    }
                },
                x: {
                    title: {
                        display: true,
                        text: 'Time'
                    }
                }
            },
            plugins: {
                legend: {
                    display: true,
                    position: 'top',
                },
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            return `Resistance: ${context.parsed.y.toFixed(2)} Ω`;
                        }
                    }
                }
            }
        }
    });
}

function updateChart() {
    if (!chart) return;
    
    // Prepare data for chart
    const labels = [];
    const data = [];
    
    // Take the last 20 measurements for the chart
    const recentMeasurements = [...measurementHistory].reverse().slice(0, 20);
    
    recentMeasurements.forEach((measurement, index) => {
        labels.unshift(measurement.displayTime);
        data.unshift(measurement.resistance);
    });
    
    // Update chart data
    chart.data.labels = labels;
    chart.data.datasets[0].data = data;
    
    // Update y-axis range
    if (data.length > 0) {
        const maxValue = Math.max(...data) * 1.1; // 10% padding
        chart.options.scales.y.max = maxValue > 0 ? maxValue : 1000; // Default max if all zeros
    }
    
    chart.update();
}

function clearHistory() {
    if (confirm('Are you sure you want to clear the measurement history?')) {
        measurementHistory = [];
        localStorage.removeItem('measurementHistory');
        updateChart();
    }
}

function exportData() {
    if (measurementHistory.length === 0) {
        showAlert('No measurement data to export', 'warning');
        return;
    }
    
    // Convert to CSV
    let csvContent = 'Timestamp,Resistance (Ω)\n';
    
    measurementHistory.forEach(measurement => {
        csvContent += `${measurement.timestamp},${measurement.resistance.toFixed(2)}\n`;
    });
    
    // Create download link
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    
    const now = new Date();
    const filename = `resistance_measurements_${now.getFullYear()}-${now.getMonth() + 1}-${now.getDate()}.csv`;
    
    link.setAttribute('href', url);
    link.setAttribute('download', filename);
    link.style.visibility = 'hidden';
    
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
}

function showAlert(message, type = 'info') {
    const alertDiv = document.createElement('div');
    alertDiv.className = `alert alert-${type} alert-dismissible fade show`;
    alertDiv.role = 'alert';
    alertDiv.innerHTML = `
        ${message}
        <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
    `;
    
    // Add to the top of the container
    const container = document.querySelector('.container');
    container.insertBefore(alertDiv, container.firstChild);
    
    // Auto-remove after 5 seconds
    setTimeout(() => {
        alertDiv.remove();
    }, 5000);
}