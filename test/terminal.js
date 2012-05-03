var Terminal = terminal.Terminal
describe('Terminal', function() {
	it("creates Terminal", function() {
		expect(new Terminal()).to.have.property('buffers')
		expect(new Terminal().toString()).to.be("")
	});
});
