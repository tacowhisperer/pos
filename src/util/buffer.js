/**
 * MMakr Library
 * https://github.com/tacowhisperer
 * 
 * Pollutes "mmakr" global namespace, if applicable.
 * 
 * Date: Mar 10, 2022
 * @author tacowhisperer
 */

/**
 * Wrapper class for ES6 ArrayBuffer.
 */
class Buff {
	// Private holder for the ES6 view API used to access raw binary data stored in an ArrayBuffer
	#view;

	// The actual ArrayBuffer that stores the byte data
	#payload;

	// Dynamically generated 'length' property that allows easy access to the number of elements of x-bits are stored
	#length;

	/**
	 * Static generator for an ArrayBuffer, a View linked to the constructed ArrayBuffer, and a length object that
	 * tracks all available x-bit lengths of the newly generated ArrayBuffer.
	 * 
	 * @param {Number} nbytes The number of bytes to allocate in the new ArrayBuffer.
	 * 
	 * @return {Object} A new ArrayBuffer nbytes long, a View to manipulate that ArrayBuffer's data, and length info.
	 */
	static newArrayBuffer(nbytes) {
		const buff = new ArrayBuffer(nbytes);
		const lengths = {};

		for (let wordSize = 1; wordSize <= 16; wordSize *= 2) {
			if ((nbytes % wordSize) === 0)
				lengths[`length${8 * wordSize}`] = nbytes / wordSize;
		}

		return {
			buffer: buff,
			view: new DataView(buff),
			length: lengths
		};
	}

	/**
	 * Constructor for the Buff wrapper class.
	 * 
	 * @param {Number} nbytes The size of the buffer in bytes.
	 */
	constructor(nbytes) {
		const data = Buff.newArrayBuffer(nbytes);

		this.#payload = data.buffer;
		this.#view = data.view;
		this.#length = data.length;
	}

	/**
	 * Getter for the number of elements of 8-bits that fit in the current state of the buffer.
	 * 
	 * @return {Number} The 8-bit length of the internal buffer.
	 */
	get length8() {
		return this.#length.length8;
	}

	/**
	 * Getter for the number of elements of 16-bits that fit in the current state of the buffer. Returns undefined
	 * if the 8-bit length is not divisible by 16.
	 * 
	 * @return {Number} The 16-bit length of the internal buffer.
	 */
	get length16() {
		return this.#length.length16;
	}

	/**
	 * Getter for the number of elements of 32-bits that fit in the current state of the buffer. Returns undefined
	 * if the 8-bit length is not divisible by 32.
	 * 
	 * @return {Number} The 32-bit length of the internal buffer.
	 */
	get length32() {
		return this.#length.length32;
	}

	/**
	 * Getter for the number of elements of 64-bits that fit in the current state of the buffer. Returns undefined
	 * if the 8-bit length is not divisible by 64.
	 * 
	 * @return {Number} The 64-bit length of the internal buffer.
	 */
	get length64() {
		return this.#length.length64;
	}

	/**
	 * Getter for the number of elements of 128-bits that fit in the current state of the buffer. Returns undefined
	 * if the 8-bit length is not divisible by 128.
	 * 
	 * @return {Number} The 128-bit length of the internal buffer.
	 */
	get length128() {
		return this.#length.length128;
	}

	/**
	 * Gets the 8-bit value at location i in the 0-based index buffer. Fails if the provided index does not fall within
	 * a valid accessing range.
	 * 
	 * @param {Number} i The index of the 8-bit value to access.
	 * 
	 * @return {Number} The unsigned 8-bit value requested.
	 */
	getUint8(i) {
		if (0 <= i && i < this.length8.valueOf())
			return this.#view.getUint8(i, true);

		throw new RangeError(`The 8-bit index must lie in [0, ${this.length8.valueOf()})`);
	}

	/**
	 * Gets the 16-bit value at location i in the 0-based index buffer. Fails if the provided index does not fall within
	 * a valid accessing range, or if the 16-bit length (length16) is undefined.
	 * 
	 * @param {Number} i The index of the 16-bit value to access.
	 * 
	 * @return {Number} The unsigned 16-bit value requested.
	 */
	getUint16(i) {
		if (0 <= i && i < this.length16.valueOf())
			return this.getUint8(2 * i) + (this.getUint8(2 * i + 1) << 8);

		throw new RangeError(`The 16-bit index must lie in [0, ${this.length16.valueOf()})`);
	}

	/**
	 * Gets the 32-bit value at location i in the 0-based index buffer. Fails if the provided index does not fall within
	 * a valid accessing range, or if the 32-bit length (length32) is undefined.
	 * 
	 * @param {Number} i The index of the 32-bit value to access.
	 * 
	 * @return {Number} The unsigned 32-bit value requested.
	 */
	getUint32(i) {
		if (0 <= i && i < this.length32.valueOf())
			return Number(BigInt(this.getUint16(2 * i)) + (BigInt(this.getUint16(2 * i + 1)) << 16n));

		throw new RangeError(`The 32-bit index must lie in [0, ${this.length32.valueOf()})`);
	}

	/**
	 * Gets the 64-bit value at location i in the 0-based index buffer. Fails if the provided index does not fall within
	 * a valid accessing range, or if the 64-bit length (length64) is undefined.
	 * 
	 * @param {Number} i The index of the 64-bit value to access.
	 * 
	 * @return {BigInt} The unsigned 64-bit value requested as a BigInt.
	 */
	getUint64(i) {
		if (0 <= i && i < this.length64.valueOf())
			return BigInt(this.getUint32(2 * i)) + (BigInt(this.getUint32(2 * i + 1)) << 32n);

		throw new RangeError(`The 64-bit index must lie in [0, ${this.length64.valueOf()})`);
	}

	/**
	 * Gets the 128-bit value at location i in the 0-based index buffer. Fails if the provided indx does not fall within
	 * a valid accessing range, or if the 128-bit length (length128) is undefined.
	 * 
	 * @param {Number} i The index of the 128-bit value to access.
	 * 
	 * @return {BigInt} The unsigned 128-bit value requested as a BigInt.
	 */
	getUint128(i) {
		if (0 <= i && i < this.length128.valueOf())
			return this.getUint64(2 * i) + (this.getUint64(2 * i + 1) << 64n);

		throw new RangeError(`The 128-bit index must lie in [0, ${this.length128.valueOf()})`);
	}

	/**
	 * Sets the 8-bit value at location i in the 0-based index buffer. Fails if the provided index does not fall within
	 * a valid accessing range.
	 * 
	 * @param {Number} i The index of the 8-bit value location to access.
	 * @param {Number} v The unsigned 8-bit value to place at location i
	 * 
	 * @return {Buff} This instance of Buff.
	 */
	setUint8(i, v) {
		if (0 <= i && i < this.length8.valueOf()) {
			this.#view.setUint8(i, v, true);
			return this;
		}

		throw new RangeError(`The 8-bit index must lie in [0, ${this.length8.valueOf()})`);
	}

	/**
	 * Sets the 16-bit value at location i in the 0-based index buffer. Fails if the provided index does not fall within
	 * a valid accessing range, or if the 16-bit length (length16) is undefined.
	 * 
	 * @param {Number} i The index of the 16-bit value location to access.
	 * @param {Number} v The unsigned 16-bit value to place at location i
	 * 
	 * @return {Buff} This instance of Buff.
	 */
	setUint16(i, v) {
		if (0 <= i && i < this.length16.valueOf()) {
			this.setUint8(2 * i, v & 0xff);
			this.setUint8(2 * i + 1, (v >> 8) & 0xff);
			return this;
		}

		throw new RangeError(`The 16-bit index must lie in [0, ${this.length16.valueOf()})`);
	}

	/**
	 * Sets the 32-bit value at location i in the 0-based index buffer. Fails if the provided index does not fall within
	 * a valid accessing range, or if the 32-bit length (length32) is undefined.
	 * 
	 * @param {Number} i The index of the 32-bit value location to access.
	 * @param {Number} v The unsigned 32-bit value to place at location i
	 * 
	 * @return {Buff} This instance of Buff.
	 */
	setUint32(i, v) {
		if (0 <= i && i < this.length32.valueOf()) {
			this.setUint16(2 * i, v & 0xffff);
			this.setUint16(2 * i + 1, (v >> 16) & 0xffff);
			return this;
		}

		throw new RangeError(`The 32-bit index must lie in [0, ${this.length32.valueOf()})`);
	}

	/**
	 * Sets the 64-bit value at location i in the 0-based index buffer. Fails if the provided index does not fall within
	 * a valid accessing range, or if the 64-bit length (length64) is undefined.
	 * 
	 * @param {Number} i The index of the 64-bit value location to access.
	 * @param {Number, BigInt} v The unsigned 64-bit value to place at location i
	 * 
	 * @return {Buff} This instance of Buff.
	 */
	setUint64(i, v) {
		if (0 <= i && i < this.length64.valueOf()) {
			const val = BigInt(v);
			this.setUint32(2 * i, Number(val & 0xffffffffn));
			this.setUint32(2 * i + 1, Number((val >> 32n) & 0xffffffffn));
			return this;
		}

		throw new RangeError(`The 64-bit index must lie in [0, ${this.length64.valueOf()})`);
	}

	/**
	 * Sets the 128-bit value at location i in the 0-based index buffer. Fails if the provided indx does not fall within
	 * a valid accessing range, or if the 128-bit length (length128) is undefined.
	 * 
	 * @param {Number} i The index of the 128-bit value location to access.
	 * @param {Number, BigInt} v The unsigned 128-bit value to place at location i
	 * 
	 * @return {Buff} This instance of Buff.
	 */
	setUint128(i, v) {
		if (0 <= i && i < this.length128.valueOf()) {
			const val = BigInt(v);
			this.setUint64(2 * i, val & 0xffffffffffffffffn);
			this.setUint64(2 * i + 1, (val >> 64n) & 0xffffffffffffffffn);
			return this;
		}

		throw new RangeError(`The 128-bit index must lie in [0, ${this.length128.valueOf()})`);
	}

	/**
	 * Prepends the data of the input Buff object internally to this Buff.
	 * 
	 * @param {Buff} buff The buffer whose data we should prepend to this Buff's buffer.
	 * 
	 * @return {Buff} This instance of Buff.
	 */
	prepend(buff) {
		// New container for joined data
		const data = Buff.newArrayBuffer(this.length8 + buff.length8);

		// First copy the external buffer's data
		for (let i = 0; i < buff.length8; i++)
			data.view.setUint8(i, buff.getUint8(i), true);

		// Then copy this buffer's data
		for (let i = buff.length8; i < data.length.length8; i++)
			data.view.setUint8(i, this.getUint8(i - buff.length8), true);

		// Update this Buff's internal state
		this.#payload = data.buffer;
		this.#view = data.view;
		this.#length = data.length;
	}

	/**
	 * Appends the data of the input Buff object internally to this Buff.
	 * 
	 * @param {Buff} buff The buffer whose data we should append to this Buff's buffer.
	 * 
	 * @return {Buff} This instance of Buff.
	 */
	append(buff) {
		// New container for joined data
		const data = Buff.newArrayBuffer(this.length8 + buff.length8);

		// First copy this buffer's data
		for (let i = 0; i < this.length8; i++)
			data.view.setUint8(i, this.getUint8(i), true);

		// Then copy the external buffer's data
		for (let i = this.length8; i < data.length.length8; i++)
			data.view.setUint8(i, buff.getUint8(i - this.length8), true);

		// Update this Buff's internal state
		this.#payload = data.buffer;
		this.#view = data.view;
		this.#length = data.length;
	}

	/**
	 * @return {String} A string representation of the internal state of the buffer for debugging purposes.
	 */
	toString() {
		let s = `Buff<${this.length8 > 0 ? this.getUint8(0).toString(16).padStart(2, '0') : ''}`;
		for (let i = 1; i < this.length8; i++)
			s += ` ${this.getUint8(i).toString(16).padStart(2, '0')}`;

		return s + '>';
	}
}
