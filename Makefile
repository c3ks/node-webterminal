REPORTER = dot

all: build build-dev

build:
	mkdir -p dist
	./node_modules/.bin/browserbuild \
		-g terminal \
		-m terminal -b terminal/ \
		terminal/*js > dist/terminal.js

build-dev:
	mkdir -p dist
	./node_modules/.bin/browserbuild \
		-g terminal \
		-d -m terminal -b terminal/ \
		terminal/*js > dist/terminal-dev.js
	./node_modules/.bin/browserbuild \
		-g termbuffer \
		-d -m termbuffer -b terminal/ \
		terminal/*js > dist/termbuffer-dev.js

test:
	./node_modules/.bin/mocha \
		--require ./test/common \
		--reporter $(REPORTER) \
		$(TESTS)

test-browser: build-dev
	./node_modules/.bin/serve test/

clean:
	rm -r dist

.PHONY: test test-browser clean
