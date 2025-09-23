
import React, { SelectHTMLAttributes } from 'react';

interface SelectOption {
    value: string;
    label: string;
}

interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
    label: string;
    error?: string;
    options: SelectOption[];
}

const Select: React.FC<SelectProps> = ({ label, name, error, required, options, className, ...props }) => {
    const errorClasses = error ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : 'border-zinc-600 focus:border-orange-400 focus:ring-orange-400';
    return (
        <div className={`flex flex-col space-y-2 ${className}`}>
            <label htmlFor={name} className="text-sm font-medium text-white">
                {label} {required && <span className="text-red-400">*</span>}
            </label>
            <div className="relative">
                <select
                    id={name}
                    name={name}
                    className={`w-full bg-zinc-900/50 text-white px-4 py-2.5 rounded-lg border-2 appearance-none transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-opacity-50 placeholder:text-zinc-500 ${errorClasses}`}
                    {...props}
                >
                    <option value="" disabled>Selecione uma opção</option>
                    {options.map(option => (
                        <option key={option.value} value={option.value}>{option.label}</option>
                    ))}
                </select>
                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-zinc-400">
                    <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
                        <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z" />
                    </svg>
                </div>
            </div>
            {error && <p className="text-red-400 text-xs mt-1">{error}</p>}
        </div>
    );
};

export default Select;