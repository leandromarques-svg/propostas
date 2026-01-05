
import re

# Ler arquivo
with open('components/LaborCalculator.tsx', 'r', encoding='utf-8') as f:
    content = f.read()

# Corrigir linha 2453: remover espaço entre */ e }
content = content.replace('{/* End of Page Container */ }', '{/* End of Page Container */}')

# Corrigir espaços em </div >
content = content.replace('</div >', '</div>')

# Salvar
with open('components/LaborCalculator.tsx', 'w', encoding='utf-8') as f:
    f.write(content)

print("Arquivo corrigido!")
