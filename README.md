# Byte2Wasm — Quantitative Analysis of WebAssembly Integration Patterns

<p align="center">
  <strong>An interactive browser-based research tool for benchmarking JavaScript vs. WebAssembly performance and analyzing architectural integration patterns.</strong>
</p>

<p align="center">
  <img src="https://img.shields.io/badge/HTML5-E34F26?style=for-the-badge&logo=html5&logoColor=white" alt="HTML5">
  <img src="https://img.shields.io/badge/JavaScript-F7DF1E?style=for-the-badge&logo=javascript&logoColor=black" alt="JavaScript">
  <img src="https://img.shields.io/badge/CSS3-1572B6?style=for-the-badge&logo=css3&logoColor=white" alt="CSS3">
  <img src="https://img.shields.io/badge/WebAssembly-654FF0?style=for-the-badge&logo=webassembly&logoColor=white" alt="WebAssembly">
  <img src="https://img.shields.io/badge/C-00599C?style=for-the-badge&logo=c&logoColor=white" alt="C">
</p>

---

## Table of Contents

- [Overview](#overview)
- [Features](#features)
- [Getting Started](#getting-started)
- [Usage Guide](#usage-guide)

---

## Overview

**Byte2Wasm** is a web-based research and evaluation tool that provides a quantitative, side-by-side comparison of **JavaScript** and **WebAssembly (Wasm)** execution performance. It uses a recursive Fibonacci computation as its benchmark workload and evaluates four distinct architectural integration patterns to help developers understand *when* and *how* to leverage WebAssembly for maximum performance gain.

The project also includes a **WAMI (Wasm Memory Infrastructure) Analysis** module that compares standard WebAssembly Text Format (WAT) output against a lower-abstraction MLIR-based optimized representation, with an energy-efficiency estimation model.

---

## Features

**Performance Engine (Screen 1)**
- Built-in code editor with syntax templates for **C**, **C++**, and **Rust**
- Line-numbered IDE-style editor with language selection
- Live benchmarking of **JavaScript (interpreted)** vs. **WebAssembly (compiled)** execution
- Configurable workload parameter (`n` = 1–45 for Fibonacci computation)
- Real-time dashboard displaying execution time, memory usage, and transfer cost
- Evaluation across **four architectural integration patterns** (Lightweight, Compute-Heavy, Shared Memory, Full Wasm Module)
- Automatic best-pattern detection and visual highlighting
- Interactive bar chart for performance comparison
- Persistent integration learning log / history

**WAMI Analysis (Screen 2)**
- Editable C source code input panel
- Side-by-side comparison of **Standard WASM WAT** and **WAMI MLIR** representations
- Architectural energy-efficiency estimation (~18% improvement with WAMI optimization)
- Energy comparison bar chart visualization

**UI/UX**
- Fully responsive layout (desktop, tablet, mobile)
- Smooth screen transitions and animated chart updates

---

## Getting Started

### Prerequisites

All you need is a **modern web browser** (Chrome, Firefox, Edge, Safari). No server, build tools, or dependencies are required — the entire application runs client-side.

### Installation

1. **Clone the repository:**
   ```bash
   git clone https://github.com/Harshwardhan-zanwar/Byte2Wasm.git
   cd Byte2Wasm
Open index.html in your browser:

Copy# Option A: Simply double-click index.html

# Option B: Use a local dev server (recommended for best experience)
# With Python:
python3 -m http.server 8080

# With Node.js (npx):
npx serve .

# With VS Code:
# Install the "Live Server" extension and click "Go Live"
Navigate to http://localhost:8080 (if using a local server).

Usage Guide
Performance Engine
Select a language (C, C++, or Rust) from the dropdown in the editor panel — a Fibonacci template will load automatically.
Set the workload value n (1–45) in the "Task Workload" input field. Higher values yield more dramatic Wasm performance advantages.
Click "Run Analysis" to execute the benchmark.
Review the results:
The dashboard displays execution time, memory usage, and data transfer cost.
Base Performance Metrics show raw JS vs. Wasm timings.
Architectural Integration Patterns show all four patterns with the best one highlighted.
The bar chart provides a visual comparison across all modes.
The Integration Learning log tracks your benchmark history.
WAMI Analysis
Navigate to the "WAMI Analysis" tab in the top navigation bar.
Edit or paste C source code in the editor panel.
Click "Analyze Efficiency" to generate the Standard WASM WAT and WAMI MLIR representations side by side.
Review the energy efficiency comparison showing the ~18% improvement of the WAMI-optimized approach.
Project Structure
CopyByte2Wasm/          
├── index.html         # Main HTML file — UI layout and structure
├── style.css          # Stylesheet — glassmorphism theme, responsive layout
├── app.js             # Core application logic — benchmarking, Wasm runtime, WAMI analysis
└── fib.c              # Reference C source file (Emscripten-compatible Fibonacci)
File	Size	Purpose
index.html	~12 KB	Application shell with two-screen layout (Performance + WAMI)
app.js	~8 KB	Benchmark engine, Wasm instantiation, pattern analysis, charts
style.css	~7.5 KB	Dark glassmorphism theme, responsive grid, animations
fib.c	~209 B	Emscripten-annotated C Fibonacci function for Wasm compilation
Integration Patterns Explained
The tool evaluates four architectural patterns for integrating WebAssembly into web applications:

Pattern	Name	Best For	Description
A	Lightweight (JS Only)	Small tasks (n < 18)	Pure JavaScript execution with no Wasm call overhead. Ideal for trivial computations where the cost of calling into Wasm exceeds the computation itself.
B	Compute-Heavy (Wasm)	Medium tasks (18 ≤ n ≤ 30)	Direct Wasm execution for CPU-bound workloads. Wasm's compiled nature provides a clear speed advantage for non-trivial computation.
C	Shared Memory (Data-Intensive)	Large data (30 < n ≤ 38)	Wasm execution with shared memory buffers to avoid expensive data copying between JS and Wasm linear memory.
D	Full Wasm Module	Complex tasks (n > 38)	Complete Wasm module deployment for maximum scalability on heavy, sustained computations.
WAMI Analysis Module
The WAMI (Wasm Memory Infrastructure) screen provides an architectural-level comparison between two compilation representations:

Standard WASM (WAT) — The conventional WebAssembly Text Format output, representing the high-abstraction compilation target.

WAMI Optimized (MLIR) — A lower-abstraction representation using MLIR (Multi-Level Intermediate Representation) dialect constructs (arith, scf, func), modeling how memory-aware compiler passes can reduce energy consumption by approximately 18% through more efficient instruction scheduling and memory access patterns.

The energy model uses a constant-factor estimation based on code size and abstraction level to compare the two approaches.

Technologies Used
Technology	Role
HTML5	Application structure and semantic layout
CSS3	Glassmorphism UI, CSS custom properties, responsive grid, animations
Vanilla JavaScript (ES6+)	Core logic, Wasm instantiation, performance.now() benchmarking
WebAssembly	Pre-compiled Fibonacci binary (Base64-encoded .wasm module)
C (Emscripten)	Reference source for Wasm compilation (fib.c)
Google Fonts	Outfit (UI) + JetBrains Mono (code/monospace)
Contributing
Contributions are welcome! Here's how you can help:

Fork the repository
Create a feature branch (git checkout -b feature/your-feature)
Commit your changes (git commit -m 'Add some feature')
Push to the branch (git push origin feature/your-feature)
Open a Pull Request
Some ideas for contributions:

Add support for additional benchmark algorithms beyond Fibonacci
Integrate a real C-to-Wasm compilation pipeline (e.g., via Emscripten in the browser)
Add WebGPU/SIMD comparison patterns
Implement persistent benchmark history with localStorage
Add export functionality for benchmark results (CSV/JSON)


GitHub: @Harshwardhan-zanwar
Built to explore the performance frontier between JavaScript and WebAssembly
