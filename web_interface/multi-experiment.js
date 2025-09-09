// Multi-experiment functionality for Remote Laboratory

// Experiment navigation
function setupExperimentNavigation() {
    navLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const experiment = link.getAttribute('data-experiment');
            switchExperiment(experiment);
        });
    });
}

function switchExperiment(experiment) {
    // Update navigation
    navLinks.forEach(link => {
        link.classList.remove('active');
        if (link.getAttribute('data-experiment') === experiment) {
            link.classList.add('active');
        }
    });
    
    // Update panels
    experimentPanels.forEach(panel => {
        panel.classList.remove('active');
    });
    
    const targetPanel = document.getElementById(`${experiment}-experiment`);
    if (targetPanel) {
        targetPanel.classList.add('active');
    }
    
    currentExperiment = experiment;
}

// Enable/disable experiment controls based on connection status
function enableExperimentControls(enabled) {
    const controls = [
        'measure-resistor-btn',
        'brightness-slider', 'led-on-btn', 'led-off-btn',
        'read-temperature-btn', 'start-monitoring-btn', 'stop-monitoring-btn',
        'read-light-btn',
        'gate-type', 'input-a', 'input-b'
    ];
    
    controls.forEach(id => {
        const element = document.getElementById(id);
        if (element) {
            element.disabled = !enabled;
        }
    });
}

// Generic command sender
function sendCommand(command, params = {}) {
    if (!socket || !isConnected) {
        showAlert('Not connected to device', 'danger');
        return;
    }
    
    const message = { command, ...params };
    console.log('Sending:', message);
    socket.send(JSON.stringify(message));
}

// Resistor measurement handlers
function handleResistanceMeasurement(data) {
    const resistance = parseFloat(data.resistance);
    const resistanceElement = document.getElementById('resistance-value');
    const progressElement = document.getElementById('resistor-progress');
    
    if (resistanceElement) {
        let displayValue, unit = 'Ω';
        
        if (resistance >= 1e6) {
            displayValue = (resistance / 1e6).toFixed(2);
            unit = 'MΩ';
        } else if (resistance >= 1e3) {
            displayValue = (resistance / 1e3).toFixed(2);
            unit = 'kΩ';
        } else {
            displayValue = resistance.toFixed(2);
        }
        
        resistanceElement.textContent = `${displayValue} ${unit}`;
    }
    
    if (progressElement) {
        progressElement.style.width = '100%';
        progressElement.className = 'progress-bar bg-success';
    }
    
    // Add to history and update chart
    addToExperimentHistory('resistor', {
        value: resistance,
        unit: 'Ω',
        timestamp: new Date().toISOString()
    });
    
    updateChart('resistor');
}

// LED PWM handlers
function updateBrightness() {
    const slider = document.getElementById('brightness-slider');
    const valueDisplay = document.getElementById('brightness-value');
    
    if (slider && valueDisplay) {
        const brightness = parseInt(slider.value);
        valueDisplay.textContent = brightness;
        
        sendCommand('set_led', { brightness });
        
        // Update visual LED indicator
        const ledBulb = document.getElementById('led-bulb');
        if (ledBulb) {
            if (brightness > 0) {
                ledBulb.classList.add('on');
                ledBulb.style.opacity = brightness / 100;
            } else {
                ledBulb.classList.remove('on');
            }
        }
        
        // Add to PWM history
        addToExperimentHistory('pwm', {
            value: brightness,
            unit: '%',
            timestamp: new Date().toISOString()
        });
        
        updateChart('pwm');
    }
}

function setLED(state) {
    const slider = document.getElementById('brightness-slider');
    const ledBulb = document.getElementById('led-bulb');
    
    if (state) {
        if (slider) slider.value = 100;
        updateBrightness();
    } else {
        if (slider) slider.value = 0;
        if (ledBulb) {
            ledBulb.classList.remove('on');
        }
        sendCommand('set_led', { brightness: 0 });
    }
}

function handleLEDStatus(data) {
    const ledBulb = document.getElementById('led-bulb');
    const slider = document.getElementById('brightness-slider');
    const valueDisplay = document.getElementById('brightness-value');
    
    if (data.brightness !== undefined) {
        if (slider) slider.value = data.brightness;
        if (valueDisplay) valueDisplay.textContent = data.brightness;
        
        if (ledBulb) {
            if (data.brightness > 0) {
                ledBulb.classList.add('on');
                ledBulb.style.opacity = data.brightness / 100;
            } else {
                ledBulb.classList.remove('on');
            }
        }
    }
}

// Temperature measurement handlers
function handleTemperatureReading(data) {
    const tempElement = document.getElementById('temperature-value');
    
    if (tempElement && data.temperature !== undefined) {
        tempElement.textContent = data.temperature.toFixed(1);
        
        // Add to history
        addToExperimentHistory('temperature', {
            value: data.temperature,
            unit: '°C',
            timestamp: new Date().toISOString()
        });
        
        updateChart('temperature');
    }
}

function startTemperatureMonitoring() {
    if (!temperatureMonitoring) {
        temperatureMonitoring = true;
        sendCommand('start_temperature_monitoring');
        
        const startBtn = document.getElementById('start-monitoring-btn');
        const stopBtn = document.getElementById('stop-monitoring-btn');
        
        if (startBtn) startBtn.disabled = true;
        if (stopBtn) stopBtn.disabled = false;
        
        showAlert('Temperature monitoring started', 'success');
    }
}

function stopTemperatureMonitoring() {
    if (temperatureMonitoring) {
        temperatureMonitoring = false;
        sendCommand('stop_temperature_monitoring');
        
        const startBtn = document.getElementById('start-monitoring-btn');
        const stopBtn = document.getElementById('stop-monitoring-btn');
        
        if (startBtn) startBtn.disabled = false;
        if (stopBtn) stopBtn.disabled = true;
        
        showAlert('Temperature monitoring stopped', 'info');
    }
}

// Light sensor handlers
function handleLightReading(data) {
    const lightElement = document.getElementById('light-value');
    const resistanceElement = document.getElementById('resistance-value');
    const progressElement = document.getElementById('light-progress');
    
    if (lightElement && data.light_intensity !== undefined && data.resistance !== undefined) {
        // Update light intensity display
        lightElement.textContent = Math.round(data.light_intensity);
        
        // Update resistance display
        if (resistanceElement) {
            let displayResistance = data.resistance;
            let unit = 'Ω';
            
            if (data.resistance >= 1000) {
                displayResistance = (data.resistance / 1000).toFixed(1);
                unit = 'kΩ';
            }
            resistanceElement.textContent = `${displayResistance} ${unit}`;
        }
        
        // Update progress bar based on resistance (inverse relationship)
        if (progressElement) {
            // Map resistance to 0-100% (lower resistance = higher light = more progress)
            // Use log scale for better visualization across wide resistance range
            const minResistance = 100;  // Minimum expected resistance in bright light (Ω)
            const maxResistance = 100000; // Maximum expected resistance in darkness (Ω)
            
            let resistance = Math.max(minResistance, Math.min(data.resistance, maxResistance));
            // Logarithmic scale for better visualization
            const logMin = Math.log10(minResistance);
            const logMax = Math.log10(maxResistance);
            const logResistance = Math.log10(resistance);
            
            // Invert the scale (higher resistance = lower light = less progress)
            const percentage = 100 * (1 - ((logResistance - logMin) / (logMax - logMin)));
            progressElement.style.width = `${Math.max(0, Math.min(100, percentage))}%`;
        }
        
        // Add to history - store both light intensity and resistance
        addToExperimentHistory('light', {
            value: data.resistance,  // Use resistance for the graph
            light_intensity: data.light_intensity,
            resistance: data.resistance,
            unit: 'Ω',
            timestamp: new Date().toISOString()
        });
        
        updateChart('light');
    }
}

// Logic gate handlers
function initializeLogicGates() {
    updateLogicGate();
}

function updateLogicGate() {
    const gateType = document.getElementById('gate-type');
    const inputA = document.getElementById('input-a');
    const inputB = document.getElementById('input-b');
    const logicOutput = document.getElementById('logic-output');
    const outputLed = document.getElementById('output-led');
    
    if (!gateType || !inputA || !inputB || !logicOutput) return;
    
    const gate = gateType.value;
    const a = inputA.checked ? 1 : 0;
    const b = inputB.checked ? 1 : 0;
    
    let output = 0;
    
    switch (gate) {
        case 'AND':
            output = a && b ? 1 : 0;
            break;
        case 'OR':
            output = a || b ? 1 : 0;
            break;
        case 'NOT':
            output = a ? 0 : 1;
            break;
        case 'NAND':
            output = a && b ? 0 : 1;
            break;
        case 'NOR':
            output = a || b ? 0 : 1;
            break;
        case 'XOR':
            output = a !== b ? 1 : 0;
            break;
    }
    
    logicOutput.textContent = `Output: ${output}`;
    logicOutput.className = `badge ${output ? 'bg-success' : 'bg-secondary'}`;
    
    if (outputLed) {
        if (output) {
            outputLed.classList.add('on');
        } else {
            outputLed.classList.remove('on');
        }
    }
    
    // Update truth table
    updateTruthTable(gate);
    
    // Send to hardware if connected
    if (isConnected) {
        sendCommand('set_logic_gate', {
            gate_type: gate,
            input_a: a,
            input_b: b
        });
    }
}

function updateTruthTable(gateType) {
    const truthTable = {
        'AND': [0, 0, 0, 1],
        'OR': [0, 1, 1, 1],
        'NOT': [1, 1, 0, 0],
        'NAND': [1, 1, 1, 0],
        'NOR': [1, 0, 0, 0],
        'XOR': [0, 1, 1, 0]
    };
    
    const values = truthTable[gateType] || [0, 0, 0, 0];
    
    document.getElementById('tt-00').textContent = values[0];
    document.getElementById('tt-01').textContent = values[1];
    document.getElementById('tt-10').textContent = values[2];
    document.getElementById('tt-11').textContent = values[3];
}

function handleLogicGateResult(data) {
    // Handle hardware response for logic gate operations
    console.log('Logic gate result:', data);
}

// Data management
function addToExperimentHistory(experiment, dataPoint) {
    if (!experimentData[experiment]) {
        experimentData[experiment] = [];
    }
    
    experimentData[experiment].unshift(dataPoint);
    
    // Keep only last 50 measurements
    if (experimentData[experiment].length > 50) {
        experimentData[experiment] = experimentData[experiment].slice(0, 50);
    }
    
    // Save to localStorage
    localStorage.setItem('experimentData', JSON.stringify(experimentData));
}

function loadExperimentData() {
    const saved = localStorage.getItem('experimentData');
    if (saved) {
        experimentData = JSON.parse(saved);
    }
}

// Chart management
function initializeCharts() {
    const chartConfigs = {
        'resistor': { 
            label: 'Resistance (Ω)', 
            color: 'rgb(75, 192, 192)',
            formatValue: (value) => value >= 1000 ? `${(value/1000).toFixed(1)}k` : Math.round(value)
        },
        'temperature': { 
            label: 'Temperature (°C)', 
            color: 'rgb(255, 99, 132)',
            formatValue: (value) => value.toFixed(1)
        },
        'light': { 
            label: 'LDR Resistance (Ω)', 
            color: 'rgb(255, 205, 86)',
            formatValue: (value) => value >= 1000 ? `${(value/1000).toFixed(1)}k` : Math.round(value),
            scaleType: 'logarithmic'
        },
        'pwm': { 
            label: 'PWM Duty Cycle (%)', 
            color: 'rgb(54, 162, 235)',
            formatValue: (value) => Math.round(value)
        }
    };
    
    Object.keys(chartConfigs).forEach(experiment => {
        const canvas = document.getElementById(`${experiment}-chart`);
        if (canvas) {
            const ctx = canvas.getContext('2d');
            const config = chartConfigs[experiment];
            
            // Common chart options
            const commonOptions = {
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                    y: {
                        beginAtZero: config.scaleType !== 'logarithmic',
                        type: config.scaleType === 'logarithmic' ? 'logarithmic' : 'linear',
                        title: {
                            display: true,
                            text: config.label
                        },
                        ticks: {
                            callback: function(value) {
                                if (config.scaleType === 'logarithmic') {
                                    return value >= 1000 ? `${(value/1000).toFixed(0)}k` : value;
                                }
                                return value;
                            }
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
                        position: 'top'
                    },
                    tooltip: {
                        callbacks: {
                            label: function(context) {
                                const value = context.parsed.y;
                                return `${config.label.split(' (')[0]}: ${config.formatValue ? config.formatValue(value) : value}${config.label.includes('(') ? ' ' + config.label.split('(')[1].split(')')[0] : ''}`;
                            }
                        }
                    }
                }
            };
            
            // Create chart with common options
            charts[experiment] = new Chart(ctx, {
                type: 'line',
                data: {
                    labels: [],
                    datasets: [{
                        label: config.label,
                        data: [],
                        borderColor: config.color,
                        backgroundColor: config.color + '20',
                        borderWidth: 2,
                        pointRadius: 3,
                        pointHoverRadius: 5,
                        tension: 0.1,
                        fill: false
                    }]
                },
                options: commonOptions
            });
        }
    });
}

function updateChart(experiment) {
    const chart = charts[experiment];
    const data = experimentData[experiment];
    
    if (!chart || !data) return;
    
    // Take last 20 measurements
    const recentData = [...data].reverse().slice(0, 20);
    
    const labels = recentData.map(item => new Date(item.timestamp).toLocaleTimeString());
    const values = recentData.map(item => item.value);
    
    chart.data.labels = labels;
    chart.data.datasets[0].data = values;
    
    chart.update();
}
