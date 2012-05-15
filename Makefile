REPORTER = dot

all: reinstall

reinstall:
	npm uninstall terminal
	npm install ../terminal.js

.PHONY: reinstall
