import React from 'react';
import './OptionPicker.css';

interface Option {
  id: string;
  label: string;
  value: string;
}

interface OptionPickerProps {
  options: Option[];
  selectedValue?: string;
  onSelect: (value: string) => void;
  disabled?: boolean;
}

export const OptionPicker: React.FC<OptionPickerProps> = ({
  options,
  selectedValue,
  onSelect,
  disabled = false,
}) => {
  return (
    <div className="option-picker">
      {options.map((option) => (
        <button
          key={option.id}
          type="button"
          className={`option-btn ${selectedValue === option.value ? 'selected' : ''}`}
          onClick={() => onSelect(option.value)}
          disabled={disabled}
        >
          {option.label}
        </button>
      ))}
    </div>
  );
};

