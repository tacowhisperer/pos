const exec = require('child_process').exec;

/**
 * code adapted from:
 * https://stackoverflow.com/questions/19762350/execute-an-exe-file-using-node-js
 * 
 * Function to execute an exe
 * @param {string} command The command to execute.
 * @param {Array} params Array of string arguments to feed to the command.
 */
function execute(command, params) {
	return new Promise((resolve, reject) => {
		exec(command, params, (err, data) => {
			if (err)
				reject(err);

			resolve(data);
		});
	});
}

const NW_BIN = 'bin\\nw.exe';
const NW_DIR = 'src';

// Execute the NW.js binary executable.
execute(`${NW_BIN} ${NW_DIR}`).catch((err) => console.error(err));
