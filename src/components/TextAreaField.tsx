import React from "react";
import "./TextField.css";

interface TextFieldAreaProps {
  rows?: number;
  label?: string;
  value?: string | number;
  onChange?: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
  onRightImageClick?: (
    e: React.MouseEvent<HTMLImageElement, MouseEvent>
  ) => void;
  placeholder?: string;
  hint?: string;
  leftImgSrc?: string;
  rightImgSrc?: string;
  required?: boolean;
  name?: string;
}

const TextFieldArea: React.FC<TextFieldAreaProps> = ({
  rows = 1,
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
}) => {
  return (
    <div className="text-field-wrapper">
      {label && <label className="text-field-label">{label}</label>}
      <div className="input-field-container">
        {leftImgSrc ? ( //conditional rendering of left img
          <img className="input-field-image" src={leftImgSrc} />
        ) : null}

        <textarea
          rows={rows}
          className="textarea-input"
          value={value}
          onChange={(e) => onChange?.(e)}
          placeholder={placeholder}
          required={required}
          name={name}
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

export default TextFieldArea;
