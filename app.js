// JavaScript implementation of Recursive Fibonacci
function fibJS(n) {
    if (n <= 1) return n;
    return fibJS(n - 1) + fibJS(n - 2);
}

// Energy Constant (Simulated factor for μJ estimation)
const ENERGY_CONSTANT = 0.05; 

let wasmFib = null;
let performanceChart = null;

// Pre-compiled WebAssembly binary for Recursive Fibonacci (i64)
// This allows the demo to work immediately even if Emscripten is not installed.
const WASM_BASE64 = "AGFzbQEAAAABBgFgAX4BfgMCAQAHBwEDZmliAAAKHgEcACAAQgJTBH4gAAUgAEIBfRAAIABCAn0QAHwLCw==";

async function initWasm() {
    const wasmTimeEl = document.getElementById('wasm-time');
    try {
        // 1. Check if Emscripten bridge (fib.js) is already loaded
        if (typeof createFibModule === 'function') {
            console.log("Found Emscripten bridge, initializing...");
            const module = await createFibModule();
            wasmFib = module._fib;
            console.log("Emscripten Wasm loaded.");
            return;
        }

        // 2. If not, use the high-performance Base64 fallback
        console.log("Using embedded Wasm fallback...");
        const binaryString = atob(WASM_BASE64);
        const bytes = new Uint8Array(binaryString.length);
        for (let i = 0; i < binaryString.length; i++) {
            bytes[i] = binaryString.charCodeAt(i);
        }
        
        const { instance } = await WebAssembly.instantiate(bytes);
        // Map the Wasm function to our global wasmFib variable
        wasmFib = (n) => {
            // Convert to BigInt for i64 support, then back to Number for JS
            return Number(instance.exports.fib(BigInt(n)));
        };
        console.log("Embedded Wasm initialized successfully.");
        if (wasmTimeEl.innerText === "--") wasmTimeEl.innerText = "Ready";

    } catch (e) {
        console.error("Wasm Init Error:", e);
        if (wasmTimeEl) {
            wasmTimeEl.innerText = "Error: " + e.message;
            wasmTimeEl.style.fontSize = "0.8rem"; // Make sure it fits
            wasmTimeEl.style.color = "red";
        }
    }
}

// Performance measurement wrapper
function measurePerformance(fn, n) {
    const start = performance.now();
    const result = fn(n);
    const end = performance.now();
    const time = end - start;
    return {
        time: parseFloat(time.toFixed(4)),
        energy: parseFloat((time * ENERGY_CONSTANT * 1000).toFixed(2)) // simulated microjoules
    };
}

// UI Update Helpers
function updateCard(type, metrics) {
    const timeEl = document.getElementById(`${type}-time`);
    const energyEl = document.getElementById(`${type}-energy`);
    const progressEl = document.getElementById(`${type}-progress`);
    
    timeEl.innerText = metrics.time;
    energyEl.innerText = metrics.energy;
    
    // Simple logic for progress bar relative to a "slow" baseline (e.g. 2000ms)
    const percentage = Math.min((metrics.time / 2000) * 100, 100);
    if (progressEl) progressEl.style.width = `${percentage}%`;
}

function initChart() {
    const ctx = document.getElementById('performanceChart').getContext('2d');
    performanceChart = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: ['JavaScript', 'WebAssembly', 'Hybrid'],
            datasets: [{
                label: 'Execution Time (ms)',
                data: [0, 0, 0],
                backgroundColor: [
                    'rgba(247, 223, 30, 0.6)',
                    'rgba(76, 175, 80, 0.6)',
                    'rgba(0, 210, 255, 0.6)'
                ],
                borderColor: [
                    '#f7df1e',
                    '#4caf50',
                    '#00d2ff'
                ],
                borderWidth: 1
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                y: {
                    beginAtZero: true,
                    grid: { color: 'rgba(255, 255, 255, 0.1)' },
                    ticks: { color: '#a0a0ab' }
                },
                x: {
                    grid: { display: false },
                    ticks: { color: '#a0a0ab' }
                }
            },
            plugins: {
                legend: { display: false }
            }
        }
    });
}

function updateChart(jsTime, wasmTime, hybridTime) {
    performanceChart.data.datasets[0].data = [jsTime, wasmTime, hybridTime];
    performanceChart.update();
}

// Main benchmark function
async function runBenchmark() {
    const n = parseInt(document.getElementById('fib-input').value);
    const threshold = parseInt(document.getElementById('threshold-input').value);
    const runBtn = document.getElementById('run-btn');

    if (isNaN(n) || n < 1) {
        alert("Please enter a valid Fibonacci number.");
        return;
    }

    runBtn.disabled = true;
    runBtn.innerText = "Running...";
    
    // Clear old results
    document.querySelectorAll('.card').forEach(c => c.classList.remove('fastest'));
    
    // Use a small delay to allow UI to update before heavy computation
    setTimeout(() => {
        // 1. JS Execution
        const jsMetrics = measurePerformance(fibJS, n);
        updateCard('js', jsMetrics);

        // 2. Wasm Execution
        let wasmMetrics = { time: 0, energy: 0 };
        if (wasmFib) {
            try {
                wasmMetrics = measurePerformance(wasmFib, n);
                updateCard('wasm', wasmMetrics);
            } catch (e) {
                console.error("Wasm Execution Error:", e);
                document.getElementById('wasm-time').innerText = "Run Error";
                document.getElementById('wasm-time').style.fontSize = "1rem";
                document.getElementById('wasm-energy').innerText = e.message.substring(0, 20);
                
                runBtn.disabled = false;
                runBtn.innerText = "Run Benchmark";
                return; // Stop further execution
            }
        } else {
            document.getElementById('wasm-time').innerText = "Not Compiled";
        }

        // 3. Hybrid Execution
        let hybridMetrics;
        const hybridModeEl = document.getElementById('hybrid-mode');
        
        if (n < threshold) {
            hybridMetrics = jsMetrics;
            hybridModeEl.innerText = "Used JS (n < threshold)";
        } else if (wasmFib) {
            hybridMetrics = wasmMetrics;
            hybridModeEl.innerText = "Used Wasm (n >= threshold)";
        } else {
            hybridMetrics = jsMetrics;
            hybridModeEl.innerText = "Used JS (Wasm fallback)";
        }
        updateCard('hybrid', hybridMetrics);

        // Highlight fastest
        if (wasmFib) {
            if (jsMetrics.time < wasmMetrics.time) {
                document.getElementById('card-js').classList.add('fastest');
            } else {
                document.getElementById('card-wasm').classList.add('fastest');
            }
        }

        // Update Chart
        updateChart(jsMetrics.time, wasmMetrics.time, hybridMetrics.time);

        runBtn.disabled = false;
        runBtn.innerText = "Run Benchmark";
    }, 50);
}

// Event Listeners
document.getElementById('run-btn').addEventListener('click', runBenchmark);

// Initialize
window.onload = () => {
    initWasm();
    initChart();
};
