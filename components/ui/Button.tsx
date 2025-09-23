import React, { ButtonHTMLAttributes } from 'react';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
    fullWidth?: boolean;
}

const Button: React.FC<ButtonProps> = ({ children, fullWidth, disabled, ...props }) => {
    const widthClass = fullWidth ? 'w-full' : '';
    return (
        <button
            className={`flex items-center justify-center gap-2 px-8 py-3 bg-orange-600 text-white font-bold text-lg rounded-lg shadow-lg shadow-orange-800/50 hover:bg-orange-700 focus:outline-none focus:ring-4 focus:ring-orange-500 focus:ring-opacity-50 transition-all duration-300 transform hover:scale-105 disabled:bg-zinc-700 disabled:cursor-not-allowed disabled:transform-none disabled:shadow-none ${widthClass}`}
            disabled={disabled}
            {...props}
        >
            {children}
        </button>
    );
};

export default Button;