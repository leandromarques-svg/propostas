
import re

def check_balance(filename):
    with open(filename, 'r', encoding='utf-8') as f:
        content = f.read()

    # Remove comments
    content = re.sub(r'//.*', '', content)
    content = re.sub(r'/\*.*?\*/', '', content, flags=re.DOTALL)

    # Simplified state machine
    stack = []
    
    # We need to handle strings and regex literals which is hard with simple replacements
    # But let's try a simple counter first, assuming no braces in strings which is false.
    # A better way: iterate chars.
    
    in_string = False
    string_char = ''
    in_template = False
    
    # This simple script won't be perfect but might find the "unclosed { at line X"
    
    lines = content.split('\n')
    
    balance = 0
    
    for i, line in enumerate(lines):
        # Very naive: just count { and } ignoring everything else
        # This is prone to false positives (braces in strings) but good for a specific check.
        # Actually JSX often has braces in strings.
        
        # improved: strip strings
        clean_line = re.sub(r"'(.*?)'", "''", line)
        clean_line = re.sub(r'"(.*?)"', '""', clean_line)
        clean_line = re.sub(r"`(.*?)`", "``", clean_line) # Template strings can span lines, this is weak
        
        for char in clean_line:
            if char == '{':
                balance += 1
            elif char == '}':
                balance -= 1
        
        if balance < 0:
            print(f"Balance negative at line {i+1}")
            # return
            
    print(f"Final Balance: {balance}")

if __name__ == "__main__":
    check_balance("c:/Users/LeandroMarques/Desktop/Confecção de Propostas/components/LaborCalculator.tsx")
