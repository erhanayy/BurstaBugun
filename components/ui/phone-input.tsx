'use client';
import React, { useState, useEffect } from 'react';

export function PhoneInput({ value, onChange, className, placeholder, name, required, ...props }: any) {
    const [internalValue, setInternalValue] = useState(value || '00 90 ');

    useEffect(() => {
        if (value !== undefined) {
            setInternalValue(value);
        }
    }, [value]);

    const formatPhone = (val: string) => {
        // Rakamlar dışındaki her şeyi temizle (artı işareti dahil)
        const digits = val.replace(/\D/g, '');

        let formatted = '';

        if (digits.length > 0) {
            let i = 0;
            while (i < digits.length) {
                if (i === 0) { formatted += digits.substring(i, i + 2); i += 2; }
                else if (i === 2) { formatted += ' ' + digits.substring(i, i + 2); i += 2; }
                else if (i === 4) { formatted += ' ' + digits.substring(i, i + 3); i += 3; }
                else if (i === 7) { formatted += ' ' + digits.substring(i, i + 3); i += 3; }
                else if (i === 10) { formatted += ' ' + digits.substring(i, i + 2); i += 2; }
                else if (i === 12) { formatted += ' ' + digits.substring(i, i + 2); i += 2; }
                else { formatted += ' ' + digits.substring(i); i = digits.length; } // Kalanı direkt yaz
            }
        }

        return formatted ? formatted : '00 90 ';
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        let inputVal = e.target.value;

        if (inputVal.startsWith('+')) {
            inputVal = '00' + inputVal.substring(1);
        }

        let formattedVal;
        if (inputVal.replace(/\D/g, '').length < 2) {
            formattedVal = '00 ';
        } else {
            formattedVal = formatPhone(inputVal);
        }

        setInternalValue(formattedVal);
        if (onChange) {
            onChange(formattedVal);
        }
    };

    return (
        <input
            type="text"
            name={name}
            required={required}
            value={internalValue}
            onChange={handleChange}
            className={className}
            placeholder={placeholder || "00 90 5XX XXX XX XX"}
            {...props}
        />
    );
}
