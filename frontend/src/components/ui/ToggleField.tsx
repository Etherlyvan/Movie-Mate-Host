// frontend/src/components/ui/ToggleField.tsx - SIMPLE VERSION
import React from "react";

interface ToggleFieldProps {
  label: string;
  description: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
  disabled?: boolean;
  compact?: boolean;
}

export const ToggleField: React.FC<ToggleFieldProps> = ({
  label,
  description,
  checked,
  onChange,
  disabled = false,
  compact = false,
}) => {
  const handleToggle = () => {
    if (!disabled) {
      onChange(!checked);
    }
  };

  const containerClass = compact
    ? "flex items-center justify-between py-3"
    : "flex items-center justify-between p-3 bg-gray-800/30 rounded-lg border border-gray-700/50 hover:border-gray-600/50 transition-colors";

  return (
    <div className={containerClass}>
      <div className="flex-1">
        <h4 className="text-white font-medium text-sm">{label}</h4>
        <p className="text-gray-400 text-xs mt-0.5 leading-relaxed">
          {description}
        </p>
      </div>

      <div className="ml-4 flex-shrink-0">
        <button
          type="button"
          onClick={handleToggle}
          disabled={disabled}
          className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-gray-800 ${
            disabled
              ? "opacity-50 cursor-not-allowed bg-gray-600"
              : checked
              ? "bg-blue-600 hover:bg-blue-700"
              : "bg-gray-600 hover:bg-gray-500"
          }`}
        >
          <span className="sr-only">
            {checked ? "Disable" : "Enable"} {label}
          </span>
          <span
            className={`inline-block h-4 w-4 transform rounded-full bg-white shadow-lg transition-transform duration-200 ease-in-out ${
              checked ? "translate-x-6" : "translate-x-1"
            }`}
          />
        </button>
      </div>
    </div>
  );
};
