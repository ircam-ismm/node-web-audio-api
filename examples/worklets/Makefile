DEPS = SimpleKernel.cc

build: $(DEPS)
	@emcc --bind -O1 \
	  -s WASM=1 \
		-s BINARYEN_ASYNC_COMPILATION=0 \
		-s SINGLE_FILE=1 \
		-s ENVIRONMENT=node \
		-s EXPORT_ES6=1 \
        -s EXPORTED_FUNCTIONS="['_malloc']" \
		SimpleKernel.cc \
		-o simple-kernel.wasmmodule.mjs

clean:
	@rm -f simple-kernel.wasmmodule.js
