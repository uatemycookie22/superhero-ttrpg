import { ComponentProps } from "react";

type QuantityInputProps = ComponentProps<'input'> & {
    onDecrement?: () => void;
    onIncrement?: () => void;
};

export default function QuantityInput({ value, onChange, onDecrement, onIncrement, ...rest }: QuantityInputProps) {
    const numValue = Number(value) || 0;
    
    const handleDecrement = () => {
        if (onDecrement) {
            onDecrement();
        } else if (numValue > 0) {
            onChange?.({ target: { value: String(numValue - 1) } } as any);
        }
    };
    
    const handleIncrement = () => {
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
                className="bg-gray-200 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 hover:bg-gray-300 dark:hover:bg-gray-600 rounded-l px-2 h-8"
            >
                <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 12h14" />
                </svg>
            </button>
            <input 
                className="rounded-none text-neutral-900 dark:text-white dark:bg-gray-800 w-12 text-center border-y border-gray-300 dark:border-gray-600 h-8" 
                value={value}
                onChange={onChange}
                {...rest} 
            />
            <button
                type="button"
                onClick={handleIncrement}
                className="bg-gray-200 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 hover:bg-gray-300 dark:hover:bg-gray-600 rounded-r px-2 h-8"
            >
                <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 12h14m-7 7V5" />
                </svg>
            </button>
        </div>
    );
}
