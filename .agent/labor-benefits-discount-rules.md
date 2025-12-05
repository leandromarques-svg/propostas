# Regras de Desconto de Benefícios - Calculadora de Mão de Obra

## Mudanças Implementadas

### 1. **Mudança de Nomenclatura**
- **Antes:** "Valor Unitário"
- **Depois:** "Vlr. Fornecido"

Esta mudança torna mais claro que o valor inserido é o valor que o cliente/empresa fornecerá ao colaborador.

### 2. **Cálculo de Dias para Benefícios Diários**
Para benefícios do tipo "daily" (diários), agora é exibido automaticamente quantos dias o valor fornecido representa:
- **Fórmula:** `Valor Fornecido Total / Valor Unitário = Quantidade de Dias`
- **Exemplo:** Se o valor fornecido é R$ 220,00 e o valor unitário é R$ 10,00, o sistema mostrará "22.0 dias"

---

## Regras de Desconto por Tipo de Benefício

### 🚌 **Vale Transporte (VT)**

#### Regra de Desconto:
- **Desconto Padrão:** 6% do **salário base** do colaborador
- **Limitação:** Se o desconto de 6% do salário base **EXCEDER** o valor fornecido, o colaborador **NÃO TERÁ DESCONTO**

#### Exemplos:

**Exemplo 1 - Desconto Normal:**
- Salário Base: R$ 3.000,00
- Valor Fornecido (VT/mês): R$ 200,00
- Cálculo: 6% de R$ 3.000,00 = R$ 180,00
- ✅ R$ 180,00 ≤ R$ 200,00 → Desconto aplicado: **R$ 180,00**
- Custo Cliente: R$ 200,00 - R$ 180,00 = **R$ 20,00**

**Exemplo 2 - Sem Desconto (Excede o Valor Fornecido):**
- Salário Base: R$ 5.000,00
- Valor Fornecido (VT/mês): R$ 250,00
- Cálculo: 6% de R$ 5.000,00 = R$ 300,00
- ❌ R$ 300,00 > R$ 250,00 → **SEM DESCONTO**
- Custo Cliente: R$ 250,00 - R$ 0,00 = **R$ 250,00**

#### Interface:
- Exibe um box informativo azul explicando a regra
- O percentual está fixo em 6% sobre o salário base

---

### 🍽️ **Vale Refeição (VR) e Vale Alimentação (VA)**

#### Regra de Desconto:
- **Limite Máximo:** 20% do **próprio valor fornecido** do benefício
- **Tipos de Desconto:** Pode ser por **percentual** ou **valor fixo**

#### Opção 1: Desconto por Percentual
- O usuário pode definir um percentual de desconto
- **Validação:** O percentual **não pode exceder 20%**
- Se o usuário tentar inserir mais de 20%, o sistema limita automaticamente

**Exemplo:**
- Valor Fornecido (VR/dia): R$ 30,00 × 22 dias = R$ 660,00/mês
- Desconto: 15% (válido, pois ≤ 20%)
- Desconto em Reais: 15% de R$ 660,00 = R$ 99,00
- Custo Cliente: R$ 660,00 - R$ 99,00 = **R$ 561,00**

#### Opção 2: Desconto por Valor Fixo
- O usuário pode definir um valor fixo de desconto (em R$)
- **Validação:** O valor fixo **não pode exceder 20% do valor fornecido**
- Se o usuário tentar inserir mais de 20%, o sistema limita automaticamente

**Exemplo:**
- Valor Fornecido (VA/mês): R$ 500,00
- Limite de 20%: R$ 500,00 × 0,20 = R$ 100,00
- Usuário define: R$ 80,00 (✅ válido)
- Custo Cliente: R$ 500,00 - R$ 80,00 = **R$ 420,00**

**Exemplo com Limite:**
- Valor Fornecido (VA/mês): R$ 500,00
- Limite de 20%: R$ 500,00 × 0,20 = R$ 100,00
- Usuário tenta: R$ 150,00 → Sistema limita para **R$ 100,00**
- Custo Cliente: R$ 500,00 - R$ 100,00 = **R$ 400,00**

#### Interface:
- Exibe um box informativo âmbar (amarelo) explicando a regra
- Botão para alternar entre desconto por **percentual (%)** ou **valor fixo (R$)**
- Validação automática ao digitar

---

### 💼 **Outros Benefícios**

Para os demais benefícios (Plano Médico, Odontológico, Seguro de Vida, etc.):
- **Lógica Padrão:** Desconto pode ser por percentual ou valor fixo
- **Sem Limitações Específicas:** Não há validação de 6% ou 20%
- O usuário tem liberdade para definir o desconto conforme negociação

---

## Implementação Técnica

### Função `calculateBenefitRow()`
Esta função é responsável por calcular:
- `unitValue`: Valor unitário (por dia ou mês)
- `providedValue`: Valor total fornecido
- `collabDiscount`: Desconto do colaborador
- `clientCost`: Custo final para o cliente

**Fluxo de Cálculo:**

```typescript
1. Calcular providedValue
   - Se daily: quantity × unitValue × dias
   - Se monthly: quantity × unitValue

2. Calcular collabDiscount:
   
   a) Para Vale Transporte (id === 'transport'):
      - Se discountBase === 'salary':
        - salaryDiscount = averageBaseSalary × 0.06
        - Se salaryDiscount > providedValue:
          → collabDiscount = 0 (SEM DESCONTO)
        - Senão:
          → collabDiscount = salaryDiscount
   
   b) Para VR/VA (['meal', 'food']):
      - Se discountType === 'percentage':
        - effectiveDiscount = min(discountValue, 0.20)
        - collabDiscount = providedValue × effectiveDiscount
      - Se discountType === 'fixed':
        - maxDiscountValue = providedValue × 0.20
        - collabDiscount = min(discountValue, maxDiscountValue)
   
   c) Para outros benefícios:
      - Se discountType === 'percentage':
        → collabDiscount = providedValue × discountValue
      - Se discountType === 'fixed':
        → collabDiscount = discountValue

3. Calcular clientCost:
   - clientCost = providedValue - collabDiscount
```

---

## Resumo Visual

| Benefício | Base do Desconto | Limite | Tipo |
|-----------|-----------------|--------|------|
| **Vale Transporte** | Salário Base | 6% (se exceder valor fornecido, sem desconto) | Percentual |
| **Vale Refeição** | Próprio Benefício | 20% | Percentual ou Fixo |
| **Vale Alimentação** | Próprio Benefício | 20% | Percentual ou Fixo |
| **Outros** | - | Sem limite | Percentual ou Fixo |

---

## Observações Importantes

1. **Salário Base Médio:** Para calcular o desconto de VT, o sistema usa a média dos salários base de todos os cargos cadastrados
2. **Validação em Tempo Real:** As validações são aplicadas automaticamente quando o usuário digita os valores
3. **Informações Visuais:** Cada benefício tem um box informativo colorido explicando sua regra específica
4. **Cálculo Automático:** Todas as mudanças recalculam automaticamente o custo final para o cliente
