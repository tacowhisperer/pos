/**
 * @author tacowhisperer
 */

/**
 * Factory method for producing a new key command object.
 */
function keycommandFactory() {
	return new KeyCommand();
}

/**
 * Attaches a keyboard listener to the provided DOM element.
 */
function KeyCommand() {
	// Unique ID associated with any given key command bind.
	let bindID = 0;

	// Holds all active key command binds.
	const keyBinds = {};
	
	/**
	 * Binds the provided callback function to the requested keyboard command on the given DOM object.
	 * @param {Object} DOMObj DOM element to attach the key command listener.
	 * @param {string} keyCommand The string of key commands that activates the 
	 */
	this.bind = function(DOMObj, keyCommand) {
		domObj.addEventListener('keydown', e => {
			console.log(`${e.code}: ${String.fromCharCode(e.code)}`);
		});
	};
}



// Export the constructor for access in other modules.
// exports.keycommand = keycommandFactory;
