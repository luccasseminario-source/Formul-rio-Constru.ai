import React, { InputHTMLAttributes } from 'react';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
    label: string;
    error?: string;
}

const Input: React.FC<InputProps> = ({ label, name, error, required, className, ...props }) => {
    const errorClasses = error ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : 'border-zinc-600 focus:border-orange-400 focus:ring-orange-400';
    return (
        <div className={`flex flex-col space-y-2 ${className}`}>
            <label htmlFor={name} className="text-sm font-medium text-white">
                {label} {required && <span className="text-red-400">*</span>}
            </label>
            <input
                id={name}
                name={name}
                className={`w-full bg-zinc-900/50 text-white px-4 py-2.5 rounded-lg border-2 transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-opacity-50 placeholder:text-zinc-500 ${errorClasses}`}
                {...props}
            />
            {error && <p className="text-red-400 text-xs mt-1">{error}</p>}
        </div>
    );
};

export default Input;