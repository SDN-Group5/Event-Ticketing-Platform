import React from 'react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
    label?: string;
    error?: string;
    leftIcon?: string;
    rightIcon?: string;
    variant?: 'default' | 'filled';
}

export const Input: React.FC<InputProps> = ({
    label,
    error,
    leftIcon,
    rightIcon,
    variant = 'default',
    className = '',
    ...props
}) => {
    const baseInputClasses = 'w-full border rounded-xl py-3 text-white placeholder:text-slate-500 transition-all focus:ring-2 focus:ring-[#8655f6] focus:border-transparent';

    const variantClasses = {
        default: 'bg-white/5 border-white/10',
        filled: 'bg-[#131118] border-[#2d2839]',
    };

    const paddingClasses = leftIcon
        ? 'pl-12 pr-4'
        : rightIcon
            ? 'pl-4 pr-12'
            : 'px-4';

    const errorClasses = error ? 'border-red-500 focus:ring-red-500' : '';

    return (
        <div className="space-y-2">
            {label && (
                <label className="text-sm font-medium text-slate-300">{label}</label>
            )}
            <div className="relative">
                {leftIcon && (
                    <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-slate-500">
                        {leftIcon}
                    </span>
                )}
                <input
                    className={`${baseInputClasses} ${variantClasses[variant]} ${paddingClasses} ${errorClasses} ${className}`}
                    {...props}
                />
                {rightIcon && (
                    <span className="material-symbols-outlined absolute right-4 top-1/2 -translate-y-1/2 text-slate-500">
                        {rightIcon}
                    </span>
                )}
            </div>
            {error && (
                <p className="text-xs text-red-500">{error}</p>
            )}
        </div>
    );
};

// Search Input variant
interface SearchInputProps {
    placeholder?: string;
    value?: string;
    onChange?: (value: string) => void;
    className?: string;
}

export const SearchInput: React.FC<SearchInputProps> = ({
    placeholder = 'Search...',
    value,
    onChange,
    className = '',
}) => {
    return (
        <label className={`flex w-full items-center h-11 rounded-xl bg-[#2d2839]/50 border border-white/5 focus-within:border-[#8655f6]/50 focus-within:ring-1 focus-within:ring-[#8655f6]/50 transition-all overflow-hidden ${className}`}>
            <div className="flex items-center justify-center pl-4 text-[#a59cba]">
                <span className="material-symbols-outlined">search</span>
            </div>
            <input
                className="w-full bg-transparent border-none text-white placeholder:text-[#a59cba] focus:ring-0 px-3 text-sm font-normal"
                placeholder={placeholder}
                value={value}
                onChange={(e) => onChange?.(e.target.value)}
            />
        </label>
    );
};
