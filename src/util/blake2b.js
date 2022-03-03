/**
 * MMakr Library
 * https://github.com/tacowhisperer
 *
 * Pollutes "mmakr" global namespace, if applicable.
 * 
 * Date: Mar 1, 2022
 * @author tacowhisperer
 */
(function (mod, win) {
	const _8_BITS = 1;
	const _16_BITS = 2;
	const _64_BITS = 8;
	const _BLOCK_BYTES = 128;

	// https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/DataView
	const isLittleEndian = (function() {
		let buf = new ArrayBuffer(_16_BITS);
		new DataView(buf).setInt16(0, 256, true);

		return new Int16Array(buf)[0] === 256;
	})();

	function typedArrayWrite(type, buffer, byteOffset, value) {
		new DataView(buffer)[`set${type}`](byteOffset, value, isLittleEndian);
	}

	function typedArrayRead(type, buffer, byteOffset) {
		return new DataView(buffer)[`get${type}`](byteOffset, isLittleEndian);
	}

	// Max message limit
	const M_LIMIT = 340282366920938463463374607431768211456n;

	// Mixing scheduler SIGMA
	const SIGMA = [
		[  0,  1,  2,  3,  4,  5,  6,  7,  8,  9, 10, 11, 12, 13, 14, 15 ],
		[ 14, 10,  4,  8,  9, 15, 13,  6,  1, 12,  0,  2, 11,  7,  5,  3 ],
		[ 11,  8, 12,  0,  5,  2, 15, 13, 10, 14,  3,  6,  7,  1,  9,  4 ],
		[  7,  9,  3,  1, 13, 12, 11, 14,  2,  6,  5, 10,  4,  0, 15,  8 ],
		[  9,  0,  5,  7,  2,  4, 10, 15, 14,  1, 11, 12,  6,  8,  3, 13 ],
		[  2, 12,  6, 10,  0, 11,  8,  3,  4, 13,  7,  5, 15, 14,  1,  9 ],
		[ 12,  5,  1, 15, 14, 13,  4, 10,  0,  7,  6,  3,  9,  2,  8, 11 ],
		[ 13, 11,  7, 14, 12,  1,  3,  9,  5,  0, 15,  4,  8,  6,  2, 10 ],
		[  6, 15, 14,  9, 11,  3,  0,  8, 12,  2, 13,  7,  1,  4, 10,  5 ],
		[ 10,  2,  8,  4,  7,  6,  1,  5, 15, 11,  9, 14,  3, 12, 13 , 0 ],
	];

	// Transparently obtained IV values used by the BLAKE2b algorithm
	const IV = new ArrayBuffer(8 * _64_BITS);
		typedArrayWrite('BigUint64', IV, 0 * _64_BITS, 0x6a09e667f3bcc908n); // Frac(sqrt(2))
		typedArrayWrite('BigUint64', IV, 1 * _64_BITS, 0xbb67ae8584caa73bn); // Frac(sqrt(3))
		typedArrayWrite('BigUint64', IV, 2 * _64_BITS, 0x3c6ef372fe94f82bn); // Frac(sqrt(5))
		typedArrayWrite('BigUint64', IV, 3 * _64_BITS, 0xa54ff53a5f1d36f1n); // Frac(sqrt(7))
		typedArrayWrite('BigUint64', IV, 4 * _64_BITS, 0x510e527fade682d1n); // Frac(sqrt(11))
		typedArrayWrite('BigUint64', IV, 5 * _64_BITS, 0x9b05688c2b3e6c1fn); // Frac(sqrt(13))
		typedArrayWrite('BigUint64', IV, 6 * _64_BITS, 0x1f83d9abfb41bd6bn); // Frac(sqrt(17))
		typedArrayWrite('BigUint64', IV, 7 * _64_BITS, 0x5be0cd19137e2179n); // Frac(sqrt(19))

	function Mix(V, a, b, c, d, x, y) {
		// TODO: Implement this
	}

	function Compress(h, chunk, t, IsLastBlock) {
		// Setup local work vector V
		const V = new ArrayBuffer(2 * 8 * _64_BITS);
		for (let i = 0; i < 8; i++) {
			typedArrayWrite('BigUint64', V, i * _64_BITS, typedArrayRead('BigUint64', h, i * _64_BITS));
			typedArrayWrite('BigUint64', V, (i + 8) * _64_BITS, typedArrayRead('BigUint64', IV, i * _64_BITS));
		}

		// TODO: Finish this implementation.
	}
	
	function blake2b(msg, key, hashBytes = 32) {
		/* BOILERPLATE */

		// Convert the incoming JavaScript string key into a UTF-8 encoded typed Arrray
		const Key = new TextEncoder().encode(key);

		// Ensure that we have the correct key length
		const cbKeyLen = BigInt(Key.byteLength > 64 ? 64 : Key.byteLength);
		if (Key.byteLength > 64)
			console.warn(`Key length is greater than 64 bytes (got ${Key.byteLength} bytes). Truncation has occurred.`);

		// Ensure that we have a valid hash output byte length
		const cbHashLen = BigInt(hashBytes < 1 ? 1 : hashBytes > 64 ? 64 : hashBytes);
		if (hashBytes < 1 || hashBytes > 64)
			console.warn(`Hash output length does not fall in the range [1, 64] (generating ${cbHashLen} byte(s)).`);

		// Convert the incoming JavaScript string message into a UTF-8 encoding typed Array
		const utf8MArray = new TextEncoder().encode(msg);

		// Ensure that we have the correct message length size in bytes
		const cbMessageLen = utf8MArray.byteLength;
		if (cbMessageLen > M_LIMIT)
			console.warn(`Message input length exceeds 2^128 bytes, yet you're not out of RAM... Carry on, I guess.`);

		const mByteSize = utf8MArray.byteLength + (cbKeyLen > 0 ? _BLOCK_BYTES : 0);
		const M = new ArrayBuffer(mByteSize);

		// If there was a key supplied, then pad it with trailing zeros to make it 128-bytes and prepend it to message M
		// impl note: Space has already been made in the M ArrayBuffer, just allocate correctly.
		if (cbKeyLen > 0) {
			// Fill the key in the padded M buffer with zeros
			typedArrayWrite('BigUint64', M, 0 * _64_BITS, 0n);
			typedArrayWrite('BigUint64', M, 1 * _64_BITS, 0n);

			// Then write up to the first 64 bytes of the key to its offset in M
			for (let i = 0; i < cbKeyLen; i++)
				typedArrayWrite('Uint8', M, i * _8_BITS, Key[i]);
		}

		// Finally write the original M to the remaining buffer space
		const start = cbKeyLen > 0 ? _BLOCK_BYTES : 0;
		for (let i = start; i < mByteSize; i++)
			typedArrayWrite('Uint8', M, i * _8_BITS, utf8MArray[i - start]);

		/* BLAKE2b */

		// Initialize State vector h with IV
		const h = new ArrayBuffer(8 * _64_BITS);
		for (let i = 0; i < (IV.byteLength / _64_BITS); i++)
			typedArrayWrite('BigUint64', h, i * _64_BITS, typedArrayRead('BigUint64', IV, i * _64_BITS));

		// Mix the key size and desired hash length into h[0]
		const klhl = typedArrayRead('BigUint64', h, 0) ^ (0x01010000n | (cbKeyLen << 16n) | cbHashLen);
		typedArrayWrite('BigUint64', h, 0, klhl);

		// Each time we Compress we record how many bytes have been compressed
		let cBytesCompressed = 0;
		let cBytesRemaining = mByteSize;

		// Compress whole 128-byte chunks of the message, except the last chunk
		// impl note: the last chunk could potentially have fewer than 128 bytes of data, so give special treatment.
		let t = 0;
		const chunk = new ArrayBuffer(_BLOCK_BYTES);
		while (cBytesRemaining > _BLOCK_BYTES) {
			// Get the next 128 bytes of message M
			typedArrayWrite('BigUint64', chunk, 0 * _64_BITS, typedArrayRead('BigUint64', M, t * _64_BITS));
			typedArrayWrite('BigUint64', chunk, 1 * _64_BITS, typedArrayRead('BigUint64', M, t * _64_BITS + _64_BITS));
			t += 2;

			// Update byte counts
			cBytesCompressed += _BLOCK_BYTES;
			cBytesRemaining -= _BLOCK_BYTES;

			// Compress the chunk into the working vector h
			Compress(h, chunk, cBytesCompressed, false);
		}

		// Compress the final bytes from M.
		// impl note: This pair of typedArrayWrites implements the Pad function from the spec. cBytesRemaining <= 128
		typedArrayWrite('BigUint64', chunk, 0 * _64_BITS, 0n);
		typedArrayWrite('BigUint64', chunk, 1 * _64_BITS, 0n);
		for (let i = 0; i < cBytesRemaining; i++)
			typedArrayWrite('Uint8', chunk, i * _8_BITS, typedArrayRead('Uint8', M, i * _8_BITS + cBytesCompressed));

		// Update the final count of bytes that have been compressed
		cBytesCompressed += cBytesRemaining;

		// Compress the final chunk
		Compress(h, chunk, cBytesCompressed, true);

		/* OUTPUT EXTRACTION */

		const output = [];
		for (let i = 0; i < cbHashLen; i++)
			output.push(typedArrayRead('Uint8', h, i * _8_BITS));

		return output.map(b => b.toString(16).padStart(2, '0')).join('');
	}

	if (typeof mod === 'object' && typeof mod.exports === 'object')
		mod.exports = blake2b;

	else if (typeof win === 'object' && typeof win.document === 'object')
		win.mmakr.blake2b = blake2b;
})(module, window);
