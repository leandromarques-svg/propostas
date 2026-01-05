
const fs = require('fs');
const content = fs.readFileSync('c:\\Users\\LeandroMarques\\Desktop\\Confecção de Propostas\\components\\LaborCalculator.tsx', 'utf8');

let stack = [];
let lines = content.split('\n');
let inString = false;
let stringChar = '';

// Very basic parser. 
// Limitation: Doesn't handle comments // or /* */, which might contain braces.
// Limitation: Doesn't handle regex literals properly.
// But usually good enough to catch obvious missing structure in JSX.

for (let i = 0; i < lines.length; i++) {
    let line = lines[i];
    // Strip comments for checking
    let commentIndex = line.indexOf('//');
    if (commentIndex !== -1 && !inString) {
        line = line.substring(0, commentIndex);
    }

    for (let j = 0; j < line.length; j++) {
        let char = line[j];

        if (!inString) {
            if (char === '"' || char === "'") {
                inString = true;
                stringChar = char;
            } else if (char === '`') {
                inString = true;
                stringChar = '`';
            } else if (char === '{' || char === '(' || char === '[') {
                stack.push({ char, line: i + 1, col: j + 1 });
            } else if (char === '}' || char === ')' || char === ']') {
                if (stack.length === 0) {
                    console.log(`Error: Unexpected ${char} at line ${i + 1}:${j + 1}`);
                } else {
                    let last = stack.pop();
                    let expected = '';
                    if (last.char === '{') expected = '}';
                    if (last.char === '(') expected = ')';
                    if (last.char === '[') expected = ']';

                    if (char !== expected) {
                        console.log(`Error: Mismatched ${char} at line ${i + 1}:${j + 1}. Expected ${expected} to match ${last.char} from line ${last.line}:${last.col}`);
                    }
                }
            }
        } else {
            if (char === stringChar && line[j - 1] !== '\\') {
                inString = false;
            }
        }
    }
}

if (stack.length > 0) {
    let last = stack[stack.length - 1];
    console.log(`Error: Unclosed ${last.char} at line ${last.line}:${last.col}`);
} else {
    console.log("Brackets simple check passed.");
}
