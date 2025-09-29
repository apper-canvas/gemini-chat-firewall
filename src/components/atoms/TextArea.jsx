import React from "react";
import { cn } from "@/utils/cn";

const TextArea = React.forwardRef(({ 
  className, 
  placeholder,
  label,
  error,
  disabled = false,
  rows = 4,
  ...props 
}, ref) => {
  const baseClasses = "block w-full px-4 py-3 text-base bg-white border border-gray-300 rounded-lg placeholder-text-muted transition-all duration-200 focus:ring-2 focus:ring-primary-500 focus:border-primary-500 disabled:bg-gray-50 disabled:cursor-not-allowed resize-none";
  
  const errorClasses = error ? "border-accent-500 focus:ring-accent-500 focus:border-accent-500" : "";

  return (
    <div className="w-full">
      {label && (
        <label className="block text-sm font-medium text-text-primary mb-2">
          {label}
        </label>
      )}
      <textarea
        ref={ref}
        rows={rows}
        className={cn(baseClasses, errorClasses, className)}
        placeholder={placeholder}
        disabled={disabled}
        {...props}
      />
      {error && (
        <p className="mt-1 text-sm text-accent-500">{error}</p>
      )}
    </div>
  );
});

TextArea.displayName = "TextArea";

export default TextArea;