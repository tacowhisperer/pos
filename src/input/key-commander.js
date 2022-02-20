/**
 * @author tacowhisperer
 */

/**
 * Factory method for producing a new key command object.
 * 
 * @param {Object} DOMObj Any Object that implements the 'addEventListener' method with the 'keydown' and 'keyup' events
 *
 * @return {KeyCommander} A new instance of a KeyCommander object.
 */
function keycommanderFactory(DOMObj) {
	return new KeyCommand(DOMObj);
}

/**
 * Allows for seamless binding of specified keypress combinations to callbacks. Binds to a specific DOM element on
 * construction.
 * 
 * @param {Object} DOMObj Any Object that implements the 'addEventListener' method with the 'keydown' and 'keyup' events
 */
function KeyCommander(DOMObj) {
	const __dom = DOMObj;

	// Constants used in functions
	const DOWN = true;
	const UP = false;

	// Keeps track of which keys are being actively held down, and the times that the "down" and "up" events occurred.
	const activeKeys = {};

	// Unique ID associated with any given key command bind.
	let bindID = 0;

	// Holds all active key commands.
	const keyBinds = {};

	// Creates a standardized object that keeps track of when a key was pressed down and when a key was released
	function newKey() {
		return {downTime: Date.now(), upTime: -Infinity};
	}

	// Helper function for standardizing key bind strings into an easily searchable and unique key
	function newKeyBindCommand(keyCommand) {
		return ;
	}

	// Creates a standardized object that keeps track of key binds
	//
	// id: The unique non-negative number that identifies a key bind
	// combo: The maximum amount of time between key strikes that can elapse for the bind to trigger if it's a combo.
	//        -Infinity otherwise, which means that the keys must all be active at the same time.
	// onDown: Whether or not the bind activates on keydown or keyup
	// singleFire: Whether the bind should activate only once when the key bind is matched. If not, it will fire as fast
	//             and as often as possible.
	// callback: The function provided at bind time to call when the bind is matched.
	function newKeyBind(fn, order) {
		return {id: bindID++, combo: -Infinity, onDown: true, singleFire: true, callback: fn};
	}

	// Tests to see if a register entry created by the newKey function is still "down"
	function keyIsDown(keyRegisterEntry) {
		return keyRegisterEntry.upTime < keyRegisterEntry.downTime;
	}

	// Registers the input key as being "down"
	function activateKey(key) {
		// Only add an entry to the active key register if it's the first time it's pressed/hasn't been released
		if (!(key in activeKeys && keyIsDown(activeKeys[key])))
			activeKeys[key] = newKey();
	}

	// Flips an active "down" key registration
	function deactivateKey(key) {
		// Only deactivate a key that has been previously registered
		if (key in activeKeys)
			activeKeys[key].upTime = Date.now();
	}

	// Loops through all registered keybinds given the current state of active keys to try and match a key bind.
	function checkKeyBinds(mode) {

	}

	// Creates a deep copy of an Object with values that can be Infinity and -Infinity.
	function deepCopy(obj) {
		return JSON.parse(
			JSON.stringify(obj, (k, v) => v === Infinity ? 'Infinity' : v === -Infinity ? '-Infinity' : v),
			(k, v) => v === 'Infinity' ? Infinity : v === '-Infinity' ? -Infinity : v);
	}

	// Set up the relevant listeners to the provided DOM object
	__dom.addEventListener('keydown', e => {
		// Update the active keys register
		activateKey(e.code);

		// TODO: Check the registered key binds if they match to activate the callback function
	});

	__dom.addEventListener('keyup', e => {
		// Update the active keys register
		deactivateKey(e.code);

		// TODO: Check the registered key binds if the match to activate the callback function
	});
	
	/**
	 * Binds the provided callback function to the requested keyboard command.
	 * 
	 * @param {Collection} keyCommand A collection of keys that comprise the binding. It is a composition of keys in an
	 *                                Array or a Set. Keys placed in an Array are treated as ordered, and keys placed in
	 *                                a Set are unordered.
	 * @param {Function} callback The callback function to execute when the key command is input.
	 * @param {Object} options An optional parameter specifying properties of how the key command should be bound.
	 * 
	 * @return {number} A non-negative ID that identifies the succesful binding of the callback.
	 */
	this.bind = function(keyCommand, callback, options) {

	};

	/**
	 * Forces any active "down" keys to be artificially released. Useful for when control of a program is lost before
	 * the keyup event is fired.
	 */
	this.deactivateKeys = function() {
		for (key in activeKeys)
			activeKeys[key].upTime = Infinity;
	};

	/**
	 * Returns a deep copy of the state of the requested key/keys.
	 *
	 * @param {String} key The requested key, or optionally, a RegEx matching the requested keys.
	 * 
	 * @return {Object} An Object containing the requested keys and their states.
	 */
	this.getStateOf = function(key) {
		const matches = {};

		// Add all matches to the final output if the RegExp is a match.
		if (key instanceof RegExp) {
			for (k in activeKeys) {
				if (k.match(key))
					matches[k] = deepCopy(activeKeys[k]);
			}

		// Otherwise only 1 exact key was searched, so find it if it exists.
		} else if (key in activeKeys) {
			matches[key] = deepCopy(activeKeys[key]);
		}

		return matches;
	};
}



// Export the constructor for access in other modules.
// exports.keycommand = keycommandFactory;
