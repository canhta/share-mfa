import { InputHTMLAttributes } from "react";

interface CheckboxProps
  extends Omit<InputHTMLAttributes<HTMLInputElement>, "type" | "onChange"> {
  label: string;
  id: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
  description?: string;
  error?: string;
}

export default function Checkbox({
  label,
  id,
  checked,
  onChange,
  description,
  error,
  className = "",
  ...props
}: CheckboxProps) {
  return (
    <div className="space-y-2">
      <div className="flex items-start">
        <div className="flex items-center h-5">
          <input
            id={id}
            type="checkbox"
            checked={checked}
            onChange={(e) => onChange(e.target.checked)}
            className={`w-4 h-4 text-blue-600 bg-gray-50 border border-gray-300/60 rounded focus:ring-2 focus:ring-blue-500/20 transition-all ${className}`}
            {...props}
          />
        </div>
        <div className="ml-3 text-sm">
          <label
            htmlFor={id}
            className="font-medium text-gray-700 cursor-pointer"
          >
            {label}
          </label>
          {description && <p className="text-gray-500 mt-1">{description}</p>}
        </div>
      </div>
      {error && <p className="text-sm text-red-600">{error}</p>}
    </div>
  );
}
