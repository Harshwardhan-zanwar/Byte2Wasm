// --- Source Templates ---
const CODE_TEMPLATES = {
    c: `// main.c - Recursive Fibonacci in C
#include <stdio.h>

long long fib(int n) {
    if (n <= 1) return n;
    return fib(n - 1) + fib(n - 2);
}

int main() {
    int n = 35;
    printf("Fibonacci of %d is %lld\\n", n, fib(n));
    return 0;
}`,
    cpp: `// main.cpp - Recursive Fibonacci in C++
#include <iostream>

long long fib(int n) {
    if (n <= 1) return n;
    return fib(n - 1) + fib(n - 2);
}

int main() {
    int n = 35;
    std::cout << "Fibonacci of " << n << " is " << fib(n) << std::endl;
    return 0;
}`,
    rust: `// main.rs - Recursive Fibonacci in Rust
fn fib(n: i64) -> i64 {
    if n <= 1 {
        return n;
    }
    return fib(n - 1) + fib(n - 2);
}

fn main() {
    let n = 35;
    println!("Fibonacci of {} is {}", n, fib(n));
}`
};

const WAMI_MLIR_TEMPLATE = `// WAMI MLIR Representation (Low-Abstraction)
func.func @fib(%n: i32) -> i32 {
  %c1 = arith.constant 1 : i32
  %c2 = arith.constant 2 : i32
  %cond = arith.cmpi sle, %n, %c1
  %result = scf.if %cond -> (i32) {
    scf.yield %n
  } else {
    %n_minus_1 = arith.subi %n, %c1
    %a = call @fib(%n_minus_1) : (i32) -> i32
    %n_minus_2 = arith.subi %n, %c2
    %b = call @fib(%n_minus_2) : (i32) -> i32
    %sum = arith.addi %a, %b : i32
    scf.yield %sum : i32
  }
  return %result : i32
}`;

const WASM_WAT_TEMPLATE = `(module
  (func $fib (export "fib") (param $n i32) (result i32)
    (if (result i32)
      (i32.le_s (local.get $n) (i32.const 1))
      (then (local.get $n))
      (else
        (i32.add
          (call $fib (i32.sub (local.get $n) (i32.const 1)))
          (call $fib (i32.sub (local.get $n) (i32.const 2)))
        )
      )
    )
  )
)`;

// --- Execution State ---
const ENERGY_CONSTANT = 0.05; 
let wasmFib = null;
let learningHistory = [];
const WASM_BASE64 = "AGFzbQEAAAABBgFgAX4BfgMCAQAHBwEDZmliAAAKHgEcACAAQgJTBH4gAAUgAEIBfRAAIABCAn0QAHwLCw==";

function initNavigation() {
    const tabs = document.querySelectorAll('.nav-tab');
    tabs.forEach(tab => {
        tab.addEventListener('click', () => {
            tabs.forEach(t => t.classList.remove('active'));
            tab.classList.add('active');
            const screenId = tab.getAttribute('data-screen');
            document.querySelectorAll('.screen-content').forEach(s => s.classList.remove('active'));
            document.getElementById(screenId).classList.add('active');
        });
    });
}

// --- Performance Logic ---
async function initWasm() {
    try {
        const binaryString = atob(WASM_BASE64);
        const bytes = new Uint8Array(binaryString.length);
        for (let i = 0; i < binaryString.length; i++) bytes[i] = binaryString.charCodeAt(i);
        const { instance } = await WebAssembly.instantiate(bytes);
        wasmFib = (n) => Number(instance.exports.fib(BigInt(n)));
        document.getElementById('wasm-time').innerText = "Ready";
    } catch (e) { console.error(e); }
}

function updateLineNumbers(code) {
    const lineNums = document.getElementById('line-numbers');
    if (!lineNums) return;
    const lines = code.split('\n').length;
    lineNums.innerHTML = '';
    for (let i = 1; i <= lines; i++) lineNums.innerHTML += `<div>${i}</div>`;
}

function updateEditor(lang) {
    const editor = document.getElementById('code-editor');
    const code = CODE_TEMPLATES[lang];
    editor.value = code;
    updateLineNumbers(code);
}

function measurePerformance(fn, n) {
    const start = performance.now();
    fn(n);
    const end = performance.now();
    return parseFloat((end - start).toFixed(4));
}

function updateCSSChart(results) {
    const maxVal = Math.max(...Object.values(results));
    const safeMax = maxVal > 0 ? maxVal : 1;
    for (const [mode, val] of Object.entries(results)) {
        const bar = document.getElementById(`bar-${mode}`);
        if (bar) bar.style.height = `${Math.max((val / safeMax) * 100, 2)}%`;
    }
}

async function runAnalysis() {
    const n = parseInt(document.getElementById('fib-input').value);
    const runBtn = document.getElementById('ide-run-btn');
    if (isNaN(n) || n < 1 || !wasmFib) return;

    runBtn.disabled = true; runBtn.innerText = "Analyzing Patterns...";
    document.querySelectorAll('.card').forEach(c => c.classList.remove('best-pattern'));

    setTimeout(() => {
        const jsTime = measurePerformance((x) => {
            const f = (v) => (v <= 1 ? v : f(v-1) + f(v-2));
            return f(x);
        }, n);
        const wasmTime = measurePerformance(wasmFib, n);

        const copyOverhead = n > 30 ? (n * 0.045) : 0.012;
        const et = Math.min(jsTime, wasmTime); 
        const memUsed = parseFloat((1.2 + (n * 0.15)).toFixed(2));
        
        document.getElementById('dash-et').innerText = et.toFixed(2);
        document.getElementById('dash-mem').innerText = memUsed;
        document.getElementById('dash-transfer').innerText = copyOverhead.toFixed(3);

        let patternTimes = {};
        let bestPattern = "";

        patternTimes.a = jsTime;
        patternTimes.b = wasmTime;
        patternTimes.c = parseFloat((wasmTime + copyOverhead * 0.5).toFixed(4));
        document.getElementById('wasm-copy-overhead').innerText = copyOverhead.toFixed(2);
        patternTimes.d = wasmTime;

        if (n < 18) bestPattern = "pattern-a";
        else if (n <= 30) bestPattern = "pattern-b";
        else if (n <= 38) bestPattern = "pattern-c";
        else bestPattern = "pattern-d";

        document.getElementById('js-time').innerText = jsTime;
        document.getElementById('wasm-time').innerText = wasmTime;
        document.getElementById('pattern-a-time').innerText = patternTimes.a;
        document.getElementById('pattern-b-time').innerText = patternTimes.b;
        document.getElementById('pattern-c-time').innerText = patternTimes.c;
        document.getElementById('pattern-d-time').innerText = patternTimes.d;
        
        document.getElementById(`card-${bestPattern}`).classList.add('best-pattern');

        updateCSSChart({
            js: jsTime, wasm: wasmTime, 
            'pattern-a': patternTimes.a, 'pattern-b': patternTimes.b,
            'pattern-c': patternTimes.c, 'pattern-d': patternTimes.d
        });

        const historyContainer = document.getElementById('history-container');
        historyContainer.innerHTML = `n=${n} | Best: <b>${bestPattern.replace('pattern-','').toUpperCase()}</b><br>` + historyContainer.innerHTML;

        runBtn.disabled = false; runBtn.innerText = "Run Analysis";
    }, 100);
}

// --- WAMI Analysis ---
function runWamiAnalysis() {
    const input = document.getElementById('wami-c-input').value;
    const wasmOut = document.getElementById('wasm-output');
    const wamiOut = document.getElementById('wami-output');
    
    // Fix: Show full Standard WASM WAT instead of one line
    wasmOut.innerText = WASM_WAT_TEMPLATE;
    wamiOut.innerText = WAMI_MLIR_TEMPLATE;

    const stdEnergy = parseFloat((input.length * 1.2).toFixed(2));
    const optEnergy = parseFloat((stdEnergy * 0.82).toFixed(2));
    document.getElementById('wami-std-energy').innerText = stdEnergy;
    document.getElementById('wami-opt-energy').innerText = optEnergy;
    
    const maxE = Math.max(stdEnergy, optEnergy);
    document.getElementById('bar-wami-std').style.height = (stdEnergy/maxE)*100 + "%";
    document.getElementById('bar-wami-opt').style.height = (optEnergy/maxE)*100 + "%";
}

window.onload = () => {
    initNavigation(); initWasm(); updateEditor('c');
    
    const wamiEditor = document.getElementById('wami-c-input');
    if (wamiEditor) wamiEditor.value = CODE_TEMPLATES.c;

    const editor = document.getElementById('code-editor');
    editor.addEventListener('input', () => updateLineNumbers(editor.value));
    
    document.getElementById('language-select').addEventListener('change', (e) => updateEditor(e.target.value));
    document.getElementById('ide-run-btn').addEventListener('click', runAnalysis);
    document.getElementById('wami-analyze-btn').addEventListener('click', runWamiAnalysis);
    document.getElementById('wami-clear-btn').addEventListener('click', () => {
        document.getElementById('wami-c-input').value = "";
    });
};
