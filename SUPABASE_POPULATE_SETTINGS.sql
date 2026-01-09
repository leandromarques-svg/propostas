-- Insert default configuration values into app_settings table
-- These values are taken from constants.ts

INSERT INTO app_settings (key, value)
VALUES
  ('labor_charges_config', '{
    "groupA": {
      "inss": 0.20,
      "sesi_sesc": 0.015,
      "senai_senac": 0.01,
      "incra": 0.002,
      "sat": 0.036,
      "salario_educacao": 0.025,
      "sebrae": 0.006,
      "fgts": 0.08
    },
    "groupB": {
      "ferias_abono": 0.1111,
      "inss_ferias": 0.0327,
      "fgts_ferias": 0.0133,
      "decimo_terceiro": 0.0833,
      "inss_decimo_terceiro": 0.0245,
      "fgts_decimo_terceiro": 0.01,
      "aviso_previo": 0.1178,
      "deposito_rescisao": 0.032,
      "auxilio_doenca": 0.035
    }
  }'::jsonb),

  ('labor_tax_rates_config', '{
    "iss": 0.02,
    "pis": 0.0165,
    "cofins": 0.076,
    "irrf": 0.01,
    "csll": 0.01
  }'::jsonb),

  ('benefit_options_medical', '[
    { "id": "med-sul-esp", "name": "SULAMÉRICA ESPECIAL", "value": 1117.49 },
    { "id": "med-sul-esp100", "name": "SULAMÉRICA ESPECIAL 100", "value": 1445.99 },
    { "id": "med-sul-exec", "name": "SULAMÉRICA EXECUTIVO", "value": 3426.20 },
    { "id": "med-sul-exato", "name": "SULAMÉRICA - EXATO", "value": 980.92 },
    { "id": "med-sul-class", "name": "SULAMÉRICA CLÁSSICO", "value": 1055.95 },
    { "id": "med-brad-enf", "name": "BRADESCO EFETIVO ENFERMARIA", "value": 612.30 },
    { "id": "med-brad-apt", "name": "BRADESCO EFETIVO APARTAMENTO", "value": 690.27 },
    { "id": "med-brad-flex", "name": "BRADESCO NACIONAL FLEX APARTAMENTO", "value": 814.65 },
    { "id": "med-brad-nac2", "name": "BRADESCO NACIONAL 2 APARTAMENTO", "value": 975.28 },
    { "id": "med-none", "name": "Sem Plano Médico", "value": 0 }
  ]'::jsonb),

  ('benefit_options_dental', '[
    { "id": "den-sul-sind", "name": "PLANO ODONTO SULAMÉRICA + SINDICATO", "value": 44.25 },
    { "id": "den-none", "name": "Sem Plano Odontológico", "value": 0 }
  ]'::jsonb),

  ('benefit_options_wellhub', '[
    { "id": "gym-starter", "name": "STARTER", "value": 29.90 },
    { "id": "gym-basic", "name": "BASIC", "value": 49.90 },
    { "id": "gym-silver", "name": "SILVER", "value": 119.90 },
    { "id": "gym-silver-plus", "name": "SILVER+", "value": 184.90 },
    { "id": "gym-gold", "name": "GOLD", "value": 249.90 },
    { "id": "gym-gold-plus", "name": "GOLD+", "value": 379.90 },
    { "id": "gym-platinum", "name": "PLATINUM", "value": 499.90 },
    { "id": "gym-diamond", "name": "DIAMOND", "value": 629.90 },
    { "id": "gym-diamond-plus", "name": "DIAMOND+", "value": 679.90 },
    { "id": "gym-none", "name": "Sem Plano", "value": 0 }
  ]'::jsonb),

  ('exam_options_list', '[
    { "id": "exam-aso", "name": "Exames Clínicos - ASO", "value": 62.25 },
    { "id": "exam-comp", "name": "Exames Médicos Complementares", "value": 0.00 },
    { "id": "exam-pcmso", "name": "PCMSO", "value": 2.30 }
  ]'::jsonb),

  ('general_tax_rates', '{
    "pis": 0.0165,
    "cofins": 0.076,
    "irrf": 0.015,
    "csll": 0.01,
    "retentionIR": 0.015,
    "issOptions": [
        { "city": "São Paulo - SP", "rate": 0.05 },
        { "city": "Barueri - SP", "rate": 0.02 },
        { "city": "Osasco - SP", "rate": 0.05 },
        { "city": "Guarulhos - SP", "rate": 0.05 },
        { "city": "Campinas - SP", "rate": 0.05 },
        { "city": "Santo André - SP", "rate": 0.05 },
        { "city": "São Bernardo do Campo - SP", "rate": 0.05 },
        { "city": "São Caetano do Sul - SP", "rate": 0.05 },
        { "city": "Diadema - SP", "rate": 0.03 },
        { "city": "Mauá - SP", "rate": 0.05 },
        { "city": "Ribeirão Preto - SP", "rate": 0.05 },
        { "city": "Sorocaba - SP", "rate": 0.05 },
        { "city": "Santos - SP", "rate": 0.05 },
        { "city": "Rio de Janeiro - RJ", "rate": 0.05 },
        { "city": "Niterói - RJ", "rate": 0.05 },
        { "city": "Belo Horizonte - MG", "rate": 0.03 },
        { "city": "Curitiba - PR", "rate": 0.05 },
        { "city": "Porto Alegre - RS", "rate": 0.05 },
        { "city": "Brasília - DF", "rate": 0.05 },
        { "city": "Salvador - BA", "rate": 0.05 },
        { "city": "Fortaleza - CE", "rate": 0.05 },
        { "city": "Recife - PE", "rate": 0.05 },
        { "city": "Manaus - AM", "rate": 0.05 },
        { "city": "Belém - PA", "rate": 0.05 },
        { "city": "Goiânia - GO", "rate": 0.05 },
        { "city": "Cuiabá - MT", "rate": 0.05 },
        { "city": "Outra Localidade (5%)", "rate": 0.05 }
    ]
  }'::jsonb)

ON CONFLICT (key) DO NOTHING;
