import React from "react";
import "./TextField.css";

interface TextFieldProps {
  type?: "text" | "number" | "date" | "password" | "email" | "file";
  label?: string;
  value?: string | number;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onRightImageClick?: (
    e: React.MouseEvent<HTMLImageElement, MouseEvent>
  ) => void;
  placeholder?: string;
  hint?: string;
  leftImgSrc?: string;
  rightImgSrc?: string;
  required?: boolean;
  name?: string;
  accept?: string;
}

const TextField: React.FC<TextFieldProps> = ({
  type = "text",
  label,
  value, //starting value
  onChange,
  onRightImageClick,
  placeholder,
  hint,
  leftImgSrc = "",
  rightImgSrc = "",
  required = false, //for field needed before submit
  name = "", //for e.target.name
  accept = "", //for input, input's accept
}) => {
  return (
    <div className="text-field-wrapper">
      {label && <label className="text-field-label">{label}</label>}
      <div className="input-field-container">
        {leftImgSrc ? ( //conditional rendering of left img
          <img className="input-field-image" src={leftImgSrc} />
        ) : null}

        <input
          type={type}
          className="text-field-input"
          value={value}
          onChange={(e) => onChange?.(e)}
          placeholder={placeholder}
          required={required}
          name={name}
          accept={accept}
        />

        {rightImgSrc ? (
          <img
            onClick={(e) => onRightImageClick?.(e)}
            className="input-field-image"
            src={rightImgSrc}
          />
        ) : null}
      </div>

      {hint && <div className="text-field-hint">{hint}</div>}
    </div>
  );
};

export default TextField;
