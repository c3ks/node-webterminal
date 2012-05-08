var Terminal = terminal.Terminal
describe('Terminal', function() {
	it("creates Terminal", function() {
		expect(new Terminal()).to.have.property('buffers')
		expect(new Terminal().toString()).to.be("")
	});
	it("breaks lines correctly", function() {
		var t = new Terminal(5, 10);
		t.write("_____\ra");
		t.toString("a____");
	});
});
