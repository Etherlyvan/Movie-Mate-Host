// components/ui/Button.tsx
import React from "react";
import { cn } from "@/lib/utils";
import { LucideIcon } from "lucide-react";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "outline" | "ghost" | "danger";
  size?: "sm" | "md" | "lg";
  loading?: boolean;
  children: React.ReactNode;
  icon?: LucideIcon;
  iconPosition?: "left" | "right";
  iconOnly?: boolean;
  ariaLabel?: string;
}

export const Button: React.FC<ButtonProps> = ({
  variant = "primary",
  size = "md",
  loading = false,
  className,
  children,
  disabled,
  icon: Icon,
  iconPosition = "left",
  iconOnly = false,
  ariaLabel,
  ...props
}) => {
  const baseClasses =
    "inline-flex items-center justify-center font-medium rounded-lg transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-900 disabled:opacity-50 disabled:cursor-not-allowed";

  const variantClasses = {
    primary: "bg-blue-600 hover:bg-blue-700 text-white focus:ring-blue-500",
    secondary:
      "bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-900 dark:text-gray-100 focus:ring-gray-500",
    outline:
      "border border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-300 focus:ring-gray-500",
    ghost:
      "hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-300 focus:ring-gray-500",
    danger: "bg-red-600 hover:bg-red-700 text-white focus:ring-red-500",
  };

  const sizeClasses = {
    sm: iconOnly ? "p-1.5" : "px-3 py-1.5 text-sm",
    md: iconOnly ? "p-2" : "px-4 py-2 text-sm",
    lg: iconOnly ? "p-3" : "px-6 py-3 text-base",
  };

  const iconSizeClasses = {
    sm: "h-4 w-4",
    md: "h-5 w-5",
    lg: "h-6 w-6",
  };

  // Accessibility validation
  if (iconOnly && !ariaLabel && !props["aria-label"]) {
    console.warn(
      "Button: Icon-only buttons must have an ariaLabel prop or aria-label for accessibility"
    );
  }

  const LoadingSpinner = () => (
    <svg
      className={cn("animate-spin", iconSizeClasses[size], !iconOnly && "mr-2")}
      fill="none"
      viewBox="0 0 24 24"
    >
      <circle
        className="opacity-25"
        cx="12"
        cy="12"
        r="10"
        stroke="currentColor"
        strokeWidth="4"
      />
      <path
        className="opacity-75"
        fill="currentColor"
        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
      />
    </svg>
  );

  const IconComponent = Icon && (
    <Icon
      className={cn(
        iconSizeClasses[size],
        !iconOnly && !loading && (iconPosition === "left" ? "mr-2" : "ml-2")
      )}
    />
  );

  return (
    <button
      className={cn(
        baseClasses,
        variantClasses[variant],
        sizeClasses[size],
        className
      )}
      disabled={disabled || loading}
      aria-label={iconOnly ? ariaLabel : undefined}
      title={iconOnly ? ariaLabel : props.title}
      {...props}
    >
      {loading && <LoadingSpinner />}
      {!loading && Icon && iconPosition === "left" && IconComponent}
      {!iconOnly && (
        <span className={loading ? "ml-2" : undefined}>{children}</span>
      )}
      {!loading && Icon && iconPosition === "right" && IconComponent}
      {iconOnly && !loading && IconComponent}
      {iconOnly && <span className="sr-only">{ariaLabel || children}</span>}
    </button>
  );
};
