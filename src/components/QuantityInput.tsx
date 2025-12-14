import { ComponentProps } from "react";

type QuantityInputProps = ComponentProps<'input'> & {
    onDecrement?: () => void;
    onIncrement?: () => void;
};

export default function QuantityInput({ value, onChange, onDecrement, onIncrement, disabled, ...rest }: QuantityInputProps) {
    const numValue = Number(value) || 0;
    
    const handleDecrement = () => {
        if (disabled) return;
        if (onDecrement) {
            onDecrement();
        } else if (numValue > 0) {
            onChange?.({ target: { value: String(numValue - 1) } } as any);
        }
    };
    
    const handleIncrement = () => {
        if (disabled) return;
        if (onIncrement) {
            onIncrement();
        } else if (onChange) {
            onChange({ target: { value: String(numValue + 1) } } as any);
        }
    };

    return (
        <div className="flex items-center">
            <button
                type="button"
                onClick={handleDecrement}
                disabled={disabled}
                className="bg-gray-200 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 hover:bg-gray-300 dark:hover:bg-gray-600 rounded-l px-2 h-8 disabled:opacity-50 disabled:cursor-not-allowed"
            >
                <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 12h14" />
                </svg>
            </button>
            <input 
                className="rounded-none text-neutral-900 dark:text-white dark:bg-gray-800 w-12 text-center border-y border-gray-300 dark:border-gray-600 h-8 px-0 disabled:opacity-50 disabled:cursor-not-allowed" 
                value={value}
                onChange={onChange}
                disabled={disabled}
                {...rest} 
            />
            <button
                type="button"
                onClick={handleIncrement}
                disabled={disabled}
                className="bg-gray-200 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 hover:bg-gray-300 dark:hover:bg-gray-600 rounded-r px-2 h-8 disabled:opacity-50 disabled:cursor-not-allowed"
            >
                <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 12h14m-7 7V5" />
                </svg>
            </button>
        </div>
    );
}
