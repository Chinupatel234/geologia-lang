class GeologiaInterpreter{
    constructor(){
        this.strata = {}; // variables(sedimentary layers)
        this.methods = {}; // functions(rock formations)
        this.callHistory = []; // call stack - which function will be called first
        this.outputBuffer = []; // output
        this.currentLine = 0; // current execution point
        this.verbose = false; // debug tool

        // defining operations based on geological processes
        this.operations = {
            'erode': (a, b) => a - b, // subtraction
            'deposit': (a, b) => a + b, // addition
            'compress': (a, b) => a * b, // multiplication
            'dissolve': (a, b) => a / b, // dissolve
            'fracture': (a, b) => a % b, // modulo
            'metamorphose': (a, b) => Math.pow(a, b), // exponentiation
            'crystallize': (a) => Math.sqrt(a), // square root
            'subduct': (a) => -a // negation
        };

        // conditions based on the rock/stone properites
        this.comparisons = {
            'harder': (a, b) => a > b,
            'softer': (a, b) => a < b,
            'samehardness': (a, b) => a === b,
            'diffhardness': (a, b) => a !== b,
            'atleasthardas': (a, b) => a >= b,
            'atmostsoftas': (a, b) => a <= b,
        };

        // data types
        this.dataTypes = {
            'igneous': Number, // number
            'sedimentary': String, // string
            'metamorphic': Boolean // bool
        };
    }

    interpret(code){
        // removes the comments, any content after #fossil#
        code = code.split('\n').map(codeLine => {
            const commentIndex = codeLine.indexOf('#fossil#');
            return commentIndex !== -1 ? codeLine.substring(0, commentIndex).trim() : codeLine.trim();
        }).join('\n');

        // splits the code into different parts for processing
        const codeLines = code.split('\n').map(codeLine => codeLine.trim()).filter(codeLine => codeLine.length > 0);
        this.programLines = codeLines;

        // executes the program line by line
        for(let linePos = 0; linePos < codeLines.length; linePos++){
            if(this.verbose){
                console.log(`Executing line ${linePos}: ${codeLines[linePos]}`);
            }
            const nextLine = this.processLine(codeLines[linePos], linePos, codeLines);

            // handles skipping the line for control flow
            if(typeof nextLine === 'number' && nextLine !== linePos + 1){
                linePos = nextLine - 1; // -1 because the loop will increment linePos
            }
        }

        return this.outputBuffer.join('\n');
    }

    processLine(codeLine, linePos, allLines){
        const parts = this.parseLine(codeLine);
        if(parts.length === 0){
            return linePos + 1;
        }

        const instruction = parts[0];
        // declaration and assignment of variable
        if(instruction === 'sediment'){
            const varName = parts[1];
            const varType = parts[2];
            let varValue;

            if(parts[3] === 'core_sample'){
                // input from user
                const promptText = parts.slice(4).join(' ').replace(/"/g, '');

                if(typeof window !== 'undefined'){
                    varValue = prompt(promptText || "Enter a value:");
                }
                else{
                    const readline = require('readline').createInterface({
                        input: process.stdin,
                        output: process.stdout
                    });

                    // using Promise to read lines synchronously
                    const getInput = () => new Promise(resolve => {
                        readline.question(promptText || "Enter a value: ", answer => {
                            readline.close();
                            resolve(answer);
                        });
                    });

                    // trying to get the input synchronously
                    try{
                        varValue = require('child_process').execSync('read -p "' + (promptText || "Enter a value: ") + '" answer && echo $answer',
                        { stdio: 'inherit', shell: true }).toString().trim();
                    }
                    catch(error){
                        // if the method doesn't work
                        console.log(promptText || "Enter a value: ");
                        varValue = require('fs').readFileSync(0).toString().trim();
                    }
                }

                // converting to appropriate type
                if(varType === 'igneous' && !isNaN(varValue)){
                    varValue = Number(varValue);
                }
                else if(varType === 'metamorphic'){
                    varValue = varValue.toLowerCase() === 'true';
                }
            }
            else{
                varValue = this.evaluateExpression(parts.slice(3));
            }
            this.strata[varName] = varValue;

            if(this.verbose){
                console.log(`Set ${varName} to ${varValue} (${typeof varValue})`);
            }

            return linePos + 1;
        }
        else if(instruction === 'expose'){
            // output
            const outputValue = this.evaluateExpression(parts.slice(1));
            this.outputBuffer.push(outputValue);
            console.log(outputValue);
            return linePos + 1;
        }
        else if(instruction === 'strata_if'){
            // conditional
            const thenIndex = parts.indexOf('then');
            const conditionResult = this.evaluateCondition(parts.slice(1, thenIndex));
            const jumpLabel = parts[thenIndex + 1];

            if(this.verbose){
                console.log(`Condition evaluated to: ${conditionResult}, jumping to: ${jumpLabel}`);
            }

            if(!conditionResult){
                // find the label in the code
                for(let i = 0; i < allLines.length; i++){
                    if(allLines[i].trim() === jumpLabel){
                        return i + 1; // jumps to the next line after the label
                    }
                }
            }

            return linePos + 1;
        }
        else if(instruction === 'goto'){
            // goto label
            const jumpLabel = parts[1];
            if(this.verbose){
                console.log(`Goto ${jumpLabel}`);
            }

            // finds the label in the code
            for(let i = 0; i < allLines.length; i++){
                if(allLines[i].trim() === jumpLabel){
                    return i + 1; // jumps to the next line after the label
                }
            }

            return linePos + 1;
        }
        else if(instruction === 'era'){
            // era name - function definition
            const funcName = parts[1];

            // finds the end of the function
            let funcEnd = linePos + 1;
            while(funcEnd < allLines.length && allLines[funcEnd] !== 'extinction'){
                funcEnd++;
            }

            // stores the function
            this.methods[funcName] = {
                startLine: linePos + 1,
                endLine: funcEnd
            };

            if(this.verbose){
                console.log(`Defined function ${funcName} from line ${linePos + 1} to ${funcEnd}`);
            }

            return funcEnd + 1; // skips to the next line after the function
        }
        else if(instruction === 'intrusion'){
            // function call
            const funcName = parts[1];
            const func = this.methods[funcName];
            if(func){
                const funcArgs = parts.slice(2);
                for(let i = 0; i < funcArgs.length; i++){
                    const argValue = this.evaluateExpression([funcArgs[i]]);
                    this.strata[`param${i}`] = argValue;
                }

                this.callHistory.push(linePos + 1);
                if(this.verbose){
                    console.log(`Calling function ${funcName} with args:`, funcArgs);
                }

                return func.startLine;
            }

            return linePos + 1; // if the function not found, then return to the next line
        }
        else if(instruction === 'uplift'){
            // return from function
            const returnVal = parts.length > 1 ? this.evaluateExpression(parts.slice(1)) : null;
            this.strata['_return'] = returnVal;

            if(this.verbose){
                console.log(`Returning value: ${returnVal}`);
            }

            // returns to the caller function
            if(this.callHistory.length > 0){
                const returnPoint = this.callHistory.pop();
                return returnPoint;
            }

            return linePos + 1; // if not a function, then just continue to the next line
        }

        return linePos + 1;
    }

    parseLine(codeLine){
        // Split by spaces, but keep quoted strings together
        const parts = [];
        let currentPart = '';
        let inQuotes = false;
        let quoteChar = '';

        for(let i = 0; i < codeLine.length; i++){
            const char = codeLine[i];
            if((char === '"' || char === "'") && (i === 0 || codeLine[i - 1] !== '\\')){
                if(!inQuotes){
                    inQuotes = true;
                    quoteChar = char;
                    currentPart += char;
                }
                else if(char === quoteChar){
                    inQuotes = false;
                    currentPart += char;
                }
                else{
                    currentPart += char;
                }
            }
            else if(char === ' ' && !inQuotes){
                if(currentPart){
                    parts.push(currentPart);
                    currentPart = '';
                }
            }
            else{
                currentPart += char;
            }
        }

        if(currentPart){
            parts.push(currentPart);
        }

        return parts;
    }

    evaluateExpression(parts){
        if(parts.length === 0) return null;

        if(parts.length === 1){
            const item = parts[0];

            // check if it's a variable
            if(this.strata.hasOwnProperty(item)){
                return this.strata[item];
            }

            // check if it's a number or not
            if(!isNaN(item)){
                return Number(item);
            }

            // check if it's a string
            if((item.startsWith('"') && item.endsWith('"')) || (item.startsWith("'") && item.endsWith("'"))){
                return item.slice(1, -1);
            }

            return item;
        }

        // process geological operations
        if(parts.length === 3){
            const leftItem = parts[0];
            const op = parts[1];
            const rightItem = parts[2];
            const leftVal = this.getValueOf(leftItem);
            const rightVal = this.getValueOf(rightItem);

            if(op === 'deposit'){
                return Number(leftVal) + Number(rightVal);
            }
            else if(op === 'erode'){
                return Number(leftVal) - Number(rightVal);
            }
            else if(op === 'compress'){
                return Number(leftVal) * Number(rightVal);
            }
            else if(op === 'dissolve'){
                return Number(leftVal) / Number(rightVal);
            }
            else if(op === 'fracture'){
                return Number(leftVal) % Number(rightVal);
            }
            else if(op === 'metamorphose'){
                return Math.pow(Number(leftVal), Number(rightVal));
            }
        }

        return parts.join(' ');
    }

    evaluateCondition(parts){
        if(parts.length === 1){
            const value = this.getValueOf(parts[0]);
            return Boolean(value);
        }

        // process geological properties (comparisons)
        if(parts.length === 3){
            const leftItem = parts[0];
            const compOp = parts[1];
            const rightItem = parts[2];
            const leftVal = this.getValueOf(leftItem);
            const rightVal = this.getValueOf(rightItem);

            if(compOp === 'harder'){
                return Number(leftVal) > Number(rightVal);
            }
            else if(compOp === 'softer'){
                return Number(leftVal) < Number(rightVal);
            }
            else if(compOp === 'samehardness'){
                return Number(leftVal) === Number(rightVal);
            }
            else if(compOp === 'diffhardness'){
                return Number(leftVal) !== Number(rightVal);
            }
            else if(compOp === 'atleasthardas'){
                return Number(leftVal) >= Number(rightVal);
            }
            else if(compOp === 'atmostsoftas'){
                return Number(leftVal) <= Number(rightVal);
            }
        }

        return false;
    }

    getValueOf(item){
        // Get the actual value of a token
        if(this.strata.hasOwnProperty(item)){
            return this.strata[item];
        }
        if(!isNaN(item)){
            return Number(item);
        }
        if((item.startsWith('"') && item.endsWith('"')) || (item.startsWith("'") && item.endsWith("'"))){
            return item.slice(1, -1);
        }

        return item;
    }

    enableVerboseMode(){
        this.verbose = true;
    }

    disableVerboseMode(){
        this.verbose = false;
    }
}

// function to run a GEOLOGIA program
function executeGeologia(code, verboseMode = false){
    const interpreter = new GeologiaInterpreter();
    if(verboseMode){
        interpreter.enableVerboseMode();
    }

    return interpreter.interpret(code);
}

// for node and browser
if(typeof module !== 'undefined' && module.exports){
    module.exports = {
        executeGeologia, GeologiaInterpreter
    };
}
else if(typeof window !== 'undefined'){
    window.executeGeologia = executeGeologia;
    window.GeologiaInterpreter = GeologiaInterpreter;
}
