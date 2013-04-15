REPORTER = dot

all: reinstall

reinstall:
	npm uninstall terminal.js
	npm install ../terminal.js

.PHONY: reinstall
