
import re

def verify(filename):
    with open(filename, 'r', encoding='utf-8') as f:
        content = f.read()

    stack = []
    
    # Simple tokenizer
    i = 0
    length = len(content)
    line_num = 1
    
    while i < length:
        char = content[i]
        
        if char == '\n':
            line_num += 1
            i += 1
            continue
            
        # Skip Comments
        if char == '/' and i + 1 < length:
            if content[i+1] == '/':
                # Line comment
                i += 2
                while i < length and content[i] != '\n':
                    i += 1
                continue
            elif content[i+1] == '*':
                # Block comment
                i += 2
                while i < length - 1 and not (content[i] == '*' and content[i+1] == '/'):
                    if content[i] == '\n': line_num += 1
                    i += 1
                i += 2
                continue
        
        # Skip Strings
        if char in ["'", '"', '`']:
            quote = char
            start_line = line_num
            i += 1
            while i < length:
                if content[i] == '\\':
                    i += 2
                    continue
                if content[i] == quote:
                    i += 1
                    break
                if content[i] == '\n':
                    line_num += 1
                i += 1
            continue

        # Check Braces
        if char == '{':
            stack.append(('{', line_num))
        elif char == '}':
            if not stack or stack[-1][0] != '{':
                print(f"Error: Unexpected }} at line {line_num}")
                return
            stack.pop()
        
        if char == '(':
            stack.append(('(', line_num))
        elif char == ')':
            if not stack or stack[-1][0] != '(':
                print(f"Error: Unexpected ) at line {line_num}")
                return
            stack.pop()

        if char == '[':
            stack.append(('[', line_num))
        elif char == ']':
            if not stack or stack[-1][0] != '[':
                print(f"Error: Unexpected ] at line {line_num}")
                return
            stack.pop()
            
        i += 1
        
    if stack:
        print(f"Error: Unclosed {stack[-1][0]} from line {stack[-1][1]}")
    else:
        print("Syntax OK (Braces balanced)")

if __name__ == "__main__":
    verify("c:/Users/LeandroMarques/Desktop/Confecção de Propostas/components/LaborCalculator.tsx")
