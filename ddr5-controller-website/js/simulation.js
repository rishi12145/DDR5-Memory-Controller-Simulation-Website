const states = {
    IDLE: 'IDLE',
    ACTIVATE: 'ACTIVATE',
    READ: 'READ',
    WRITE: 'WRITE',
    PRECHARGE: 'PRECHARGE'
};

let currentState = states.IDLE;
let timer = 0;
let wr_rd = 0;
let addr = 0; // Will be converted to binary internally
let data_in = 0; // Will be converted to binary internally
let data_out = 0;
let ack = 0;
let ready = 1;
let select_chip = 1; // Renamed from cs_n
let ca = 0; // Kept for backend use
let data_bus = 'Z'; // Renamed from dq
let data_sink = 'Z'; // Renamed from dqs
let memory = {}; // Stores binary strings
let autoRunning = false;
const timing = {
    tRCD: 5, // Reduced to 5 cycles
    tCL: 5,  // Reduced to 5 cycles
    tWR: 6,  // Reduced to 6 cycles
    tRP: 5   // Reduced to 5 cycles
};
let signalHistory = [];

function updateOutput(message) {
    const output = document.getElementById('output');
    output.innerHTML += message + '<br>';
    output.scrollTop = output.scrollHeight;
}

function updateStatus() {
    const row = document.getElementById('status-row');
    row.innerHTML = `
        <td class="border p-2">${currentState}</td>
        <td class="border p-2">${timer}</td>
        <td class="border p-2">${select_chip}</td>
        <td class="border p-2">${data_bus}</td>
        <td class="border p-2">${data_sink}</td>
        <td class="border p-2">${data_out.toString(16).padStart(16, '0')}</td> <!-- Renamed to output -->
        <td class="border p-2">${ack ? '1' : '0'}</td> <!-- Renamed to completion read/write -->
        <td class="border p-2">${ready}</td>
    `;
}

function updateMemoryView() {
    const view = document.getElementById('memory-view');
    let html = 'Memory Contents:<br>';
    for (const key in memory) {
        // Convert binary back to hex for display
        const hexValue = parseInt(memory[key], 2).toString(16).padStart(16, '0');
        html += `Address ${key}: 0x${hexValue}<br>`;
    }
    view.innerHTML = html;
}

function drawTimingDiagram() {
    signalHistory.push({ select_chip, data_bus, data_sink });
    if (signalHistory.length > 50) signalHistory.shift();
    const canvas = document.getElementById('timing-canvas');
    const ctx = canvas.getContext('2d');
    canvas.width = 800;
    canvas.height = 192; // Reduced height since CA is removed

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = document.documentElement.classList.contains('dark') ? '#374151' : '#f8f8f8';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    const signals = ['select_chip', 'data_bus', 'data_sink']; // Removed CA
    const yStep = 60;
    ctx.font = '12px Arial';
    ctx.fillStyle = document.documentElement.classList.contains('dark') ? '#fff' : '#000';

    signals.forEach((signal, i) => {
        ctx.fillText(signal, 10, 30 + i * yStep);
        ctx.beginPath();
        ctx.moveTo(50, 40 + i * yStep);
        signalHistory.forEach((s, j) => {
            const x = 50 + j * 15;
            const y = s[signal] === (signal === 'select_chip' ? 0 : s[signal] !== 'Z') ? 20 + i * yStep : 40 + i * yStep;
            ctx.lineTo(x, y);
            ctx.lineTo(x + 15, y);
        });
        ctx.strokeStyle = '#3182ce';
        ctx.stroke();
    });

    ctx.beginPath();
    ctx.moveTo(50, canvas.height - 10);
    ctx.lineTo(canvas.width - 10, canvas.height - 10);
    ctx.strokeStyle = '#000';
    ctx.stroke();
    signalHistory.forEach((_, i) => {
        ctx.fillText(i, 50 + i * 15, canvas.height - 10);
    });
}

function resetSimulation() {
    currentState = states.IDLE;
    timer = 0;
    wr_rd = 0;
    addr = 0;
    data_in = 0;
    data_out = 0;
    ack = 0;
    ready = 1;
    select_chip = 1;
    ca = 0;
    data_bus = 'Z';
    data_sink = 'Z';
    autoRunning = false;
    signalHistory = [];
    memory = {}; // Clear memory
    document.getElementById('output').innerHTML = 'Simulation reset.<br>';
    updateStatus();
    updateMemoryView();
    drawTimingDiagram();
}

function memoryReset() {
    // Same functionality as resetSimulation
    resetSimulation();
    updateOutput('Memory and simulation reset.<br>');
}

function validateHex(str, len) {
    const regex = new RegExp(`^[0-9A-Fa-f]{1,${len}}$`);
    return regex.test(str);
}

function startRequest(isWrite) {
    if (currentState !== states.IDLE) {
        updateOutput('Error: Controller is not idle.');
        return;
    }
    const addrStr = document.getElementById('addr').value;
    const dataStr = document.getElementById('data_in').value;
    if (!validateHex(addrStr, 8)) {
        updateOutput('Error: Invalid address (use hex, max 8 digits).');
        return;
    }
    if (isWrite && !validateHex(dataStr, 16)) {
        updateOutput('Error: Invalid data (use hex, max 16 digits).');
        return;
    }
    addr = parseInt(addrStr, 16).toString(2).padStart(32, '0'); // Convert to 32-bit binary
    data_in = isWrite ? parseInt(dataStr, 16).toString(2).padStart(64, '0') : '0'.repeat(64); // Convert to 64-bit binary
    wr_rd = isWrite ? 1 : 0;
    const bank_group = parseInt(addr.slice(0, 2), 2); // Extract from binary
    const bank = parseInt(addr.slice(2, 5), 2);
    const row = parseInt(addr.slice(5, 21), 2);
    const col = parseInt(addr.slice(21, 32), 2);
    addr = `${bank_group}:${bank}:${row}:${col}`;
    updateOutput(`Starting ${isWrite ? 'WRITE' : 'READ'} request at address ${addrStr} ${isWrite ? 'with data 0x' + dataStr : ''}`);
    currentState = states.ACTIVATE;
    timer = 0;
    ready = 0;
    select_chip = 0; // Active low
    ca = 0x4000 | row; // Still use row for backend
    updateStatus();
    drawTimingDiagram();
}

function stepSimulation() {
    if (currentState === states.IDLE && !autoRunning) {
        updateOutput('State: IDLE, Waiting for request...');
        return;
    }
    timer++;
    let nextState = currentState;
    ack = 0;

    switch (currentState) {
        case states.ACTIVATE:
            if (timer >= timing.tRCD) {
                nextState = wr_rd ? states.WRITE : states.READ;
                select_chip = 0; // Active during operation
                ca = wr_rd ? 0x0800 : 0x0000; // Backend use
                data_sink = wr_rd ? 'S' : 'Z'; // Correct DQS behavior
                updateOutput(`State: ${nextState}, select_chip: 0`);
                timer = 0;
            } else {
                updateOutput(`State: ${currentState}, Waiting ${timing.tRCD - timer} cycles for tRCD...`);
            }
            break;
        case states.READ:
            if (timer >= timing.tCL) {
                data_out = memory[addr] ? parseInt(memory[addr], 2) : 0; // Convert binary to decimal
                data_bus = data_out.toString(16).padStart(16, '0'); // Display as hex
                data_sink = 'S'; // Strobe active
                updateOutput(`State: ${currentState}, Data read: 0x${data_bus}, completion read/write: 1`);
                nextState = states.PRECHARGE;
                ack = 1;
                timer = 0;
            } else {
                updateOutput(`State: ${currentState}, Waiting ${timing.tCL - timer} cycles for tCL...`);
            }
            break;
        case states.WRITE:
            if (timer >= timing.tWR) {
                memory[addr] = data_in; // Store as binary
                data_bus = parseInt(data_in, 2).toString(16).padStart(16, '0'); // Display as hex
                data_sink = 'S'; // Strobe active
                updateOutput(`State: ${currentState}, Data written: 0x${data_bus}, completion read/write: 1`);
                nextState = states.PRECHARGE;
                ack = 1;
                timer = 0;
                updateMemoryView();
            } else {
                updateOutput(`State: ${currentState}, Waiting ${timing.tWR - timer} cycles for tWR...`);
            }
            break;
        case states.PRECHARGE:
            if (timer >= timing.tRP) {
                select_chip = 0; // Active during precharge
                ca = 0x2000; // Backend use
                data_bus = 'Z';
                data_sink = 'Z'; // Strobe inactive
                updateOutput(`State: ${currentState}, select_chip: 0, CA: PRECHARGE`);
                nextState = states.IDLE;
                ready = 1;
                timer = 0;
            } else {
                updateOutput(`State: ${currentState}, Waiting ${timing.tRP - timer} cycles for tRP...`);
            }
            break;
    }

    currentState = nextState;
    if (ack && currentState === states.PRECHARGE) {
        select_chip = 1; // Deselect after completion
        updateOutput('Request completed.');
        if (autoRunning) setTimeout(stepSimulation, 500);
    } else if (autoRunning && currentState !== states.IDLE) {
        setTimeout(stepSimulation, 500);
    }
    updateStatus();
    drawTimingDiagram();
}

function exportLog() {
    const output = document.getElementById('output').innerHTML.replace(/<br>/g, '\n');
    const blob = new Blob([output], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'simulation_log.txt';
    a.click();
    URL.revokeObjectURL(url);
}

document.addEventListener('DOMContentLoaded', () => {
    document.getElementById('reset-btn').addEventListener('click', () => {
        autoRunning = false;
        resetSimulation();
    });
    document.getElementById('memory-reset-btn').addEventListener('click', () => {
        autoRunning = false;
        memoryReset();
    });
    document.getElementById('write-btn').addEventListener('click', () => startRequest(true));
    document.getElementById('read-btn').addEventListener('click', () => startRequest(false));
    document.getElementById('step-btn').addEventListener('click', stepSimulation);
    document.getElementById('auto-btn').addEventListener('click', () => {
        if (currentState === states.IDLE) {
            updateOutput('Error: Start a request first.');
            return;
        }
        autoRunning = true;
        stepSimulation();
    });
    document.getElementById('export-btn').addEventListener('click', exportLog);
    resetSimulation();
});