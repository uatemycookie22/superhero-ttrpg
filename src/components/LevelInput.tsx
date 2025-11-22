import { ComponentProps } from "react";
import QuantityInput from "./QuantityInput";

type LevelInputProps = ComponentProps<'input'>;

export default function LevelInput({ value, onChange, ...rest }: LevelInputProps) {
    return (
        <div className="flex flex-row flex-wrap gap-2 items-center justify-between">
            <label htmlFor="level" className="font-semibold w-fit">Level</label>
            <QuantityInput 
                value={value}
                onChange={onChange}
                {...rest}
            />
        </div>
    );
}
