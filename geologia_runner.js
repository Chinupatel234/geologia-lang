const fs = require('fs');
const path = require('path');
const { executeGeologia, GeologiaInterpreter } = require('./geologia_interpreter.js');

// processing command line arguments
const args = process.argv.slice(2);

if(args.length === 0){
    console.log('GEOLOGIA Language Runner');
    console.log('Usage:');
    console.log('node geologia_runner.js <filename.geo> [--verbose]');
    console.log('node geologia_runner.js --interactive');
    process.exit(0);
}

// check for verbose flag
const verboseMode = args.includes('--verbose');
const filename = args.find(arg => !arg.startsWith('--'));
const interactiveMode = args.includes('--interactive');

if(interactiveMode){
    // run in interactive mode
    console.log('GEOLOGIA Interactive Mode');
    console.log('Type your code and end with Ctrl+D (Unix) or Ctrl+Z (Windows)');
    console.log('Press Ctrl+C to exit');

    let code = '';
    process.stdin.setEncoding('utf8');

    process.stdin.on('data', (data) => {
        code += data;
    });

    process.stdin.on('end', () => {
        console.log('\nRunning your GEOLOGIA code:');

        try{
            const result = executeGeologia(code, verboseMode);
            console.log('\nOutput:');
            console.log(result);
        } 
        catch(error){
            console.error('Error:', error.message);
        }
    });
} 
else if(filename){
    // running a file
    console.log(`Running ${filename} with GEOLOGIA interpreter${verboseMode ? ' (verbose mode)' : ''}`);

    try{
        const code = fs.readFileSync(filename, 'utf8');
        const result = executeGeologia(code, verboseMode);
        console.log('\nOutput:');
        console.log(result);
    } 
    catch(error){
        console.error('Error:', error.message);
    }
} 
else{
    console.log('No filename provided. Use --interactive for interactive mode.');
}
