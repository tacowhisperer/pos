/**
 * @author tacowhisperer
 */

/**
 * Parses a mathematical representation of a vector and a set into a JavaScript Array and Set. This method is only
 * exposed through the module.
 *
 * @param {String} str The string to parse
 *
 * @return {Collection} A collection consisting of Array and Set objects of the input string.
 */
(function (mod, win) {
	function parseCollection(str) {
		// Holds all of the valid tokens of the incoming string
		class Token {
			static WHITESPACE = new Token("\\s");
			static OPEN_ARRAY = new Token("\\[");
			static CLOSE_ARRAY = new Token("\\]");
			static OPEN_SET = new Token("\\{");
			static CLOSE_SET = new Token("\\}");
			static COMMA = new Token(",");
			static PACKET = new Token("[^\\[\\]\\{\\},]");

			// This one should never be matched since we always feed the static match method strings at least 1 char long.
			static UNKNOWN_TOKEN = new Token("^$");

			// Obtain all standard class properties that we are not interested in, plus this variable and the match method
			// https://stackoverflow.com/questions/33069692/getting-a-list-of-statics-on-an-es6-class
			static tokens = Object.getOwnPropertyNames(Token)
				.filter(prop => !Object.getOwnPropertyNames(class _{}).concat(["tokens", "match"]).includes(prop));

			// Loops through each token pattern to try and find the right Token to return
			static match(string) {
				for (const token of Token.tokens) {
					if (string.match(Token[token].pattern))
						return Token[token];
				};

				return Token.UNKNOWN_TOKEN;
			}

			constructor(pattern) {
				this.pattern = new RegExp(pattern);
			}
		}

		// Token that holds the data found by a PACKET pattern
		class Packet extends Token {
			#payload;

			constructor(payload) {
				super("");
				this.#payload = payload;
			}

			get payload() {
				return this.#payload;
			}
		}

		// Tokenizes the input vector
		function tokenizeCollection(v) {
			// Container for all tokens identified in the incoming string.
			const tokens = [];

			let payload = '';
			for (let i = 0; i < v.length; i++) {
				// We don't care about whitespace characters (assuming that payloads do not have whitespace in them)
				if (!v.charAt(i).match(Token.WHITESPACE.pattern)) {
					if (v.charAt(i).match(Token.PACKET.pattern)) {
						payload += v.charAt(i);
					} else {
						// This is not a PACKET token, so we must first deal with whatever has been found with a Packet.
						if (payload !== '') {
							tokens.push(new Packet(payload));
							payload = '';
						}

						// Let the Token class handle the rest
						tokens.push(Token.match(v.charAt(i)));
					}
				}
			}

			// Add any remaining payload that wasn't closed off at the end
			if (payload !== '')
				tokens.push(new Packet(payload));

			return tokens;
		}

		// Is used to build the incoming data structure spec. This class should not be instantiated directly.
		class Node {
			#parent;
			#children;

			constructor(parent, children) {
				this.#parent = parent;
				this.#children = children;
			}

			get parent() {
				return this.#parent;
			}

			set parent(node) {
				if (!(node instanceof Node))
					throw 'CompositionError: Parent node must be a Node object.';

				this.#parent = node;
			}

			get children() {
				return this.#children;
			}

			collapse() {
				return new this.#children.constructor(...[...this.#children].map(child => child.collapse()));
			}

			addChild(child) {
				child.parent = this;
			}

			isLeaf() {
				return false;
			}

			isRoot() {
				return false;
			}

			root() {
				let root = this;

				while (root.parent !== RootNode.ROOT)
					root = root.parent;

				return root;
			}
		}

		class RootNode extends Node {
			static ROOT = new RootNode();

			constructor() {
				super(null, null);
			}

			get parent() {
				throw 'CompositionError: Cannot get parent of ROOT node.';
			}

			set parent(node) {
				throw 'CompositionError: Cannot set parent of ROOT node.';
			}

			get children() {
				// Do nothing.
			}

			collapse() {
				// Do nothing.
			}

			addChild(child) {
				// Do nothing.
			}

			isRoot() {
				return true;
			}

			root() {
				return this;
			}
		}

		class ArrayNode extends Node {
			constructor() {
				super(RootNode.ROOT, new Array());
			}

			addChild(child) {
				super.addChild(child);
				this.children.push(child);
			}
		}

		class SetNode extends Node {
			constructor() {
				super(RootNode.ROOT, new Array());
			}

			addChild(child) {
				super.addChild(child);
				this.children.push(child);
			}

			collapse() {
				return new Set(super.collapse());
			}
		}

		class LeafNode extends Node {
			#payload;

			constructor(payload) {
				super(RootNode.ROOT, null);
				this.#payload = payload;
			}

			collapse() {
				return this.#payload;
			}

			addChild(child) {
				throw 'CompositionError: Cannot add child to LEAF node.';
			}

			isLeaf() {
				return true;
			}
		}

		// Parses the tokenized array into its specified data structure.
		const PLACED = true;
		const CONSUMED = false;
		function parseCollectionHelper(tokens, dataStruct, arrayLevel = 0, setLevel = 0, nextValue = CONSUMED) {
			// Unbalanced base case
			if (arrayLevel < 0 || setLevel < 0)
				throw `SyntaxError: Unbalanced ${arrayLevel < 0 ? 'ARRAY' : 'SET'} token encountered.`;

			// Base case
			if (tokens.length === 0) {
				if (arrayLevel !== 0 && setLevel !== 0)
					throw `SyntaxError: Unbalanced ${arrayLevel !== 0 ? 'ARRAY' : 'SET'} token encountered.`;

				else if (nextValue === PLACED)
					throw 'SyntaxError: Unexpected end of sequence.';

				return dataStruct.root();
			}

			// Extract the relevant bits we will work with
			const token = tokens[0];
			const tail = tokens.slice(1);

			if (token instanceof Token) {
				switch (token) {
					case Token.OPEN_ARRAY:
						var collection = new ArrayNode();
						dataStruct.addChild(collection);

						return parseCollectionHelper(tail, collection, arrayLevel + 1, setLevel, PLACED);

					case Token.OPEN_SET:
						var collection = new SetNode();
						dataStruct.addChild(collection);
						
						return parseCollectionHelper(tail, collection, arrayLevel, setLevel + 1, PLACED);

					case Token.CLOSE_ARRAY:
						if (!(dataStruct instanceof ArrayNode))
							throw 'SyntaxError: Unexpected CLOSE_ARRAY token encountered.';

						return parseCollectionHelper(tail, dataStruct.parent, arrayLevel - 1, setLevel, CONSUMED);

					case Token.CLOSE_SET:
						if (!(dataStruct instanceof SetNode))
							throw 'SyntaxError: Unexpected CLOSE_SET token encountered.';

						return parseCollectionHelper(tail, dataStruct.parent, arrayLevel, setLevel - 1, CONSUMED);

					case Token.COMMA:
						if (nextValue === PLACED || (arrayLevel === 0 && setLevel === 0))
							throw 'SyntaxError: Unexpected COMMA token encountered.';

						return parseCollectionHelper(tail, dataStruct, arrayLevel, setLevel, PLACED);

					case Token.WHITESPACE:
					case Token.UNKNOWN_TOKEN:
						console.log(token);
						throw 'SyntaxError: Unexpected UNKNOWN_TOKEN encountered.';

					// We have a Packet with a payload.
					default:
						if (nextValue === CONSUMED)
							throw 'SyntaxError: Unexpected PAYLOAD token encountered.';

						dataStruct.addChild(new LeafNode(token.payload));
						return parseCollectionHelper(tail, dataStruct, arrayLevel, setLevel, CONSUMED);
				}
			}

			// Can't parse a non-token value
			console.log(token);
			throw 'SyntaxError: Unexpected non-token value encountered.';
		}
		
		// Execute the main helper function for generating the final data structure.
		return parseCollectionHelper(tokenizeCollection(str), new ArrayNode()).collapse()[0];
	}

	if (typeof mod === 'object' && typeof mod.exports === 'object')
		mod.exports = parseCollection;

	else if (typeof win === 'object' && typeof win.document === 'object')
		win.mmakr.parseCollection = parseCollection;

})(module, window);
