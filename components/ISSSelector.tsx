import React from 'react';
import { ISS_RATES } from './ISSRates';

interface ISSSelectorProps {
  value: string;
  onChange: (base: string) => void;
}

export const ISSSelector: React.FC<ISSSelectorProps> = ({ value, onChange }) => {
  return (
    <div className="mb-4">
      <label className="block text-sm font-medium text-gray-700 mb-1">Município (ISS)</label>
      <select
        className="w-full border rounded-lg px-3 py-2"
        value={value}
        onChange={e => onChange(e.target.value)}
      >
        <option value="">Selecione o município</option>
        {ISS_RATES.map((item) => (
          <option key={item.base} value={item.base}>
            {item.municipio} - {item.uf} ({item.aliquota.toFixed(2)}%)
          </option>
        ))}
      </select>
    </div>
  );
};
