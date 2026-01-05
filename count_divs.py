import re

def count_divs(filename):
    with open(filename, 'r', encoding='utf-8') as f:
        content = f.read()
    
    # Encontrar o return statement
    return_match = re.search(r'return\s*\(', content)
    if not return_match:
        print("Return statement não encontrado")
        return
    
    # Contar divs a partir do return
    start_pos = return_match.end()
    
    opens = 0
    closes = 0
    
    # Parse simples
    i = start_pos
    while i < len(content):
        if content[i:i+4] == '<div':
            opens += 1
            i += 4
        elif content[i:i+6] == '</div>':
            closes += 1
            i += 6
        else:
            i += 1
    
    print(f"Divs abertas: {opens}")
    print(f"Divs fechadas: {closes}")
    print(f"Diferença: {opens - closes}")

if __name__ == "__main__":
    count_divs("c:/Users/LeandroMarques/Desktop/Confecção de Propostas/components/LaborCalculator.tsx")
