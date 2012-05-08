node-webterminal
================
node-webterminal is a terminal emulator featuring unique technologies. We ship
our own tty-rendering library written in Javascript.

The tty library is intended to work for node.js and on browsers. Currently
its working on Webkit browsers, Firefox (including 3.6), and Opera. Internet
Explorer is currently untested, but it should be very easy to make it work on
Internet Explorer.

We're using diffing algorithms to reduce the amount of data being rendered on
the screen. This makes node-webterminal very fast (for a javascript-terminal,
okay?)

There are still some rendering issues with ncurses, so it's not ready for
everyday use.
