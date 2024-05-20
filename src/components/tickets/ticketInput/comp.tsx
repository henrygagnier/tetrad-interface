import React, { useState, useRef, ChangeEvent, KeyboardEvent } from 'react';
import styles from './comp.module.css';

interface TicketInputProps {
  values: string[];
  onChange: (index: number, value: string) => void;
}

export const TicketInput: React.FC<TicketInputProps> = ({ values, onChange }) => {
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  const handleChange = (e: ChangeEvent<HTMLInputElement>, index: number) => {
    const { value } = e.target;
    if (/^[0-9]$/.test(value)) {
      onChange(index, value);
      if (index < 5 && inputRefs.current[index + 1]) {
        inputRefs.current[index + 1]?.focus();
      }
    }
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>, index: number) => {
    if (e.key === 'Backspace') {
      if (values[index] === '') {
        if (index > 0 && inputRefs.current[index - 1]) {
          inputRefs.current[index - 1]?.focus();
          onChange(index - 1, '');
        }
      } else {
        onChange(index, '');
      }
    } else if (e.key === 'ArrowLeft' && index > 0) {
      inputRefs.current[index - 1]?.focus();
    } else if (e.key === 'ArrowRight' && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  return (
    <div className={styles.container}>
      {values.map((value, index) => (
        <input
          placeholder="_"
          key={index}
          type="text"
          value={value}
          onChange={(e) => handleChange(e, index)}
          onKeyDown={(e) => handleKeyDown(e, index)}
          ref={(el) => {
            inputRefs.current[index] = el;
          }}
          maxLength={1}
          className={`${styles.input} ${value === '' ? styles.placeholder : ''}`}
        />
      ))}
    </div>
  );
};
