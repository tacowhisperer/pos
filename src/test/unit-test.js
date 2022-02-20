function unit_test(whitelist) {
	let testID = 0;
	const fn = whitelist || function() {return true};

	function deepEquals(obj1, obj2) {
		if (typeof obj1 === typeof obj2) {
			if (typeof obj1 === 'object') {
				if (obj1.constructor.name === obj2.constructor.name) {
					switch (obj1.constructor.name) {
						case 'Set':
							if (obj1.size !== obj2.size)
								return false;

							var a = [...obj1];
							var b = [...obj2];

							a.sort();
							b.sort();

							for (let i = 0; i < a.length; i++)
								if (!deepEquals(a[i], b[i]))
									return false;

							return true;

						case 'Array':
							if (obj1.length !== obj2.length)
								return false;

							for (let i = 0; i < obj1.length; i++)
								if (!deepEquals(obj1[i], obj2[i]))
									return false;

							return true;

						case 'Output':
							// obj1 === obj2 are guaranteed to be equal when obj1 and obj2 are Output.NONE
							return obj1 === obj2 ? true : deepEquals(obj1.value, obj2.value);

						// Can't deep check any other data structure for the moment.
						default:
							return false;
					}
				}

				// Two objects are not instances of the same parent function.
				return false;
			}

			// Two primitives can be compared with JavaScript strict equals.
			return obj1 === obj2;
		}

		// Two primitives don't match.
		return false;
	}

	function test(input, expected) {
		if (fn(testID++)) {
			if ((testID - 1) > 0)
				console.log('');

			console.log(`Test #${testID - 1}`);
			console.log(`\tInput: ${input}`);
			console.log(`\tExpect: ${expected}`);
			console.log('');
			
			try {
				console.log(`\tOutput: ${assert(expected, (str) => JSON.stringify(parseCollection(str)), deepEquals, input)}`);
			} catch (err) {
				console.log(`\tTest Output Failure: Test failed with error:`);
				console.error(err);
			}
		}
	}

	// Test #0
	test('[]', Output.some('[]'));

	// Test #1
	test('[0]', Output.some('["0"]'));

	// Test #2
	test('[[5]]', Output.some('[["5"]]'));

	// Test #3
	test('[[0], 1]', Output.some('[["0"],"1"]'));

	// Test #4
	test('[[[[[[0]]]], [[1, 2, 3], [4]]], 5]', Output.some('[[[[[["0"]]]],[["1","2","3"],["4"]]],"5"]'));

	// Test #5
	test('[{[[[[0]]]], {[1, 2, 3], {4}}}, 5]', Output.some('[{[[[["0"]]]],{["1","2","3"],{"4"}}},"5"]'));

	// Test #6
	test('[}', Output.NONE);
}

