/**
 * MMakr Library
 * https://github.com/tacowhisperer
 *
 * Pollutes "mmakr" global namespace, if applicable.
 * 
 * Date: Feb 21, 2022
 * @author tacowhisperer
 */
(function (mod, win) {
	/**
	 * Class to differentiate between intended failures and unexpected failures from the assertion function family. Note
	 * that this class should not be instantiated with the 'new' keyword. It should instead be created through the static
	 * "some" method.
	 */
	class Output {
		/**
		 * Output.NONE singleton whose 'value' doesn't really matter. It's usefulness is that it allows for === comparison.
		 */
		static NONE = new Output({toString: () => 'NONE'});

		/**
		 * Encapsulates a value in an Output object.
		 * 
		 * @param {any} value The object/primitive to store in a new Output object. Note that === comparison will NOT work.
		 */
		static some(value) {
			return new Output(value);
		}

		#value;
		constructor(value) {
			this.#value = value;
		}

		get value() {
			return this.#value;
		}

		toString() {
			return `Output<${this.#value}>`;
		}
	}

	/**
	 * Tests for equality between some expected Output object and an output provided from a function. The output from the
	 * function is wrapped in a new Output object if it returns a value, or an Output.NONE is given if it fails.
	 * 
	 * @param {Output} exp The expected Output that will be generated from the provided function.
	 * @param {Function} fn The function to test.
	 * @param {Function} eqFn The function that will test the equality of two Output values.
	 * @param {Array} args The arguments to provide to fn.
	 * 
	 * @return {String} 'OK!' if all went as expected, or a customized 'ASSERTION FAILED' if not.
	 */
	function assert(exp, fn, eqFn, ...args) {
		let output;

		try {
			output = Output.some(fn.apply(null, args));
		} catch (err) {
			console.error(err);
			output = Output.NONE;
		}

		return eqFn(exp, output) ? 'OK!' : `ASSERTION FAILED: Expected (${exp}) but got (${output}).`;
	}

	if (typeof mod === 'object' && typeof mod.exports === 'object')
		mod.exports = parseCollection;

	else if (typeof win === 'object' && typeof win.document === 'object')
		win.mmakr.parseCollection = parseCollection;
})(module, window);
