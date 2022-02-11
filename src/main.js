const ENTRY_POINT = 'index.html';

nw.Window.open(ENTRY_POINT, {focus: true}, (win) => {
	document.write(`You are running on ${require('os').platform()}`);
});
