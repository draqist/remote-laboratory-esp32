// Global variables
let socket = null;
let isConnected = false;
let measurementHistory = [];
let chart = null;

// DOM Elements
const connectBtn = document.getElementById('connect-btn');
const measureBtn = document.getElementById('measure-btn');
const deviceIpInput = document.getElementById('device-ip');
const connectionStatus = document.getElementById('connection-status');
const resistanceValue = document.getElementById('resistance-value');
const measurementProgress = document.getElementById('measurement-progress');
const clearHistoryBtn = document.getElementById('clear-history');
const exportDataBtn = document.getElementById('export-data');

// Initialize the application
document.addEventListener('DOMContentLoaded', () => {
    // Initialize chart
    initChart();
    
    // Load saved device IP if available
    const savedIp = localStorage.getItem('deviceIp');
    if (savedIp) {
        deviceIpInput.value = savedIp;
    }
    
    // Load saved measurements if available
    const savedMeasurements = localStorage.getItem('measurementHistory');
    if (savedMeasurements) {
        measurementHistory = JSON.parse(savedMeasurements);
        updateChart();
    }
    
    // Set up event listeners
    setupEventListeners();
});

function setupEventListeners() {
    // Connect button click handler
    connectBtn.addEventListener('click', toggleConnection);
    
    // Measure button click handler
    measureBtn.addEventListener('click', measureResistor);
    
    // Clear history button click handler
    clearHistoryBtn.addEventListener('click', clearHistory);
    
    // Export data button click handler
    exportDataBtn.addEventListener('click', exportData);
    
    // Handle Enter key in IP input
    deviceIpInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            toggleConnection();
        }
    });
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
    
    connectionStatus.className = 'alert ' + statusClass;
    connectionStatus.textContent = `Status: ${statusText}`;
    connectBtn.textContent = connected ? 'Disconnect' : 'Connect';
    connectBtn.className = connected ? 'btn btn-warning' : 'btn btn-primary';
}

function handleWebSocketMessage(event) {
    try {
        const data = JSON.parse(event.data);
        
        if (data.type === 'resistance_measurement') {
            const resistance = parseFloat(data.resistance);
            updateMeasurement(resistance);
            addToHistory(resistance);
            updateChart();
        }
    } catch (error) {
        console.error('Error parsing WebSocket message:', error);
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
