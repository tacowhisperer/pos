/**
 * MMakr Library
 * https://github.com/tacowhisperer
 *
 * Pollutes "mmakr" global namespace, if applicable.
 * 
 * Date: Mar 1, 2022
 * @author tacowhisperer
 */
(function (globe) {

})((function(o){var e={global:null,import:function(o){console.log("default import: "+o)},export:function(o){console.log("default export: "+o)}},t=function(){try{return eval("let i=0;const p=new Promise();"),!0}catch(o){return!1}}();if(t){var n="'use strict';const o={};'object'==typeof module&&'object'==typeof module.exports?(o.global=module,o.import=o=>new Promise(((e,t)=>e(require(o)))),o.export=o=>module.exports=o):'object'==typeof window&&'object'==typeof window.document&&(o.global=window,o.import=o=>import(o),o.export=o=>{export default o})";e=eval(n)}else"object"==typeof window&&"object"==typeof window.document&&("object"!=typeof window[o]&&(window[o]={}),e.global=window,e.import=function(e){window[o][e]||console.error(e+" library does not exist in window."+o)},e.export=function(e){window[o][e.name]=e})})("mmakr"));

const _64_BITS = 8; // bytes
const BLOCK_BYTES = 128;

// Max message size in bytes
const M_LIMIT = 2n ** 128n - 1n;

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
	[ 10,  2,  8,  4,  7,  6,  1,  5, 15, 11,  9, 14,  3, 12, 13 , 0 ]
];

// Transparently obtained IV values used by the BLAKE2b algorithm
const IV = new Buff(8 * _64_BITS);
IV.setUint64(0, 0x6a09e667f3bcc908n); // Frac(sqrt(2))
IV.setUint64(1, 0xbb67ae8584caa73bn); // Frac(sqrt(3))
IV.setUint64(2, 0x3c6ef372fe94f82bn); // Frac(sqrt(5))
IV.setUint64(3, 0xa54ff53a5f1d36f1n); // Frac(sqrt(7))
IV.setUint64(4, 0x510e527fade682d1n); // Frac(sqrt(11))
IV.setUint64(5, 0x9b05688c2b3e6c1fn); // Frac(sqrt(13))
IV.setUint64(6, 0x1f83d9abfb41bd6bn); // Frac(sqrt(17))
IV.setUint64(7, 0x5be0cd19137e2179n); // Frac(sqrt(19))

// Rotates a 64-bit number to the right by n bits
const rotr64 = (bigUint64, n) => (bigUint64 >> n) | (bigUint64 << (64n - n));

// Mix function
function G(V, a, b, c, d, x, y) {
	V.setUint64(a, V.getUint64(a) + V.getUint64(b) + x);
	V.setUint64(d, rotr64(V.getUint64(d) ^ V.getUint64(a), 32n));

	V.setUint64(c, V.getUint64(c) + V.getUint64(d));
	V.setUint64(b, rotr64(V.getUint64(b) ^ V.getUint64(c), 24n));

	V.setUint64(a, V.getUint64(a) + V.getUint64(b) + y);
	V.setUint64(d, rotr64(V.getUint64(d) ^ V.getUint64(a), 16n));

	V.setUint64(c, V.getUint64(c) + V.getUint64(d));
	V.setUint64(b, rotr64(V.getUint64(b) ^ V.getUint64(c), 63n));
}

// Compress function
function F(h, m, t, isLastBlock) {
	// Set up local work vector V
	const V = new Buff(2 * 8 * _64_BITS);
	for (let i = 0; i < (V.length64 / 2); i++) {
		V.setUint64(i + 0, h.getUint64(i));
		V.setUint64(i + 8, IV.getUint64(i));
	}

	// Mix the 128-bit counter t into V[12:13]
	const tBuff = new Buff(2 * _64_BITS).setUint128(0, t);
	V.setUint64(12, V.getUint64(12) ^ tBuff.getUint64(0));
	V.setUint64(13, V.getUint64(13) ^ tBuff.getUint64(1));

	// Invert all of the bits in V[14] if this is the last block
	if (isLastBlock)
		V.setUint64(14, V.getUint64(14) ^ 0xffffffffffffffffn);

	// Twelve rounds of cryptographic message mixing
	for (let i = 0; i < 12; i++) {
		// Select message mixing schedule for this round.
		const S = SIGMA[i % SIGMA.length];

		G(V, 0, 4,  8, 12, m.getUint64(S[0]), m.getUint64(S[1]));
		G(V, 1, 5,  9, 13, m.getUint64(S[2]), m.getUint64(S[3]));
		G(V, 2, 6, 10, 14, m.getUint64(S[4]), m.getUint64(S[5]));
		G(V, 3, 7, 11, 15, m.getUint64(S[6]), m.getUint64(S[7]));

		G(V, 0, 5, 10, 15, m.getUint64(S[8]), m.getUint64(S[9]));
		G(V, 1, 6, 11, 12, m.getUint64(S[10]), m.getUint64(S[11]));
		G(V, 2, 7,  8, 13, m.getUint64(S[12]), m.getUint64(S[13]));
		G(V, 3, 4,  9, 14, m.getUint64(S[14]), m.getUint64(S[15]));
	}

	// Mix the upper and lower halves of V into h
	for (let i = 0; i < (V.length64 / 2); i++) {
		h.setUint64(i, h.getUint64(i) ^ V.getUint64(i + 0));
		h.setUint64(i, h.getUint64(i) ^ V.getUint64(i + 8));
	}
}

// BLAKE2b hashing function
function blake2b(msg, key = '', cbHashLen = 64) {
	// Initialize the message data structure
	const M = new Buff(msg);
	let cbMessageLen = M.length8; 

	// Initialize the key data structure
	const Key = new Buff(key);
	const cbKeyLen = Key.length8;

	// Validate message, key, and cbHashLen sizes
	if (cbKeyLen > 64/*bytes*/)
		throw new RangeError(`The key length must be between 0 and 64 inclusive (got ${cbKeyLen}).`);
	if (cbMessageLen > M_LIMIT)
		throw new RangeError(`The message length must not exceed 2^128 - 1 bytes (impressive).`);
	if (cbHashLen < 1/*byte*/ || cbHashLen > 64/*bytes*/)
		throw new RangeError(`The output hash bytes must be between 1 and 64 inclusive (got ${cbHashLen}).`);

	// Initialize State vector h with IV
	const h = new Buff(IV);

	// Mix key size (cbKeyLen) and desired hash length (cbHashLen) into h[0]
	h.setUint64(0, h.getUint64(0) ^ (0x01010000n ^ (BigInt(cbKeyLen) << 8n) ^ BigInt(cbHashLen)));

	// Keep track of the number of bytes that have been compressed
	let cBytesCompressed = 0;
	let cBytesRemaining = cbMessageLen;

	// Pad the key with trailing zeros to be 128 bytes and prepend it to M if key is provided
	if (cbKeyLen > 0) {
		M.prepend(Key.append(new Buff(BLOCK_BYTES - cbKeyLen)));
		cBytesRemaining += BLOCK_BYTES;
	}

	// Compress 128 bytes of message M at a time, except the last 128 byte chunk
	const chunk = new Buff(BLOCK_BYTES);
	while (cBytesRemaining > BLOCK_BYTES) {
		for (let i = 0; i < BLOCK_BYTES; i++)
			chunk.setUint8(i, M.getUint8(i + cBytesCompressed));

		cBytesCompressed += BLOCK_BYTES;
		cBytesRemaining -= BLOCK_BYTES;

		F(h, chunk, cBytesCompressed, false);
	}

	// Compress the final bytes in M
	chunk.zero();
	for (let i = 0; i < cBytesRemaining; i++)
		chunk.setUint8(i, M.getUint8(i + cBytesCompressed));

	cBytesCompressed += cBytesRemaining;
	cBytesRemaining = 0;

	F(h, chunk, cBytesCompressed, true);

	// Extract the first cbHashLen bytes of the little endian state vector h as a hexadecimal string
	const output = [];
	for (let i = 0; i < cbHashLen; i++)
		output.push(h.getUint8(i));

	return output.map(b => b.toString(16).padStart(2, '0')).join('');
}
