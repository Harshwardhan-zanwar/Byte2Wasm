#include <emscripten.h>

// EMSCRIPTEN_KEEPALIVE ensures the function is exported to the Wasm module
EMSCRIPTEN_KEEPALIVE
long long fib(int n) {
    if (n <= 1) return n;
    return fib(n - 1) + fib(n - 2);
}
