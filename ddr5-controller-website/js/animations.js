// Animation Constants
const ANIMATION_SPEED = 300; // Faster animations (was 800)
const COLORS = {
    dark: '#fff',
    light: '#000'
};

class Animation {
    constructor(canvasId, width = 1000, height = 500) {
        this.canvas = document.getElementById(canvasId);
        if (!this.canvas) {
            console.error(`Canvas with ID ${canvasId} not found`);
            return;
        }
        
        // Set explicit canvas dimensions
        this.canvas.width = width;
        this.canvas.height = height;
        this.canvas.style.width = `${width}px`;
        this.canvas.style.height = `${height}px`;
        
        this.ctx = this.canvas.getContext('2d');
        this.isPlaying = false;
        this.step = 0;
        
        // Get output element content if it exists
        const outputElement = document.getElementById('output');
        this.output = outputElement ? outputElement.innerHTML || '' : '';
        
        this.setupControls();
        this.drawInitial(); // Draw initial state
        
        // Start playing automatically for better user experience
        setTimeout(() => this.play(), 500);
        
        // Debug information
        console.log(`Initialized ${canvasId} with dimensions ${width}x${height}`);
    }

    setupControls() {
        const playBtn = document.getElementById(`play-${this.canvas.id.split('-')[0]}`);
        const pauseBtn = document.getElementById(`pause-${this.canvas.id.split('-')[0]}`);
        
        if (playBtn && pauseBtn) {
            playBtn.addEventListener('click', () => {
                console.log(`Play clicked for ${this.canvas.id}`);
                this.play();
            });
            pauseBtn.addEventListener('click', () => {
                console.log(`Pause clicked for ${this.canvas.id}`);
                this.pause();
            });
        } else {
            console.error(`Play/Pause buttons for ${this.canvas.id} not found`);
        }
    }

    play() {
        if (!this.isPlaying) {
            this.isPlaying = true;
            console.log(`Animation started for ${this.canvas.id}`);
            this.animate();
        }
    }

    pause() {
        this.isPlaying = false;
        console.log(`Animation paused for ${this.canvas.id}`);
    }

    drawArrow(fromX, fromY, toX, toY, label) {
        const headLength = 10;
        const angle = Math.atan2(toY - fromY, toX - fromX);
        
        // Draw the line
        this.ctx.beginPath();
        this.ctx.moveTo(fromX, fromY);
        this.ctx.lineTo(toX, toY);
        this.ctx.strokeStyle = document.documentElement.classList.contains('dark') ? '#fff' : '#000';
        this.ctx.lineWidth = 2;
        this.ctx.stroke();
        
        // Draw the arrowhead
        this.ctx.beginPath();
        this.ctx.moveTo(toX, toY);
        this.ctx.lineTo(toX - headLength * Math.cos(angle - Math.PI/6), toY - headLength * Math.sin(angle - Math.PI/6));
        this.ctx.lineTo(toX - headLength * Math.cos(angle + Math.PI/6), toY - headLength * Math.sin(angle + Math.PI/6));
        this.ctx.closePath();
        this.ctx.fillStyle = document.documentElement.classList.contains('dark') ? '#fff' : '#000';
        this.ctx.fill();
        
        // Draw the label
        this.ctx.font = '12px Arial';
        this.ctx.fillStyle = document.documentElement.classList.contains('dark') ? '#fff' : '#000';
        this.ctx.textAlign = 'center';
        this.ctx.fillText(label, (fromX + toX) / 2, (fromY + toY) / 2 - 10);
    }

    drawInitial() {
        if (!this.ctx) return;
        this.ctx.fillStyle = document.documentElement.classList.contains('dark') ? '#374151' : '#f8f8f8';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
    }

    animate() {
        if (!this.isPlaying || !this.ctx) return;
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        this.drawInitial();
        this.update();
        // Use requestAnimationFrame directly for smoother animations
        if (this.isPlaying) {
            setTimeout(() => requestAnimationFrame(() => this.animate()), ANIMATION_SPEED);
        }
    }
}

// 1. Controller FSM Simulator
class FSMAnimation extends Animation {
    constructor() {
        super('fsm-canvas');
        this.states = ['IDLE', 'RESET', 'ACTIVATE', 'READ/WRITE', 'PRECHARGE', 'REST_MEMORY'];
        this.stateColors = ['#3498db', '#e74c3c', '#2ecc71', '#f39c12', '#9b59b6', '#e67e22'];
        this.transitionSpeed = 0.25; // Faster transition (was 1)
    }

    update() {
        // Clear canvas
        this.ctx.fillStyle = document.documentElement.classList.contains('dark') ? '#374151' : '#f8f8f8';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        
        // Draw title
        this.ctx.font = 'bold 28px Arial';
        this.ctx.fillStyle = '#3498db';
        this.ctx.textAlign = 'center';
        this.ctx.fillText('DDR5 Controller FSM', this.canvas.width / 2, 50);
        
        const x = 150, y = 250, stepX = 150, boxSize = 100;
        
        // Draw states
        this.states.forEach((state, i) => {
            // Determine if state is active
            const isActive = Math.floor(this.step) === i;
            
            // Add shadow for active state
            if (isActive) {
                this.ctx.shadowColor = 'rgba(0, 0, 0, 0.5)';
                this.ctx.shadowBlur = 15;
                this.ctx.shadowOffsetX = 5;
                this.ctx.shadowOffsetY = 5;
            }
            
            // Draw state box
            this.ctx.fillStyle = isActive ? this.stateColors[i] : this.getLighterColor(this.stateColors[i]);
            this.ctx.fillRect(x + i * stepX, y - boxSize/2, boxSize, boxSize);
            
            // Reset shadow
            this.ctx.shadowColor = 'transparent';
            this.ctx.shadowBlur = 0;
            this.ctx.shadowOffsetX = 0;
            this.ctx.shadowOffsetY = 0;
            
            // Draw border
            this.ctx.strokeStyle = isActive ? '#000' : '#666';
            this.ctx.lineWidth = isActive ? 3 : 1;
            this.ctx.strokeRect(x + i * stepX, y - boxSize/2, boxSize, boxSize);
            
            // Draw state name
            this.ctx.font = isActive ? 'bold 16px Arial' : '14px Arial';
            this.ctx.fillStyle = isActive ? 'white' : 'black';
            this.ctx.textAlign = 'center';
            this.ctx.fillText(state, x + i * stepX + boxSize/2, y - 10);
            
            // Display signal states
            const signalValue = this.getSignalValue(i, this.step);
            this.ctx.fillText(`Signal: ${signalValue}`, x + i * stepX + boxSize/2, y + 20);
            
            // Draw transition arrows
            if (i < this.states.length - 1) {
                const arrowLabels = [
                    'Reset', 'Activate', 'Command', 'Data Transfer', 'Precharge', 'Complete'
                ];
                
                this.drawArrow(
                    x + i * stepX + boxSize, 
                    y, 
                    x + (i+1) * stepX, 
                    y, 
                    arrowLabels[i]
                );
            }
        });
        
        // Draw animated indicator for current transition
        if (this.step % 1 !== 0) {
            const currentState = Math.floor(this.step);
            const nextState = (currentState + 1) % this.states.length;
            
            // Calculate position along the arrow
            const progress = this.step - Math.floor(this.step);
            const startX = x + currentState * stepX + boxSize;
            const endX = x + (currentState + 1) * stepX;
            const indicatorX = startX + (endX - startX) * progress;
            
            // Draw moving indicator
            this.ctx.fillStyle = 'yellow';
            this.ctx.beginPath();
            this.ctx.arc(indicatorX, y, 8, 0, Math.PI * 2);
            this.ctx.fill();
            this.ctx.strokeStyle = 'black';
            this.ctx.lineWidth = 1;
            this.ctx.stroke();
        }
        
        // Draw timing information
        this.ctx.font = 'bold 20px Arial';
        this.ctx.fillStyle = COLORS[document.documentElement.classList.contains('dark') ? 'dark' : 'light'];
        this.ctx.textAlign = 'left';
        this.ctx.fillText('DDR5 Controller State Machine', 100, 350);
        
        // Explanation of controller states
        const stateFunctions = [
            "• IDLE: Controller waiting for commands",
            "• RESET: Initializing memory controller",
            "• ACTIVATE: Opening row for access (tRCD: 5 cycles)",
            "• READ/WRITE: Data transfer operation",
            "• PRECHARGE: Closing row (tRP: 5 cycles)",
            "• REST_MEMORY: Returning to idle state"
        ];
        
        this.ctx.font = '16px Arial';
        stateFunctions.forEach((func, i) => {
            this.ctx.fillStyle = this.stateColors[i];
            this.ctx.fillText(func, 120, 380 + i * 25);
        });
        
        // Increment step for animation - faster progression
        this.step = (this.step + this.transitionSpeed) % this.states.length;
    }
    
    getSignalValue(stateIndex, currentStep) {
        // Return signal values based on state
        const signals = ['1', '0', 'A', 'D', 'P', 'I'];
        if (Math.floor(currentStep) === stateIndex) {
            return signals[stateIndex];
        }
        return '-';
    }
    
    getLighterColor(hexColor) {
        // Convert hex to RGB
        let r = parseInt(hexColor.slice(1, 3), 16);
        let g = parseInt(hexColor.slice(3, 5), 16);
        let b = parseInt(hexColor.slice(5, 7), 16);
        
        // Lighten by mixing with white
        r = Math.floor(r + (255 - r) * 0.6);
        g = Math.floor(g + (255 - g) * 0.6);
        b = Math.floor(b + (255 - b) * 0.6);
        
        // Convert back to hex
        return `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`;
    }
}

// 2. Write Memory Operations
class WriteAnimation extends Animation {
    constructor() {
        super('write-canvas');
        this.flowSteps = [
            { name: "IDLE", desc: "Controller in idle state", color: "#3498db" },
            { name: "ACTIVATE", desc: "Select row address", color: "#e74c3c" },
            { name: "WRITE", desc: "Send write command", color: "#2ecc71" },
            { name: "DATA", desc: "Transfer data to memory", color: "#f39c12" },
            { name: "PRECHARGE", desc: "Close row", color: "#9b59b6" },
            { name: "IDLE", desc: "Operation complete", color: "#3498db" }
        ];
    }

    update() {
        // Clear and redraw
        this.ctx.fillStyle = document.documentElement.classList.contains('dark') ? '#374151' : '#f8f8f8';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        
        // Draw main title
        this.ctx.font = 'bold 28px Arial';
        this.ctx.fillStyle = '#2196F3';
        this.ctx.textAlign = 'center';
        this.ctx.fillText('DDR5 Write Operation Flow', this.canvas.width / 2, 50);
        
        // Draw flowchart
        const boxWidth = 160;
        const boxHeight = 80;
        const stepX = 170;
        const startX = 50;
        const y = 200;
        
        // Draw active step based on animation progress
        this.flowSteps.forEach((step, i) => {
            const isActive = i === this.step % this.flowSteps.length;
            
            // Draw box with shadow for 3D effect
            if (isActive) {
                this.ctx.shadowColor = 'rgba(0, 0, 0, 0.5)';
                this.ctx.shadowBlur = 15;
                this.ctx.shadowOffsetX = 5;
                this.ctx.shadowOffsetY = 5;
            }
            
            // Draw box
            this.ctx.fillStyle = isActive ? step.color : this.getLighterColor(step.color);
            this.ctx.fillRect(startX + i * stepX, y - boxHeight/2, boxWidth, boxHeight);
            
            // Reset shadow
            this.ctx.shadowColor = 'transparent';
            this.ctx.shadowBlur = 0;
            this.ctx.shadowOffsetX = 0;
            this.ctx.shadowOffsetY = 0;
            
            // Draw border
            this.ctx.strokeStyle = isActive ? '#000' : '#666';
            this.ctx.lineWidth = isActive ? 3 : 1;
            this.ctx.strokeRect(startX + i * stepX, y - boxHeight/2, boxWidth, boxHeight);
            
            // Draw text
            this.ctx.font = isActive ? 'bold 20px Arial' : 'bold 16px Arial';
            this.ctx.fillStyle = isActive ? 'white' : 'black';
            this.ctx.textAlign = 'center';
            this.ctx.fillText(step.name, startX + i * stepX + boxWidth/2, y - 10);
            
            this.ctx.font = isActive ? '16px Arial' : '14px Arial';
            this.ctx.fillText(step.desc, startX + i * stepX + boxWidth/2, y + 15);
            
            // Draw timing information for active process
            if (isActive) {
                let timingInfo = "";
                if (i === 1) timingInfo = "tRCD: 5 cycles";
                else if (i === 2) timingInfo = "Write Latency";
                else if (i === 3) timingInfo = "tWR: 6 cycles";
                else if (i === 4) timingInfo = "tRP: 5 cycles";
                
                if (timingInfo) {
                    this.ctx.font = '14px Arial';
                    this.ctx.fillStyle = 'white';
                    this.ctx.fillText(timingInfo, startX + i * stepX + boxWidth/2, y + 35);
                }
            }
            
            // Draw arrow to next step
            if (i < this.flowSteps.length - 1) {
                const arrowLabels = [
                    'Select chip', 'tRCD cycles', 'Data bus active', 
                    'tWR cycles', 'Ready'
                ];
                
                this.drawArrow(
                    startX + i * stepX + boxWidth, 
                    y, 
                    startX + (i+1) * stepX, 
                    y, 
                    arrowLabels[i]
                );
            }
        });
        
        // Draw animated indicator for current cycle
        if (this.step % this.flowSteps.length > 0) {
            const currentStep = this.step % this.flowSteps.length;
            const previousStep = currentStep - 1;
            
            // Calculate position along the arrow
            const arrowStartX = startX + previousStep * stepX + boxWidth;
            const arrowEndX = startX + currentStep * stepX;
            const progress = (this.step - Math.floor(this.step)) * 3 % 1; // Animation sub-step progress
            const indicatorX = arrowStartX + (arrowEndX - arrowStartX) * progress;
            
            // Draw moving indicator
            this.ctx.fillStyle = 'yellow';
            this.ctx.beginPath();
            this.ctx.arc(indicatorX, y, 8, 0, Math.PI * 2);
            this.ctx.fill();
            this.ctx.strokeStyle = 'black';
            this.ctx.lineWidth = 1;
            this.ctx.stroke();
        }
        
        // Draw title for DDR5 features
        this.ctx.font = 'bold 22px Arial';
        this.ctx.fillStyle = COLORS[document.documentElement.classList.contains('dark') ? 'dark' : 'light'];
        this.ctx.textAlign = 'left';
        this.ctx.fillText('DDR5 Write Features:', 50, 320);
        
        // Draw DDR5 write features
        const features = [
            "• Double data rate - transfers data on both rising and falling clock edges",
            "• 16n prefetch - fetches 16 data bits per clock cycle (vs. 8n in DDR4)",
            "• Decision Feedback Equalization (DFE) for signal quality",
            "• On-die ECC for data reliability",
            "• Same Bank Refresh for improved efficiency"
        ];
        
        this.ctx.font = '18px Arial';
        features.forEach((feature, i) => {
            this.ctx.fillText(feature, 70, 360 + i * 28);
        });
        
        // Draw write operation stats
        this.ctx.textAlign = 'right';
        this.ctx.font = 'bold 18px Arial';
        this.ctx.fillText('Write Operation Stats:', this.canvas.width - 50, 320);
        
        const stats = [
            "• Typical Write Latency: 16-20 cycles",
            "• Data Rate: Up to 6400 MT/s",
            "• Burst Length: 16 (BL16)",
            "• Voltage: 1.1V (vs. 1.2V in DDR4)",
            "• Multiple channels for parallel operation"
        ];
        
        this.ctx.font = '18px Arial';
        stats.forEach((stat, i) => {
            this.ctx.fillText(stat, this.canvas.width - 70, 360 + i * 28);
        });
        
        // Increment step for animation
        this.step = (this.step + 0.25) % (this.flowSteps.length * 3); // Faster animation speed (was 0.1)
    }
    
    getLighterColor(hexColor) {
        // Convert hex to RGB
        let r = parseInt(hexColor.slice(1, 3), 16);
        let g = parseInt(hexColor.slice(3, 5), 16);
        let b = parseInt(hexColor.slice(5, 7), 16);
        
        // Lighten by mixing with white
        r = Math.floor(r + (255 - r) * 0.6);
        g = Math.floor(g + (255 - g) * 0.6);
        b = Math.floor(b + (255 - b) * 0.6);
        
        // Convert back to hex
        return `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`;
    }
}

// 3. Read Memory Operations
class ReadAnimation extends Animation {
    constructor() {
        super('read-canvas');
        this.flowSteps = [
            { name: "IDLE", desc: "Controller in idle state", color: "#3498db" },
            { name: "ACTIVATE", desc: "Select row address", color: "#e74c3c" },
            { name: "READ", desc: "Send read command", color: "#2ecc71" },
            { name: "LATENCY", desc: "Wait tCL cycles", color: "#f39c12" },
            { name: "DATA", desc: "Receive data from memory", color: "#9b59b6" },
            { name: "PRECHARGE", desc: "Close row", color: "#e67e22" },
            { name: "IDLE", desc: "Operation complete", color: "#3498db" }
        ];
    }

    update() {
        // Clear and redraw
        this.ctx.fillStyle = document.documentElement.classList.contains('dark') ? '#374151' : '#f8f8f8';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        
        // Draw main title
        this.ctx.font = 'bold 28px Arial';
        this.ctx.fillStyle = '#9C27B0';
        this.ctx.textAlign = 'center';
        this.ctx.fillText('DDR5 Read Operation Flow', this.canvas.width / 2, 50);
        
        // Draw flowchart
        const boxWidth = 140;
        const boxHeight = 80;
        const stepX = 145;
        const startX = 30;
        const y = 200;
        
        // Draw active step based on animation progress
        this.flowSteps.forEach((step, i) => {
            const isActive = i === this.step % this.flowSteps.length;
            
            // Draw box with shadow for 3D effect
            if (isActive) {
                this.ctx.shadowColor = 'rgba(0, 0, 0, 0.5)';
                this.ctx.shadowBlur = 15;
                this.ctx.shadowOffsetX = 5;
                this.ctx.shadowOffsetY = 5;
            }
            
            // Draw box
            this.ctx.fillStyle = isActive ? step.color : this.getLighterColor(step.color);
            this.ctx.fillRect(startX + i * stepX, y - boxHeight/2, boxWidth, boxHeight);
            
            // Reset shadow
            this.ctx.shadowColor = 'transparent';
            this.ctx.shadowBlur = 0;
            this.ctx.shadowOffsetX = 0;
            this.ctx.shadowOffsetY = 0;
            
            // Draw border
            this.ctx.strokeStyle = isActive ? '#000' : '#666';
            this.ctx.lineWidth = isActive ? 3 : 1;
            this.ctx.strokeRect(startX + i * stepX, y - boxHeight/2, boxWidth, boxHeight);
            
            // Draw text
            this.ctx.font = isActive ? 'bold 20px Arial' : 'bold 16px Arial';
            this.ctx.fillStyle = isActive ? 'white' : 'black';
            this.ctx.textAlign = 'center';
            this.ctx.fillText(step.name, startX + i * stepX + boxWidth/2, y - 10);
            
            this.ctx.font = isActive ? '16px Arial' : '14px Arial';
            this.ctx.fillText(step.desc, startX + i * stepX + boxWidth/2, y + 15);
            
            // Draw timing information for active process
            if (isActive) {
                let timingInfo = "";
                if (i === 1) timingInfo = "tRCD: 5 cycles";
                else if (i === 2) timingInfo = "Read Command";
                else if (i === 3) timingInfo = "tCL: 5 cycles";
                else if (i === 4) timingInfo = "Data Transfer";
                else if (i === 5) timingInfo = "tRP: 5 cycles";
                
                if (timingInfo) {
                    this.ctx.font = '14px Arial';
                    this.ctx.fillStyle = 'white';
                    this.ctx.fillText(timingInfo, startX + i * stepX + boxWidth/2, y + 35);
                }
            }
            
            // Draw arrow to next step
            if (i < this.flowSteps.length - 1) {
                const arrowLabels = [
                    'Select chip', 'tRCD cycles', 'Wait tCL', 
                    'DQS strobe', 'Data received', 'Ready'
                ];
                
                this.drawArrow(
                    startX + i * stepX + boxWidth, 
                    y, 
                    startX + (i+1) * stepX, 
                    y, 
                    arrowLabels[i]
                );
            }
        });
        
        // Draw animated indicator for current cycle
        if (this.step % this.flowSteps.length > 0) {
            const currentStep = this.step % this.flowSteps.length;
            const previousStep = currentStep - 1;
            
            // Calculate position along the arrow
            const arrowStartX = startX + previousStep * stepX + boxWidth;
            const arrowEndX = startX + currentStep * stepX;
            const progress = (this.step - Math.floor(this.step)) * 3 % 1; // Animation sub-step progress
            const indicatorX = arrowStartX + (arrowEndX - arrowStartX) * progress;
            
            // Draw moving indicator
            this.ctx.fillStyle = 'yellow';
            this.ctx.beginPath();
            this.ctx.arc(indicatorX, y, 8, 0, Math.PI * 2);
            this.ctx.fill();
            this.ctx.strokeStyle = 'black';
            this.ctx.lineWidth = 1;
            this.ctx.stroke();
        }
        
        // Draw title for DDR5 features
        this.ctx.font = 'bold 22px Arial';
        this.ctx.fillStyle = COLORS[document.documentElement.classList.contains('dark') ? 'dark' : 'light'];
        this.ctx.textAlign = 'left';
        this.ctx.fillText('DDR5 Read Features:', 50, 320);
        
        // Draw DDR5 read features
        const features = [
            "• Same Bank Refresh for improved latency",
            "• Independent channel architecture",
            "• Lower read latency compared to write operations",
            "• Higher bandwidth (up to 6400 MT/s)",
            "• Enhanced reliability with on-die ECC"
        ];
        
        this.ctx.font = '18px Arial';
        features.forEach((feature, i) => {
            this.ctx.fillText(feature, 70, 360 + i * 28);
        });
        
        // Draw read operation stats
        this.ctx.textAlign = 'right';
        this.ctx.font = 'bold 18px Arial';
        this.ctx.fillText('Read Operation Stats:', this.canvas.width - 50, 320);
        
        const stats = [
            "• Typical Read Latency: 14-18 cycles",
            "• Prefetch: 16n (16 bits per clock)",
            "• Enhanced clock frequency (up to 3200 MHz)",
            "• 8 bank groups (vs. 4 in DDR4)",
            "• Improved Signal-to-Noise Ratio (SNR)"
        ];
        
        this.ctx.font = '18px Arial';
        stats.forEach((stat, i) => {
            this.ctx.fillText(stat, this.canvas.width - 70, 360 + i * 28);
        });
        
        // Increment step for animation
        this.step = (this.step + 0.25) % (this.flowSteps.length * 3); // Faster animation speed (was 0.1)
    }
    
    getLighterColor(hexColor) {
        // Convert hex to RGB
        let r = parseInt(hexColor.slice(1, 3), 16);
        let g = parseInt(hexColor.slice(3, 5), 16);
        let b = parseInt(hexColor.slice(5, 7), 16);
        
        // Lighten by mixing with white
        r = Math.floor(r + (255 - r) * 0.6);
        g = Math.floor(g + (255 - g) * 0.6);
        b = Math.floor(b + (255 - b) * 0.6);
        
        // Convert back to hex
        return `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`;
    }
}

// 4. Total Time Taken
class TimeAnimation extends Animation {
    constructor() {
        super('time-canvas');
        this.timing = {
            tRCD: 5, // Row to Column Delay
            tCL: 5,  // CAS Latency
            tWR: 6,  // Write Recovery
            tRP: 5   // Row Precharge
        };
        this.currentTiming = 'tRCD';
        this.cycleCount = 0;
        this.maxCycles = 30;
        this.operations = ['READ', 'WRITE'];
        this.currentOp = 0;
    }

    update() {
        // Clear canvas
        this.ctx.fillStyle = document.documentElement.classList.contains('dark') ? '#374151' : '#f8f8f8';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        
        // Title
        this.ctx.font = 'bold 28px Arial';
        this.ctx.fillStyle = '#4527A0';
        this.ctx.textAlign = 'center';
        this.ctx.fillText('DDR5 Timing Cycles', this.canvas.width / 2, 50);
        
        // Current operation
        const operation = this.operations[this.currentOp];
        this.ctx.font = 'bold 22px Arial';
        this.ctx.fillText(`${operation} Operation - Memory Cycles`, this.canvas.width / 2, 90);
        
        // Draw timing diagram
        const startX = 100;
        const startY = 180;
        const barHeight = 50;
        const barWidth = 800;
        
        // Draw timeline
        this.ctx.strokeStyle = COLORS[document.documentElement.classList.contains('dark') ? 'dark' : 'light'];
        this.ctx.lineWidth = 3;
        this.ctx.beginPath();
        this.ctx.moveTo(startX, startY);
        this.ctx.lineTo(startX + barWidth, startY);
        this.ctx.stroke();
        
        // Draw 10 time markers
        this.ctx.lineWidth = 1;
        this.ctx.font = '14px Arial';
        for (let i = 0; i <= 10; i++) {
            const x = startX + (barWidth / 10) * i;
            this.ctx.beginPath();
            this.ctx.moveTo(x, startY - 5);
            this.ctx.lineTo(x, startY + 5);
            this.ctx.stroke();
            this.ctx.textAlign = 'center';
            this.ctx.fillText(i * 3 + ' cycle', x, startY + 20);
        }
        
        // Draw cycle counter
        this.ctx.fillStyle = '#4527A0';
        this.ctx.beginPath();
        this.ctx.arc(startX + (barWidth / this.maxCycles) * this.cycleCount, startY, 12, 0, Math.PI * 2);
        this.ctx.fill();
        this.ctx.strokeStyle = 'white';
        this.ctx.lineWidth = 2;
        this.ctx.stroke();
        
        // Draw "Current Cycle" label at the counter position
        const cycleX = startX + (barWidth / this.maxCycles) * this.cycleCount;
        this.ctx.fillStyle = '#4527A0';
        this.ctx.font = 'bold 14px Arial';
        this.ctx.textAlign = 'center';
        this.ctx.fillText(`Cycle ${this.cycleCount}`, cycleX, startY - 20);
        
        // Draw timing phases
        const timings = operation === 'READ' 
            ? ['ACTIVATE (tRCD)', 'READ (tCL)', 'DATA TRANSFER', 'PRECHARGE (tRP)']
            : ['ACTIVATE (tRCD)', 'WRITE (tWR)', 'DATA TRANSFER', 'PRECHARGE (tRP)'];
            
        const durations = operation === 'READ'
            ? [this.timing.tRCD, this.timing.tCL, 3, this.timing.tRP]
            : [this.timing.tRCD, this.timing.tWR, 3, this.timing.tRP];
            
        const colors = ['#FF9800', '#4CAF50', '#2196F3', '#9C27B0'];
        const gradientColors = [
            ['#FF9800', '#FFC107'], 
            ['#4CAF50', '#8BC34A'], 
            ['#2196F3', '#03A9F4'], 
            ['#9C27B0', '#E040FB']
        ];
        
        let currentX = startX;
        let totalCycles = 0;
        
        timings.forEach((phase, i) => {
            const width = (barWidth / 30) * durations[i];
            
            // Highlight current phase
            const isCurrentPhase = totalCycles <= this.cycleCount && this.cycleCount < totalCycles + durations[i];
            
            // Create gradient for phase bar
            const gradient = this.ctx.createLinearGradient(
                currentX, startY + 30,
                currentX + width, startY + 30 + barHeight
            );
            gradient.addColorStop(0, gradientColors[i][0]);
            gradient.addColorStop(1, gradientColors[i][1]);
            
            // Draw phase bar with 3D effect
            if (isCurrentPhase) {
                this.ctx.shadowColor = 'rgba(0, 0, 0, 0.5)';
                this.ctx.shadowBlur = 15;
                this.ctx.shadowOffsetX = 3;
                this.ctx.shadowOffsetY = 3;
                this.ctx.globalAlpha = 1.0;
            } else {
                this.ctx.shadowColor = 'transparent';
                this.ctx.shadowBlur = 0;
                this.ctx.shadowOffsetX = 0;
                this.ctx.shadowOffsetY = 0;
                this.ctx.globalAlpha = 0.7;
            }
            
            // Draw phase bar
            this.ctx.fillStyle = gradient;
            this.ctx.fillRect(currentX, startY + 30, width, barHeight);
            
            // Draw phase border
            this.ctx.strokeStyle = isCurrentPhase ? '#000' : '#666';
            this.ctx.lineWidth = isCurrentPhase ? 2 : 1;
            this.ctx.strokeRect(currentX, startY + 30, width, barHeight);
            
            // Draw phase name
            this.ctx.fillStyle = COLORS[document.documentElement.classList.contains('dark') ? 'dark' : 'light'];
            this.ctx.textAlign = 'center';
            this.ctx.font = isCurrentPhase ? 'bold 16px Arial' : '14px Arial';
            this.ctx.fillText(phase, currentX + width/2, startY + 30 + barHeight + 20);
            
            // Draw cycle count in the center of the phase bar
            this.ctx.fillStyle = 'white';
            this.ctx.font = 'bold 16px Arial';
            this.ctx.fillText(`${durations[i]} cycles`, currentX + width/2, startY + 30 + barHeight/2 + 5);
            
            // Draw cycle markers within phase
            if (durations[i] > 1) {
                this.ctx.strokeStyle = 'rgba(255, 255, 255, 0.5)';
                this.ctx.lineWidth = 1;
                
                for (let j = 1; j < durations[i]; j++) {
                    const cycleX = currentX + (width / durations[i]) * j;
                    this.ctx.beginPath();
                    this.ctx.moveTo(cycleX, startY + 30);
                    this.ctx.lineTo(cycleX, startY + 30 + barHeight);
                    this.ctx.stroke();
                }
            }
            
            // Store cycle information
            totalCycles += durations[i];
            currentX += width;
        });
        
        // Draw timing information
        this.ctx.textAlign = 'left';
        this.ctx.font = 'bold 20px Arial';
        this.ctx.fillStyle = COLORS[document.documentElement.classList.contains('dark') ? 'dark' : 'light'];
        this.ctx.fillText('DDR5 Timing Parameters:', 100, 350);
        
        const timingInfo = [
            `tRCD (Row to Column Delay): ${this.timing.tRCD} cycles`,
            `tCL (CAS Latency): ${this.timing.tCL} cycles`,
            `tWR (Write Recovery): ${this.timing.tWR} cycles`,
            `tRP (Row Precharge): ${this.timing.tRP} cycles`,
            `Total ${operation} Cycles: ${totalCycles} cycles`
        ];
        
        this.ctx.font = '16px Arial';
        timingInfo.forEach((info, i) => {
            this.ctx.fillText(info, 120, 380 + i * 25);
        });
        
        // Additional DDR5 timing info
        this.ctx.font = 'bold 20px Arial';
        this.ctx.fillText("DDR5 vs DDR4 Timing Improvements:", 520, 350);
        
        const improvements = [
            "• Reduced tRCD and tRP compared to DDR4",
            "• Decision Feedback Equalization for signal integrity",
            "• Same Bank Refresh for reduced latency",
            "• Higher bus utilization through dual channels"
        ];
        
        this.ctx.font = '16px Arial';
        improvements.forEach((imp, i) => {
            this.ctx.fillText(imp, 540, 380 + i * 25);
        });
        
        // Update animation state
        this.cycleCount = (this.cycleCount + 0.6) % this.maxCycles; // Faster animation speed (was 0.2)
        
        // Switch operation type occasionally
        if (this.cycleCount === 0) {
            this.currentOp = (this.currentOp + 1) % this.operations.length;
        }
    }
}

// 5. DDR4 vs DDR5 Comparative Animation
class ComparativeAnimation extends Animation {
    constructor() {
        super('comparative-canvas');
        this.comparisons = [
            { feature: "Prefetch", ddr4: "8n", ddr5: "16n", improvement: "+100%", icon: "📊" },
            { feature: "Data Rate", ddr4: "3200 MT/s", ddr5: "6400 MT/s", improvement: "+100%", icon: "⚡" },
            { feature: "Channel Architecture", ddr4: "Single", ddr5: "Dual (per DIMM)", improvement: "2x bandwidth", icon: "🔄" },
            { feature: "DIMM Voltage", ddr4: "1.2V", ddr5: "1.1V", improvement: "-8.3% power", icon: "⚡" },
            { feature: "Bank Groups", ddr4: "4", ddr5: "8", improvement: "+100%", icon: "📦" },
            { feature: "Error Correction", ddr4: "Optional", ddr5: "On-die ECC", improvement: "Better reliability", icon: "🛡️" }
        ];
        this.highlights = 0;
        this.animProgress = 0;
    }

    update() {
        // Clear canvas
        this.ctx.fillStyle = document.documentElement.classList.contains('dark') ? '#374151' : '#f8f8f8';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        
        // Title
        this.ctx.font = 'bold 28px Arial';
        this.ctx.fillStyle = '#E91E63';
        this.ctx.textAlign = 'center';
        this.ctx.fillText('DDR4 vs DDR5 Comparison', this.canvas.width / 2, 50);
        
        // Draw comparison table
        const startX = 80;
        const startY = 110;
        const rowHeight = 60;
        const colWidths = [220, 170, 170, 190];
        
        // Draw headers
        const headers = ["Feature", "DDR4", "DDR5", "Improvement"];
        this.ctx.fillStyle = '#E91E63';
        this.ctx.font = 'bold 20px Arial';
        this.ctx.textAlign = 'center';
        
        let currentX = startX;
        headers.forEach((header, i) => {
            this.ctx.fillText(header, currentX + colWidths[i]/2, startY);
            currentX += colWidths[i];
        });
        
        // Draw header underline
        this.ctx.strokeStyle = '#E91E63';
        this.ctx.lineWidth = 2;
        this.ctx.beginPath();
        this.ctx.moveTo(startX, startY + 10);
        this.ctx.lineTo(startX + colWidths.reduce((a, b) => a + b, 0), startY + 10);
        this.ctx.stroke();
        
        // Draw comparison rows
        this.ctx.font = '16px Arial';
        this.comparisons.forEach((comparison, i) => {
            const rowY = startY + 40 + i * rowHeight;
            
            // Highlight current row based on animation step
            const isHighlighted = i === this.highlights % this.comparisons.length;
            
            // Draw row background
            if (isHighlighted) {
                const gradient = this.ctx.createLinearGradient(
                    startX, rowY - 25, 
                    startX + colWidths.reduce((a, b) => a + b, 0), rowY + 25
                );
                gradient.addColorStop(0, document.documentElement.classList.contains('dark') ? '#4A5568' : '#F5F5F5');
                gradient.addColorStop(0.5, document.documentElement.classList.contains('dark') ? '#6B7280' : '#FFFFFF');
                gradient.addColorStop(1, document.documentElement.classList.contains('dark') ? '#4A5568' : '#F5F5F5');
                
                this.ctx.fillStyle = gradient;
                this.ctx.fillRect(
                    startX, rowY - 25, 
                    colWidths.reduce((a, b) => a + b, 0), rowHeight
                );
            }
            
            // Draw row separator
            this.ctx.strokeStyle = document.documentElement.classList.contains('dark') ? '#6B7280' : '#E0E0E0';
            this.ctx.lineWidth = 1;
            this.ctx.beginPath();
            this.ctx.moveTo(startX, rowY + rowHeight/2);
            this.ctx.lineTo(startX + colWidths.reduce((a, b) => a + b, 0), rowY + rowHeight/2);
            this.ctx.stroke();
            
            // Draw the feature name with icon
            this.ctx.fillStyle = isHighlighted ? '#E91E63' : COLORS[document.documentElement.classList.contains('dark') ? 'dark' : 'light'];
            this.ctx.textAlign = 'left';
            this.ctx.font = isHighlighted ? 'bold 18px Arial' : '16px Arial';
            this.ctx.fillText(`${comparison.icon} ${comparison.feature}`, startX + 10, rowY);
            
            // Draw DDR4 value
            this.ctx.fillStyle = COLORS[document.documentElement.classList.contains('dark') ? 'dark' : 'light'];
            this.ctx.textAlign = 'center';
            this.ctx.font = '16px Arial';
            this.ctx.fillText(comparison.ddr4, startX + colWidths[0] + colWidths[1]/2, rowY);
            
            // Draw arrow between DDR4 and DDR5
            if (isHighlighted) {
                const arrowX = startX + colWidths[0] + colWidths[1];
                this.ctx.fillStyle = '#2196F3';
                this.ctx.beginPath();
                this.ctx.moveTo(arrowX - 20, rowY);
                this.ctx.lineTo(arrowX + 20, rowY);
                this.ctx.lineTo(arrowX + 10, rowY - 10);
                this.ctx.moveTo(arrowX + 20, rowY);
                this.ctx.lineTo(arrowX + 10, rowY + 10);
                this.ctx.stroke();
                
                // Animate the arrow
                const pulseSize = Math.sin(this.animProgress * 0.2) * 3;
                this.ctx.fillStyle = '#2196F3';
                this.ctx.beginPath();
                this.ctx.arc(arrowX + 20, rowY, 5 + pulseSize, 0, Math.PI * 2);
                this.ctx.fill();
            }
            
            // Draw DDR5 value with emphasis
            this.ctx.fillStyle = isHighlighted ? '#4CAF50' : COLORS[document.documentElement.classList.contains('dark') ? 'dark' : 'light'];
            this.ctx.font = isHighlighted ? 'bold 18px Arial' : '16px Arial';
            this.ctx.fillText(comparison.ddr5, startX + colWidths[0] + colWidths[1] + colWidths[2]/2, rowY);
            
            // Draw improvement with animated highlight for active row
            if (isHighlighted) {
                // Draw with glow effect
                this.ctx.shadowColor = '#2196F3';
                this.ctx.shadowBlur = 10;
                this.ctx.shadowOffsetX = 0;
                this.ctx.shadowOffsetY = 0;
            }
            
            this.ctx.fillStyle = isHighlighted ? '#2196F3' : COLORS[document.documentElement.classList.contains('dark') ? 'dark' : 'light'];
            this.ctx.fillText(
                comparison.improvement, 
                startX + colWidths[0] + colWidths[1] + colWidths[2] + colWidths[3]/2, 
                rowY
            );
            
            // Reset shadow
            this.ctx.shadowColor = 'transparent';
            this.ctx.shadowBlur = 0;
        });
        
        // Draw application benefits section title
        this.ctx.shadowColor = 'rgba(0, 0, 0, 0.3)';
        this.ctx.shadowBlur = 5;
        this.ctx.shadowOffsetX = 2;
        this.ctx.shadowOffsetY = 2;
        
        this.ctx.fillStyle = COLORS[document.documentElement.classList.contains('dark') ? 'dark' : 'light'];
        this.ctx.textAlign = 'center';
        this.ctx.font = 'bold 22px Arial';
        this.ctx.fillText("Real-world Benefits of DDR5 over DDR4", this.canvas.width / 2, startY + 40 + this.comparisons.length * rowHeight + 40);
        
        // Reset shadow
        this.ctx.shadowColor = 'transparent';
        this.ctx.shadowBlur = 0;
        this.ctx.shadowOffsetX = 0;
        this.ctx.shadowOffsetY = 0;
        
        // Draw benefits in two columns
        this.ctx.font = '16px Arial';
        this.ctx.textAlign = 'left';
        
        const leftBenefits = [
            "🎮 Faster game loading times",
            "🖥️ Smoother multitasking",
            "📊 Better data processing for AI/ML"
        ];
        
        const rightBenefits = [
            "🔋 Higher energy efficiency",
            "💻 Reduced system latency",
            "🚀 Improved application responsiveness"
        ];
        
        leftBenefits.forEach((benefit, i) => {
            this.ctx.fillText(
                benefit, 
                this.canvas.width / 4, 
                startY + 40 + this.comparisons.length * rowHeight + 80 + i * 30
            );
        });
        
        rightBenefits.forEach((benefit, i) => {
            this.ctx.fillText(
                benefit, 
                this.canvas.width * 3 / 4 - 120, 
                startY + 40 + this.comparisons.length * rowHeight + 80 + i * 30
            );
        });
        
        // Update animation state
        this.animProgress += 3; // Faster animation speed (was 1)
        if (this.animProgress % 30 === 0) {
            this.highlights = (this.highlights + 1) % this.comparisons.length;
        }
    }
}

// 6. Real-world Use Case Animation
class UseCaseAnimation extends Animation {
    constructor() {
        super('usecase-canvas');
        this.useCases = [
            { name: "Gaming", description: "Fast texture loading, low latency" },
            { name: "Cloud Computing", description: "High bandwidth, energy efficiency" },
            { name: "AI/Machine Learning", description: "Massive data processing" },
            { name: "Data Centers", description: "Lower power consumption, higher density" },
            { name: "HPC (High Performance Computing)", description: "Scientific simulations, complex calculations" },
            { name: "Mobile Devices", description: "Low power, high performance" }
        ];
        this.currentUseCase = 0;
        this.animFrame = 0;
    }

    update() {
        // Clear canvas
        this.ctx.fillStyle = document.documentElement.classList.contains('dark') ? '#374151' : '#f8f8f8';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        
        // Title
        this.ctx.font = 'bold 20px Arial';
        this.ctx.fillStyle = '#00ACC1';
        this.ctx.textAlign = 'center';
        this.ctx.fillText('DDR5 Real-world Applications', this.canvas.width / 2, 40);
        
        // Get current use case
        const useCase = this.useCases[this.currentUseCase];
        
        // Draw central node
        this.ctx.fillStyle = '#00ACC1';
        this.ctx.beginPath();
        this.ctx.arc(this.canvas.width / 2, this.canvas.height / 2, 80, 0, Math.PI * 2);
        this.ctx.fill();
        
        // Draw central label
        this.ctx.fillStyle = 'white';
        this.ctx.font = 'bold 18px Arial';
        this.ctx.textAlign = 'center';
        this.ctx.fillText("DDR5", this.canvas.width / 2, this.canvas.height / 2 - 5);
        this.ctx.font = '14px Arial';
        this.ctx.fillText("Memory", this.canvas.width / 2, this.canvas.height / 2 + 15);
        
        // Draw each use case with animation
        const radius = 180;
        const angleStep = (Math.PI * 2) / this.useCases.length;
        
        this.useCases.forEach((uc, i) => {
            const angle = i * angleStep;
            const x = this.canvas.width / 2 + radius * Math.cos(angle);
            const y = this.canvas.height / 2 + radius * Math.sin(angle);
            
            // Determine if this is the currently highlighted use case
            const isActive = i === this.currentUseCase;
            
            // Draw connection line with animation
            this.ctx.strokeStyle = isActive ? '#00ACC1' : 'rgba(0, 172, 193, 0.3)';
            this.ctx.lineWidth = isActive ? 3 : 1;
            
            if (isActive) {
                // Animate the connection line with dashes
                this.ctx.setLineDash([5, 5]);
                this.ctx.lineDashOffset = -this.animFrame / 2;
            } else {
                this.ctx.setLineDash([]);
            }
            
            this.ctx.beginPath();
            this.ctx.moveTo(this.canvas.width / 2, this.canvas.height / 2);
            this.ctx.lineTo(x, y);
            this.ctx.stroke();
            this.ctx.setLineDash([]);
            
            // Draw use case node
            this.ctx.fillStyle = isActive ? '#00ACC1' : 'rgba(0, 172, 193, 0.3)';
            this.ctx.beginPath();
            this.ctx.arc(x, y, 40, 0, Math.PI * 2);
            this.ctx.fill();
            
            // Draw use case label
            this.ctx.fillStyle = 'white';
            this.ctx.font = isActive ? 'bold 14px Arial' : '12px Arial';
            this.ctx.textAlign = 'center';
            this.ctx.fillText(uc.name, x, y);
        });
        
        // Draw description of current use case
        this.ctx.fillStyle = COLORS[document.documentElement.classList.contains('dark') ? 'dark' : 'light'];
        this.ctx.font = 'bold 18px Arial';
        this.ctx.textAlign = 'center';
        this.ctx.fillText(useCase.name, this.canvas.width / 2, 80);
        
        this.ctx.font = '16px Arial';
        this.ctx.fillText(useCase.description, this.canvas.width / 2, 110);
        
        // Draw specific DDR5 benefits for this use case
        const benefits = this.getUseCaseBenefits(useCase.name);
        
        this.ctx.textAlign = 'left';
        this.ctx.font = 'bold 16px Arial';
        this.ctx.fillText("DDR5 Benefits:", 50, 340);
        
        this.ctx.font = '14px Arial';
        benefits.forEach((benefit, i) => {
            this.ctx.fillText(benefit, 70, 370 + i * 20);
        });
        
        // Update animation state
        this.animFrame = (this.animFrame + 3) % 60; // Faster animation speed (was 1)
        
        // Change use case every 60 frames
        if (this.animFrame === 0) {
            this.currentUseCase = (this.currentUseCase + 1) % this.useCases.length;
        }
    }
    
    getUseCaseBenefits(useCase) {
        switch(useCase) {
            case "Gaming":
                return [
                    "• Faster texture and asset loading",
                    "• Lower frame time variations",
                    "• Support for higher resolution textures",
                    "• Improved open world game performance"
                ];
                
            case "Cloud Computing":
                return [
                    "• Higher VM density per server",
                    "• Improved cost efficiency",
                    "• Better memory bandwidth for cloud services",
                    "• Lower power consumption in data centers"
                ];
                
            case "AI/Machine Learning":
                return [
                    "• Faster model training",
                    "• Improved inference performance",
                    "• Better handling of large datasets",
                    "• More efficient parallel processing"
                ];
                
            case "Data Centers":
                return [
                    "• Lower operating costs (reduced power)",
                    "• Higher memory density per rack",
                    "• Improved reliability with on-die ECC",
                    "• Better performance for virtualized environments"
                ];
                
            case "HPC (High Performance Computing)":
                return [
                    "• Faster scientific simulations",
                    "• Better memory bandwidth for numerical analysis",
                    "• Improved performance for climate modeling",
                    "• More efficient genome sequencing"
                ];
                
            case "Mobile Devices":
                return [
                    "• Lower power consumption",
                    "• Faster app loading and multitasking",
                    "• Improved battery life",
                    "• Better performance for mobile gaming"
                ];
                
            default:
                return ["• Improved performance", "• Lower power consumption", "• Higher reliability"];
        }
    }
}

// 7. Error Correction Animation
class ECCAnimation extends Animation {
    constructor() {
        super('ecc-canvas');
        this.animState = 0;
        this.maxStates = 6;
        this.errorBit = 7; // Bit position that will have an error
        this.dataSize = 16; // Number of bits to display
    }

    update() {
        // Clear canvas
        this.ctx.fillStyle = document.documentElement.classList.contains('dark') ? '#374151' : '#f8f8f8';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        
        // Title
        this.ctx.font = 'bold 20px Arial';
        this.ctx.fillStyle = '#FF5722';
        this.ctx.textAlign = 'center';
        this.ctx.fillText('DDR5 On-Die ECC (Error Correction)', this.canvas.width / 2, 40);
        
        // Generate random "data" for visual effect - a 16-bit array
        let data = Array(this.dataSize).fill(0).map((_, i) => Math.random() > 0.5 ? 1 : 0);
        
        // Steps of ECC visualization
        const boxWidth = 30;
        const boxHeight = 30;
        const startX = (this.canvas.width - (boxWidth * this.dataSize)) / 2;
        const startY = 100;
        
        switch(this.animState % this.maxStates) {
            case 0: // Original data
                this.drawMemoryData(data, startX, startY, "Original Data");
                break;
                
            case 1: // Add ECC bits
                const eccBits = this.calculateECC(data);
                this.drawMemoryData(data, startX, startY, "Data with ECC bits calculated");
                this.drawECCBits(eccBits, startX, startY + 80);
                break;
                
            case 2: // Stored in memory
                this.drawMemoryData(data, startX, startY, "Data stored in memory");
                this.drawECCBits(this.calculateECC(data), startX, startY + 80);
                break;
                
            case 3: // Error occurs!
                // Introduce an error
                data[this.errorBit] = data[this.errorBit] === 0 ? 1 : 0;
                this.drawMemoryData(data, startX, startY, "Error occurred in memory!");
                this.highlightError(startX + this.errorBit * boxWidth, startY, boxWidth, boxHeight);
                break;
                
            case 4: // Error detected
                // Keep the error
                data[this.errorBit] = data[this.errorBit] === 0 ? 1 : 0;
                this.drawMemoryData(data, startX, startY, "Error detected by ECC");
                this.highlightError(startX + this.errorBit * boxWidth, startY, boxWidth, boxHeight);
                this.drawErrorDetection(startX, startY + 80);
                break;
                
            case 5: // Error corrected
                this.drawMemoryData(data, startX, startY, "Data corrected by ECC");
                this.drawCorrectedBit(startX + this.errorBit * boxWidth, startY, boxWidth, boxHeight);
                break;
        }
        
        // Draw explanation
        this.ctx.textAlign = 'left';
        this.ctx.fillStyle = COLORS[document.documentElement.classList.contains('dark') ? 'dark' : 'light'];
        this.ctx.font = 'bold 16px Arial';
        this.ctx.fillText("How DDR5 On-Die ECC Works:", 50, 250);
        
        const explanation = this.getExplanationForState(this.animState % this.maxStates);
        
        this.ctx.font = '14px Arial';
        explanation.forEach((line, i) => {
            this.ctx.fillText(line, 70, 280 + i * 20);
        });
        
        // DDR5 ECC benefits
        this.ctx.font = 'bold 16px Arial';
        this.ctx.fillText("Benefits of DDR5 On-Die ECC:", 400, 250);
        
        const benefits = [
            "• Improved reliability for critical systems",
            "• Protection against single-bit errors",
            "• Reduced system crashes and data corruption",
            "• Higher data integrity compared to DDR4",
            "• Better performance stability over time"
        ];
        
        this.ctx.font = '14px Arial';
        benefits.forEach((benefit, i) => {
            this.ctx.fillText(benefit, 420, 280 + i * 20);
        });
        
        // Increment animation state
        this.animState = (this.animState + 1) % this.maxStates; // Already fast enough
    }
    
    drawMemoryData(data, startX, startY, label) {
        // Draw label
        this.ctx.fillStyle = COLORS[document.documentElement.classList.contains('dark') ? 'dark' : 'light'];
        this.ctx.font = '14px Arial';
        this.ctx.textAlign = 'center';
        this.ctx.fillText(label, this.canvas.width / 2, startY - 15);
        
        // Draw data bits
        const boxWidth = 30;
        const boxHeight = 30;
        
        data.forEach((bit, i) => {
            this.ctx.fillStyle = bit === 1 ? '#4CAF50' : '#F44336';
            this.ctx.fillRect(startX + i * boxWidth, startY, boxWidth, boxHeight);
            
            this.ctx.fillStyle = 'white';
            this.ctx.textAlign = 'center';
            this.ctx.fillText(bit.toString(), startX + i * boxWidth + boxWidth / 2, startY + boxHeight / 2 + 5);
        });
    }
    
    drawECCBits(eccBits, startX, startY) {
        this.ctx.fillStyle = COLORS[document.documentElement.classList.contains('dark') ? 'dark' : 'light'];
        this.ctx.font = '14px Arial';
        this.ctx.textAlign = 'center';
        this.ctx.fillText("ECC Bits", this.canvas.width / 2, startY - 15);
        
        // Draw ECC bits visualization
        const boxWidth = 30;
        const boxHeight = 30;
        const numECCBits = eccBits.length;
        const eccStartX = startX + (this.dataSize - numECCBits) * boxWidth / 2;
        
        eccBits.forEach((bit, i) => {
            this.ctx.fillStyle = '#2196F3';
            this.ctx.fillRect(eccStartX + i * boxWidth, startY, boxWidth, boxHeight);
            
            this.ctx.fillStyle = 'white';
            this.ctx.textAlign = 'center';
            this.ctx.fillText(bit.toString(), eccStartX + i * boxWidth + boxWidth / 2, startY + boxHeight / 2 + 5);
        });
    }
    
    highlightError(x, y, width, height) {
        // Draw error highlight with animation effect
        this.ctx.strokeStyle = '#FF5722';
        this.ctx.lineWidth = 3;
        this.ctx.strokeRect(x, y, width, height);
        
        // Draw error indicator
        this.ctx.fillStyle = '#FF5722';
        this.ctx.font = 'bold 14px Arial';
        this.ctx.textAlign = 'center';
        this.ctx.fillText("ERROR", x + width / 2, y - 5);
    }
    
    drawErrorDetection(startX, startY) {
        this.ctx.fillStyle = '#FF9800';
        this.ctx.font = 'bold 14px Arial';
        this.ctx.textAlign = 'center';
        this.ctx.fillText("ECC Detecting Error...", this.canvas.width / 2, startY + 15);
        
        // Draw detection animation
        const radius = 30;
        this.ctx.strokeStyle = '#FF9800';
        this.ctx.beginPath();
        this.ctx.arc(this.canvas.width / 2, startY + 50, radius, 0, Math.PI * 2);
        this.ctx.stroke();
        
        // Draw radar-like scan line
        this.ctx.save();
        this.ctx.translate(this.canvas.width / 2, startY + 50);
        this.ctx.rotate(this.animState * Math.PI / 3);
        this.ctx.beginPath();
        this.ctx.moveTo(0, 0);
        this.ctx.lineTo(radius, 0);
        this.ctx.stroke();
        this.ctx.restore();
    }
    
    drawCorrectedBit(x, y, width, height) {
        // Draw correction highlight
        this.ctx.strokeStyle = '#4CAF50';
        this.ctx.lineWidth = 3;
        this.ctx.strokeRect(x, y, width, height);
        
        // Draw checkmark
        this.ctx.fillStyle = '#4CAF50';
        this.ctx.font = 'bold 14px Arial';
        this.ctx.textAlign = 'center';
        this.ctx.fillText("✓ FIXED", x + width / 2, y - 5);
    }
    
    calculateECC(data) {
        // Simplified ECC calculation - in reality, this would be a proper parity calculation
        // Just for visualization purposes
        return [0, 1, 1, 0];
    }
    
    getExplanationForState(state) {
        switch(state) {
            case 0:
                return [
                    "1. Data is prepared to be written to memory",
                    "2. DDR5 includes on-die ECC circuitry to protect data",
                    "3. This is a major improvement over DDR4's optional ECC"
                ];
            case 1:
                return [
                    "1. Before storage, ECC bits are calculated from the data",
                    "2. These extra bits can detect and correct single-bit errors",
                    "3. DDR5 uses an efficient Hamming code implementation"
                ];
            case 2:
                return [
                    "1. Data is stored in memory cells with ECC bits",
                    "2. As memory cells get smaller, they become more error-prone",
                    "3. DDR5's higher density makes ECC more important than ever"
                ];
            case 3:
                return [
                    "1. A bit flip error has occurred in memory!",
                    "2. This could be caused by electrical interference",
                    "3. Or by cosmic rays, or even thermal noise",
                    "4. Without ECC, this would corrupt data silently"
                ];
            case 4:
                return [
                    "1. ECC detects the error by re-calculating the ECC bits",
                    "2. When the stored and calculated ECC don't match...",
                    "3. The system knows an error has occurred",
                    "4. DDR5 can then pinpoint which bit is incorrect"
                ];
            case 5:
                return [
                    "1. The error is corrected automatically",
                    "2. No system crash or data corruption occurs",
                    "3. The process is transparent to applications",
                    "4. DDR5's on-die ECC works continuously to ensure data integrity"
                ];
            default:
                return ["ECC is an important feature of DDR5 memory"];
        }
    }
}

// Initialize Animations
document.addEventListener('DOMContentLoaded', () => {
    console.log('Initializing animations...');
    
    // Set proper dimensions for all canvas elements
    const canvases = document.querySelectorAll('canvas');
    canvases.forEach(canvas => {
        if (!canvas.style.width) {
            canvas.style.width = '800px';
            canvas.width = 800;
        }
        if (!canvas.style.height) {
            canvas.style.height = '400px';
            canvas.height = 400;
        }
        console.log(`Set canvas ${canvas.id} dimensions to ${canvas.width}x${canvas.height}`);
    });
    
    // Initialize animation classes
    try {
        if (document.getElementById('fsm-canvas')) new FSMAnimation();
        if (document.getElementById('write-canvas')) new WriteAnimation();
        if (document.getElementById('read-canvas')) new ReadAnimation();
        if (document.getElementById('time-canvas')) new TimeAnimation();
        if (document.getElementById('comparative-canvas')) new ComparativeAnimation();
        if (document.getElementById('usecase-canvas')) new UseCaseAnimation();
        if (document.getElementById('ecc-canvas')) new ECCAnimation();
        
        console.log('All animations initialized successfully');
    } catch (error) {
        console.error('Error initializing animations:', error);
    }
});