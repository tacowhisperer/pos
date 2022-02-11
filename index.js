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

// Binaries available for execution
const NW_BINS = ['nwjs-sdk-v0.60.0-win-x64', 'production'];;

// Which binary to use for this run
const NW_MODE = 0;

// Final location of the binary that will execute the application
const NW_BIN = `bin\\${NW_BINS[NW_MODE]}\\nw.exe`;

// Final location of the directory that cointains the necessary package.json and index.html files for NW.js
const NW_DIR = 'src';

// Execute the NW.js binary executable.
execute(`${NW_BIN} ${NW_DIR}`).catch((err) => console.error(err));
