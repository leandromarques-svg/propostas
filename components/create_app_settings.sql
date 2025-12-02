-- Create app_settings table
CREATE TABLE IF NOT EXISTS app_settings (
  key TEXT PRIMARY KEY,
  value JSONB NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_by TEXT
);

-- Insert default values if they don't exist
INSERT INTO app_settings (key, value)
VALUES 
  ('minimum_wage', '1804.00'::jsonb),
  ('sat_rate', '0.03'::jsonb),
  ('benefit_options', '{
    "medical": [
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
    ],
    "dental": [
        { "id": "den-sul-sind", "name": "PLANO ODONTO SULAMÉRICA + SINDICATO", "value": 44.25 },
        { "id": "den-none", "name": "Sem Plano Odontológico", "value": 0 }
    ],
    "wellhub": [
        { "id": "gym-starter", "name": "GYMPASS STARTER", "value": 29.90 },
        { "id": "gym-basic", "name": "GYMPASS BASIC", "value": 49.90 },
        { "id": "gym-silver", "name": "GYMPASS SILVER", "value": 119.90 },
        { "id": "gym-silver-plus", "name": "GYMPASS SILVER+", "value": 184.90 },
        { "id": "gym-gold", "name": "GYMPASS GOLD", "value": 249.90 },
        { "id": "gym-gold-plus", "name": "GYMPASS GOLD+", "value": 379.90 },
        { "id": "gym-platinum", "name": "GYMPASS PLATINUM", "value": 499.90 },
        { "id": "gym-diamond", "name": "GYMPASS DIAMOND", "value": 629.90 },
        { "id": "gym-diamond-plus", "name": "GYMPASS DIAMOND+", "value": 679.90 },
        { "id": "gym-none", "name": "Sem Wellhub", "value": 0 }
    ]
  }'::jsonb)
ON CONFLICT (key) DO NOTHING;

-- Enable RLS
ALTER TABLE app_settings ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Allow read access to all authenticated users"
ON app_settings FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "Allow update access to authenticated users"
ON app_settings FOR UPDATE
TO authenticated
USING (true);

CREATE POLICY "Allow insert access to authenticated users"
ON app_settings FOR INSERT
TO authenticated
WITH CHECK (true);
