/**
 * MMakr Library
 * https://github.com/tacowhisperer
 *
 * Pollutes "mmakr" global namespace, if applicable.
 * 
 * Date: Feb 23, 2022
 * @author tacowhisperer
 */
const ENTRY_POINT = 'index.html';

nw.Window.open(ENTRY_POINT, {focus: true}, (win) => {
	win.on('loaded', e => console.log('loaded'));

	console.log(`You are running on ${require('os').platform()}`);
});
