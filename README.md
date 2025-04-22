# 🚀 DDR5 Memory Controller Project

> A high-performance DDR5 Memory Controller implemented in Verilog, featuring web-based simulation, animations, and full documentation. Built for the COA course at IIITV-ICD.

---

## 📚 Table of Contents

- [📖 Overview](#-overview)
- [✨ Features](#-features)
- [🧱 Project Structure](#-project-structure)
- [⚙️ Installation & Setup](#️-installation--setup)
- [💻 Usage Guide](#-usage-guide)
- [🔬 Verilog Implementation](#-verilog-implementation)
- [🎛️ Simulation Details](#-simulation-details)
- [🎞️ Animations & Visuals](#-animations--visuals)
- [👨‍💻 Team Members](#-team-members)
- [🚧 Future Enhancements](#-future-enhancements)
- [🐞 Known Issues](#-known-issues)
- [📄 License](#-license)
- [📬 Contact](#-contact)

---

## 📖 Overview

This project implements a DDR5 Memory Controller using Verilog as part of a Computer Organization and Architecture (COA) course. It manages data transfers between a processor and DDR5 SDRAM, supporting high-speed memory operations and precise timing.

---

## ✨ Features

- 💻 **Verilog Implementation**: State machine, command generation, data path logic.
- 🧪 **Interactive Simulation**: Step-through read/write operations, signal visualization.
- 🎞️ **Animations**: FSM visualizations, timing diagrams, DDR4 vs. DDR5, ECC demo.
- 📚 **Documentation**: Detailed state transitions, timing parameters, and logic flow.
- 🤝 **Team Contributions**: Showcase of individual contributions.

---

## 🧱 Project Structure

```
project-root/
├── index.html             # 🏠 Home page
├── verilog.html           # 💾 DDR5 Verilog Code
├── simulation.html        # 🧪 Simulation Interface
├── how-it-works.html      # 📘 Working Explained
├── team.html              # 👥 Team Info
├── js/
│   ├── main.js            # 🌗 Theme Toggle & Animation
│   ├── simulation.js      # 🧠 Simulation Logic
│   ├── animations.js      # 🎞️ FSM and Data Flow Animation
├── css/
│   └── styles.css         # 🎨 Styling (custom or empty)
├── images/
│   ├── ddr5-dimm.jpg      # 🧩 DIMM Image
│   ├── timing-example.png # ⏱ Timing Diagram
│   └── state-diagram.png  # 🔁 FSM Diagram
```

---

## ⚙️ Installation & Setup

### 🔧 Prerequisites

- Modern browser (Chrome, Firefox, Edge)
- Internet for CDN (TailwindCSS, Prism.js)
- A local server (e.g. Live Server for VS Code)

### 🛠 Setup

```bash
git clone <repository-url>
cd project-root
npx live-server
```

Or open `index.html` directly (animations may not fully work without a server).

---

## 💻 Usage Guide

Navigate via navbar:

- 🏠 Home
- 💾 Verilog Code (syntax highlighted)
- 🧪 Simulation (input data & step states)
- 📘 How it Works (timing & FSM breakdown)
- 👥 Team

On the Simulation Page:

- Input hex address (e.g. `1000`) & data (`DEADBEEF`)
- Use buttons:
  - 🔁 Reset
  - 💾 Memory Reset
  - ✍️ Start Write
  - 📖 Start Read
  - 🔂 Step, ▶️ Auto-Run
  - 📤 Export Log

---

## 🔬 Verilog Implementation

- 🧠 **State Machine**: `IDLE`, `ACTIVATE`, `READ`, `WRITE`, `PRECHARGE`
- ⏱ **Timing Parameters**:
  - `tRCD`: 10 cycles
  - `tCL`: 8 cycles
  - `tWR`: 12 cycles
  - `tRP`: 10 cycles
- 📡 **Command Bus (CA)**: ACTIVATE, READ, WRITE, PRECHARGE
- 🔄 **64-bit Data Path**: Synchronized by DQS

---

## 🎛️ Simulation Details

- Hex input: Address + Data
- Signal visualization: `select_chip`, `data_bus`, `data_sink`
- Manual or auto state-stepping
- Log export & memory view

---

## 🎞️ Animations & Visuals

- 🔁 FSM State Transitions
- ✍️ Write Operation Flow
- 📖 Read Operation Flow
- ⏱ Timing Cycles (tRCD, tCL, etc.)
- 🆚 DDR4 vs DDR5 Comparison
- 🛡 On-die ECC Demo
- 🌐 Real-world Use Cases (AI, gaming, servers)

---

## 👨‍💻 Team Members

| Name                    | ID         |
|-------------------------|------------|
| Namra Kumar Koyani      | 202311057  |
| Sriya Reddy             | 202311060  | 
| Pradeep Kumar Saran     | 202311066  |
| **Rishikesh Gopal**     | 202311072  |
| Shailendar Singh Mandal | 202311078  |

---

## 🚧 Future Enhancements

- ✅ Add ECC support in Verilog
- 🚀 Optimize for higher data rates
- 🔍 Improve signal-level simulations
- 🔁 Add DDR5 refresh features

---

## 🐞 Known Issues

- 🖼️ Images may not load unless served locally
- 🐢 Animations may lag on slow devices

---

## 📄 License

This project is for educational purposes only (COA Course at IIITV-ICD).  
Feel free to fork, adapt, and share with proper credit to the team.

---

## 📬 Contact

For queries, reach out via my personal emails.

Rishikesh Gopal
rishiekshgopal2005@gmail.com

---
