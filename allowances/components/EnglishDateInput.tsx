import React, { useRef } from 'react';
import { formatDateGB } from '../utils';

interface Props extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'type'> {
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

export default function EnglishDateInput({ className, value, onChange, onClick, ...props }: Props) {
  const inputRef = useRef<HTMLInputElement>(null);

  const handleClick = (e: React.MouseEvent<HTMLInputElement>) => {
    try {
      inputRef.current?.showPicker?.();
    } catch (err) {}
    if (onClick) onClick(e);
  };

  return (
    <div className={`relative inline-block ${className || ''}`} style={{ minWidth: '120px' }}>
      <div className="absolute inset-0 flex items-center justify-center font-mono pointer-events-none" style={{ direction: 'ltr' }}>
        {formatDateGB(value)}
      </div>
      <input
        {...props}
        ref={inputRef}
        type="date"
        value={value}
        onChange={onChange}
        onClick={handleClick}
        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
        lang="en-GB"
      />
    </div>
  );
}
