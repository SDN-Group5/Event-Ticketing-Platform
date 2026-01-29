import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: 'primary' | 'secondary' | 'outline' | 'ghost';
    size?: 'sm' | 'md' | 'lg';
    children: React.ReactNode;
    leftIcon?: React.ReactNode;
    rightIcon?: React.ReactNode;
    isLoading?: boolean;
    fullWidth?: boolean;
}

export const Button: React.FC<ButtonProps> = ({
    variant = 'primary',
    size = 'md',
    children,
    leftIcon,
    rightIcon,
    isLoading,
    fullWidth,
    className = '',
    disabled,
    ...props
}) => {
    const baseClasses = 'inline-flex items-center justify-center gap-2 font-bold rounded-xl transition-all transform';

    const variantClasses = {
        primary: 'bg-gradient-to-r from-[#8655f6] to-[#a87ffb] text-white shadow-[0_4px_14px_0_rgba(137,90,246,0.39)] hover:shadow-[0_0_40px_rgba(137,90,246,0.6)] hover:-translate-y-0.5',
        secondary: 'bg-white/10 border border-white/10 text-white hover:bg-white/20',
        outline: 'bg-transparent border border-[#8655f6] text-[#8655f6] hover:bg-[#8655f6] hover:text-white',
        ghost: 'bg-transparent text-slate-400 hover:bg-white/5 hover:text-white',
    };

    const sizeClasses = {
        sm: 'h-9 px-4 text-xs',
        md: 'h-11 px-6 text-sm',
        lg: 'h-14 px-8 text-base',
    };

    const widthClass = fullWidth ? 'w-full' : '';
    const disabledClass = disabled || isLoading ? 'opacity-50 cursor-not-allowed' : '';

    return (
        <button
            className={`${baseClasses} ${variantClasses[variant]} ${sizeClasses[size]} ${widthClass} ${disabledClass} ${className}`}
            disabled={disabled || isLoading}
            {...props}
        >
            {isLoading ? (
                <span className="material-symbols-outlined animate-spin text-lg">progress_activity</span>
            ) : (
                <>
                    {leftIcon}
                    {children}
                    {rightIcon}
                </>
            )}
        </button>
    );
};
