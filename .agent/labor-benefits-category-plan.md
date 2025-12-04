Organizar Benefícios por Categoria - Labor Calculator

## Objetivo
Reorganizar a seção de benefícios para exibir os itens agrupados por categoria (Alimentação, Saúde, Outros, Exames) com subtotais por categoria. O total de benefícios será a soma desses subtotais.

## Implementação

### 1. Lógica de Categorização
Criar uma função helper para categorizar benefícios baseado no ID:
- **Alimentação**: transport, meal, food
- **Saúde**: medical, dental, pharmacy, wellhub
- **Outros**: lifeInsurance, gpsPoint, plr
- **Exames**: exam-* (qualquer benefício que comece com "exam-")

### 2. Reorganização da UI  
Modificar a seção de benefícios (linha ~895-1053) para:
- Agrupar benefícios por categoria
- Exibir header de categoria antes de cada grupo
- Mostrar subtotal de Custo Cliente após cada grupo
- Exibir total geral como soma dos sub totais

### 3. Cálculos
- Manter a lógica de cálculo existente `calculateBenefitRow`
- Calcular subtotal por categoria somando `clientCost` de cada item
- Total = soma de todos os subtotais

### 4. Estrutura Visual
```
📦 Alimentação
  ├─ Vale Transporte (card)
  ├─ Refeição (card)
  ├─ Vale Alimentação (card)
  └─ Subtotal: R$ X,XXX.XX

🏥 Saúde  
  ├─ Plano Médico (card)
  ├─ Plano Odontológico (card)
  ├─ Auxílio Farmácia (card)
  ├─ Wellhub (card)
  └─ Subtotal: R$ X,XXX.XX

🔧 Outros
  ├─ Seguro de Vida (card)
  ├─ Controle de Ponto GPS (card)
  ├─ PLR (card)
  └─ Subtotal: R$ X,XXX.XX

🩺 Exames
  ├─ Exames Clínicos - ASO (card)
  ├─ Exames Médicos Complementares (card)
  ├─ PCMSO (card)
  └─ Subtotal: R$ X,XXX.XX

━━━━━━━━━━━━━━━━━━━━━
✨ TOTAL BENEFÍCIOS: R$ XX,XXX.XX
```

## Notas
- Customizados serão categorizados como "Outros"
- Manter funcionalidade de adicionar items
- Preservar toda a lógica de cálculo existente
