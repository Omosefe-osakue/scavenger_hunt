import React from 'react';
import './OptionPicker.css';
import type { Option } from '../types';

interface OptionPickerProps {
  options: Option[];
  selectedValue?: string;
  onSelect: (value: string) => void;
  disabled?: boolean;
  className?: string;
}

export const OptionPicker: React.FC<OptionPickerProps> = ({
  options,
  selectedValue,
  onSelect,
  disabled = false,
  className = '',
}) => {
  return (
    <div className={`option-picker ${className}`.trim()}>
      {options.map((option) => {
        const isSelected = selectedValue === option.value;
        const optionClass = [
          'option-btn',
          isSelected ? 'selected' : '',
          disabled ? 'disabled' : '',
          option.isCorrect !== undefined ? (option.isCorrect ? 'correct' : 'incorrect') : ''
        ].filter(Boolean).join(' ');

        return (
          <button
            key={option.id}
            type="button"
            className={optionClass}
            onClick={() => onSelect(option.value)}
            disabled={disabled}
            aria-pressed={isSelected}
            aria-disabled={disabled}
          >
            <span className="option-label">{option.label}</span>
            {option.isCorrect !== undefined && (
              <span className="correct-indicator" aria-hidden="true">
                {option.isCorrect ? '✓' : '✗'}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
};

