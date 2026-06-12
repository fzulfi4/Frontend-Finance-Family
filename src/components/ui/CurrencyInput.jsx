/**
 * CurrencyInput - Reusable IDR-formatted input component.
 *
 * Props:
 *   value       (number)   - raw numeric value (controlled by parent)
 *   onChange    (fn)       - called with the raw numeric value (number)
 *   required    (bool)
 *   min         (number)
 *   max         (number)
 *   placeholder (string)
 *   className   (string)   - extra class names for the wrapper div
 *   disabled    (bool)
 */
import { useState, useEffect } from 'react';

const formatDisplay = (num) => {
  if (num === '' || num === null || num === undefined) return '';
  return new Intl.NumberFormat('id-ID').format(num);
};

const CurrencyInput = ({
  value,
  onChange,
  required,
  placeholder = '0',
  className = '',
  disabled = false,
  ...rest
}) => {
  const [display, setDisplay] = useState(formatDisplay(value));

  // Sync display when value changes externally (e.g. modal reopens)
  useEffect(() => {
    setDisplay(formatDisplay(value));
  }, [value]);

  const handleChange = (e) => {
    const digits = e.target.value.replace(/\D/g, '');
    if (digits === '') {
      setDisplay('');
      onChange('');
    } else {
      const num = parseInt(digits, 10);
      setDisplay(new Intl.NumberFormat('id-ID').format(num));
      onChange(num);
    }
  };

  return (
    <div className={`relative ${className}`}>
      <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 font-medium text-sm select-none pointer-events-none">
        Rp
      </span>
      <input
        type="text"
        inputMode="numeric"
        className="input-field pl-10"
        placeholder={placeholder}
        value={display}
        onChange={handleChange}
        required={required}
        disabled={disabled}
        {...rest}
      />
    </div>
  );
};

export default CurrencyInput;
