#!/bin/sh
# Builds the C particle engine into WebAssembly and wraps it in particles.wasm.js
# (base64, so the game also works when opened straight from a file).
# Needs clang with the wasm32 target and wasm-ld (on Ubuntu: apt install clang lld).
set -e
cd "$(dirname "$0")/.."
clang --target=wasm32 -O3 -nostdlib -fno-builtin -Wall -Wno-strict-aliasing \
  -Wl,--no-entry -Wl,--export-dynamic -Wl,--strip-all -Wl,-z,stack-size=65536 \
  -o c/particles.wasm c/particles.c
B64=$(base64 -w0 c/particles.wasm)
printf '// built by tools/build_wasm.sh from c/particles.c -- do not edit by hand\nwindow.PARTICLES_WASM="%s";\n' "$B64" > particles.wasm.js
echo "particles.wasm: $(wc -c < c/particles.wasm) bytes"
