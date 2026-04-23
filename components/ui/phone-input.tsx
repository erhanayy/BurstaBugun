'use client';
import React from 'react';

export function PhoneInput({ value, onChange, className, placeholder }: any) {
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

        if (inputVal.replace(/\D/g, '').length < 2) {
            onChange('00 ');
            return;
        }

        onChange(formatPhone(inputVal));
    };

    return (
        <input
            type="text"
            value={value || '00 90 '}
            onChange={handleChange}
            className={className}
            placeholder={placeholder || "00 90 5XX XXX XX XX"}
        />
    );
}
