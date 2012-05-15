(function() {

	var webterminals = {}
	var sockets = {};

	function initSocket(url) {
		if(sockets[url])
			return sockets[url];
		var s = io.connect(url);
		s.on("ptydata", function (data) { webterminals[data.id].data(data.data) });
		s.on("ptyexit", function (data) { webterminals[data.id].exit() });
		s.on("disconnect", function (data) {
			for(var id in webterminals) {
				if(webterminals[id].socket === s)
					webterminals[id].exit();
			}
		});

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
		}

		this.terminal = new terminal.Terminal(80, 24, options);
		this.termDiff = new terminal.TermDiff(this.terminal)

		this.box = document.createElement('pre');
		element.appendChild(this.box);
		element.className += ' webterminal';
		this.box.className = this.attr2Class(this.terminal.attr);

		this.socket = initSocket(options.url);
		this.socket.emit("ptyinit", { id: this.id });

		this.blur();
		if(this.box.addEventListener)
			this.box.addEventListener("click", function() {self.focus(); }, true)
		else
			this.box.attachEvent("onclick", function() {self.focus(); }, true)
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
			},100);
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
			this.sendInput(this.terminal.eventToKey(event));
			return false;
		},

		exit: function() {
			this.box.className += " terminated";
		},

		keydown: function(event) {
			switch(event.which) {
				case 27:
				case 38: // up
				case 40: // down
				case 39: // right
				case 37: // left
				case 8:
				case 9:
					this.sendInput(this.terminal.eventToKey(event));
					return false;
			}
			return true;
		},

		data: function(data) {
			this.terminal.write(data);
			var diff = this.termDiff.diff();
			this.render(diff);
		},

		render: function(diff) {
			var children = this.box.childNodes;
			for(var i in diff) {
				var action = diff[i].act;
				var line = diff[i].line;
				var deleted = diff[i].rm;
				var attr = diff[i].attr;

				while(deleted--)
					this.box.removeChild(children[i]);

				var element = children[i];
				if(action === '+') {
					element = document.createElement('div');
					if(children[i])
						this.box.insertBefore(element, children[i]);
					else
						this.box.appendChild(element);
				}

				if(line) {
					element.className = this.attr2Class(attr);
					var frag = document.createDocumentFragment();
					var j;
					for(j = 0; j < line.length; j++) {
						if(line[j]) {
							var chr = document.createElement('span');
							chr.appendChild(document.createTextNode(line[j].chr || ' '))
							frag.appendChild(chr);
							chr.className = this.attr2Class(line[j].attr) + (line[j].cursor ? " cursor_true" : "");
						}
						else
							frag.appendChild(document.createTextNode(' '))
					}
					if(j == 0)
						frag.appendChild(document.createTextNode(' '));
					element.innerHTML = "";
					element.appendChild(frag);
				}
			}
		},
		attr2Class: function(attr) {
			if(!attr)
				return '';
			if(attr.str)
				return attr.str;
			var classes = [];
			for(var k in attr) {
				if(k != 'str')
					classes.push(k+"_"+attr[k]);
			}
			return attr.str = classes.join(' ');
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
