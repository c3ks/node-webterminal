var Terminal = terminal.Terminal
describe('terminal', function() {
	it("creates Terminal", function() {
		expect(new Terminal()).to.have.property('buffers')
		expect(new Terminal().toString()).to.be("")
	});
	it("writes to Terminal", function() {
		var t = new Terminal();
		t.write("Hello World");
		expect(t.toString()).to.be("Hello World");
		t.write("\nHello World");
		expect(t.toString()).to.be("Hello World\nHello World");
		//t.write("\n");
		//expect(t.toString()).to.be("Hello World\nHello World\n");
	});
	it("breaks lines", function() {
		var t = new Terminal(10, 10);
		t.write("12345678901234567890")
		expect(t.toString()).to.be("1234567890\n1234567890")
	})
	it("scrolls", function() {
		var t = new Terminal(10, 10);
		t.write("1\n2\n3\n4\n5\n6\n7\n8\n9\n10\n11\n12\n13\n14\n15\n16\n17\n18\n19\n20")
		expect(t.toString()).to.be("11\n12\n13\n14\n15\n16\n17\n18\n19\n20")
	})
	it("moves cursor up", function() {
		var t = new Terminal();
		t.write("Test\nTest");
		t.mvCursor({y:-1});
		t.write("!");
		expect(t.toString()).to.be("Test!\nTest")

		t = new Terminal();
		t.write("Test\nTest");
		t.mvCursor({y:-2});
		t.write("!");
		expect(t.toString()).to.be("Test!\nTest")
	})
	it("moves cursor down", function() {
		var t = new Terminal();
		t.write("Test\nTest");
		t.mvCursor({y:1});
		t.write("!");
		expect(t.toString()).to.be("Test\nTest\n    !")
	})
	it("moves cursor left", function() {
		var t = new Terminal();
		t.write("Tesd");
		t.mvCursor({x:-1});
		t.write("t");
		expect(t.toString()).to.be("Test")
		t.mvCursor({x:-100})
		t.write("Hello World")
		expect(t.toString()).to.be("Hello World");
	});
	it("moves cursor right", function() {
		var t = new Terminal();
		t.write("Tesd");
		t.mvCursor({x:-1});
		t.write("t");
		expect(t.toString()).to.be("Test")
	})
});
