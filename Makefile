build: clean server_build

all: install build test

clean:
	rm -rf build
	mkdir -p build

install:
	npm install

server_build:
	babel -d build server/index.js
	rsync -av --include \*/ --include \*.json --exclude \*  ./server/ ./build/server/
	rsync -av --include \*/ --include \*.ejs --exclude \*  ./server/ ./build/server/

test:
	npm run test

.PHONY: test server_build clean