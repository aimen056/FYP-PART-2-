import React from "react";

const FloatingLabelInput = ({
  label,
  type = "text",
  name,
  value,
  onChange,
  options = [], // for select
  required = false,
  className = "",
  ...rest
}) => {
  // Render input, select, or textarea
  let field;
  const inputPadding = "px-4 py-3";
  if (type === "select") {
    field = (
      <select
        name={name}
        value={value}
        onChange={onChange}
        required={required}
        className={`w-full bg-transparent border-none outline-none focus:ring-0 text-gray-800 dark:text-gray-100 pt-6 pb-2 ${inputPadding} ${className}`}
        {...rest}
      >
        <option value="" disabled hidden></option>
        {options.map((opt) => (
          <option key={opt.value || opt} value={opt.value || opt}>
            {opt.label || opt}
          </option>
        ))}
      </select>
    );
  } else if (type === "textarea") {
    field = (
      <textarea
        name={name}
        value={value}
        onChange={onChange}
        required={required}
        className={`w-full bg-transparent border-none outline-none focus:ring-0 text-gray-800 dark:text-gray-100 pt-6 pb-2 resize-none ${inputPadding} ${className}`}
        {...rest}
      />
    );
  } else {
    field = (
      <input
        type={type}
        name={name}
        value={value}
        onChange={onChange}
        required={required}
        className={`w-full bg-transparent border-none outline-none focus:ring-0 text-gray-800 dark:text-gray-100 pt-6 pb-2 ${inputPadding} ${className}`}
        {...rest}
      />
    );
  }

  return (
    <div className="relative mb-6">
      <label
        htmlFor={name}
        className="absolute left-4 -top-3 px-2 text-teal-700 dark:text-teal-400 text-base font-semibold rounded z-20 select-none backdrop-blur-sm bg-white/60 dark:bg-gray-800/60"
        style={{ pointerEvents: "none" }}
      >
        {label}
      </label>
      <div
        className="absolute inset-0 pointer-events-none border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 transition-colors duration-300 shadow-sm"
        style={{ zIndex: 1 }}
      />
      <div className="relative z-10">
        {field}
      </div>
    </div>
  );
};

export default FloatingLabelInput; 