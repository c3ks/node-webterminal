(function() {

	var webterminals = {}
	var sockets = {};

	function initSocket(url) {
		if(sockets[url])
			return sockets[url];
		var s = io.connect(url);
		s.on("ptydata", function (data) { webterminals[data.id].data(data.data) });
		s.on("ptyexit", function (data) { webterminals[data.id].exit() });

		return sockets[url] = s;
	}

	function extend(o){
		for(var i = 1; i < arguments.length; i++)
			for(var key in arguments[i])
				o[key] = arguments[i][key];
		return o;
	}

	function WebTerminal(element, options) {
		var self = this;

		this.id = Math.random().toString().substr(2);
		webterminals[this.id] = this;

		options = options || {
			cols:80,
			rows:24
		}

		this.terminal = new terminal.Terminal(options.cols, options.rows, options);

		this.box = document.createElement('pre');
		element.appendChild(this.box);
		element.className += ' webterminal';
		this.box.className = this.attr2Class(this.terminal.getBuffer().attr);

		this.socket = initSocket(options.url);
		this.socket.emit("ptyinit", { id: this.id });

		this.blur();
		this.box.addEventListener("click", function() {self.focus(); }, true)
		this.oldKeypress = window.onkeypress;
		this.oldKeydown = window.onkeydown;
		this.oldClick = window.onclick;
		this.blur();
	}

	WebTerminal.prototype = {
		focus: function() {
			var self = this;
			for(var id in webterminals) {
				webterminals[id].blur();
			}
			this.oldKeypress = window.onkeypress;
			this.oldKeydown = window.onkeydown;
			this.oldKeydown = window.onclick;
			window.onkeypress = function(event) { return self.keypress(event) };
			window.onkeydown = function(event) { return self.keydown(event) };
			setTimeout(function() {
				window.onclick = function() { self.blur() }
			},0);
			this.box.className += " focus";
		},
		blur: function() {
			window.onkeypress = this.oldKeypress;
			window.onkeydown = this.oldKeydown;
			window.onclick = this.oldClick;
			var l = this.box.className.split(/ +/)
			var n = []
			for(var i = 0; i < l.length; i++)
				(l[i] != "focus") && n.push(l[i])
			this.box.className = n.join(' ');
		},
		sendInput: function(data) {
			this.socket.emit("ptyinput", { id: this.id, data: data });
		},

		sendSignal: function(signal) {
			this.socket.emit("ptysignal", { id: this.id, data: signal });
		},

		keypress: function(event) {
			this.sendInput(String.fromCharCode(event.which));
			return false;
		},

		exit: function() {
			this.box.className += " terminated";
		},

		keydown: function(event) {
			switch(event.which) {
				case 38: // up
					this.sendInput("\x1b[A");
					return false;
				case 40: // down
					this.sendInput("\x1b[B");
					return false;
				case 39: // right
					this.sendInput("\x1b[C");
					return false;
				case 37: // left
					this.sendInput("\x1b[D");
					return false;
				case 8:
					this.sendInput("\x08");
					return false;
				case 9:
					this.sendInput("\t");
					return false;
			}
			return true;
		},

		data: function(data) {
			this.terminal.write(data);
			var diff = this.terminal.getBuffer().dumpDiff();
			this.render(diff);
		},

		render: function(diff) {
			for(var i in diff) {
				var action = diff[i].act;
				var line = diff[i].line;
				var element = this.box.childNodes[i];
				switch(action) {
					case 'c': // a line has been changed
						break;
					case '+': // a line has been inserted at position i
						element = document.createElement('div');
						if(this.box.childNodes[i])
							this.box.insertBefore(element, this.box.childNodes[i]);
						else // if no children is found, consider adding it to the end
							this.box.appendChild(element);
						break;
					case '-': // the line at position i has been removed
						this.box.removeChild(element);
						break;
				}
				if(line) {
					element.innerHTML = (line.length === 0 ? " " : "");
					for(var i = 0; i < line.length; i++) {
						if(line[i]) {
							var chr = document.createElement('span');
							chr.appendChild(document.createTextNode(line[i].chr || ' '))
							element.appendChild(chr);
							chr.className = this.attr2Class(line[i].attr)
						}
						else
							element.appendChild(document.createTextNode(' '))
					}
				}
			}
		},
		attr2Class: function(attr) {
			var classes = [];
			for(var k in attr) {
				classes.push(k+"_"+attr[k]);
			}
			return classes.join(' ');
		}
	}

	window.WebTerminal = WebTerminal;
	if(window.jQuery && window.jQuery().jquery) {
		window.jQuery.fn.webterminal = function(options) {
			this.each(function() {
				if(!$(this).data('webterminal'))
					$(this).data('webterminal', new WebTerminal(this, options));
				return $(this).data('webterminal')
			});
		}
	}
})()
