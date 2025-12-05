import React, { useRef } from "react";
import "./TextField.css";

interface TextFieldProps {
  type?:
    | "text"
    | "number"
    | "date"
    | "password"
    | "email"
    | "file"
    | "number-with-comma";
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
  fontSize?: string;
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
  fontSize = "1rem",
}) => {
  const inputRef = useRef<HTMLInputElement>(null);

  // Format number with commas: 1000 -> "1,000"
  const formatNumberWithCommas = (num: string | number): string => {
    if (num === "" || num === undefined || num === null) return "";
    const numStr = String(num); // remove existing commas
    return numStr.replace(/\B(?=(\d{3})+(?!\d))/g, ","); // put commas in the appropriate places
  };

  // Handle number-with-comma input: only allow numbers, format with commas
  const handleCommaFormattedNumberChange = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const inputValue = e.target.value.replace(/,/g, ""); // remove commas

    // Only allow digits
    if (inputValue === "" || /^\d+$/.test(inputValue)) {
      const cursorPos = e.target.selectionStart ?? 0;
      const oldValue = e.target.value;
      const formattedValue = formatNumberWithCommas(inputValue);

      // Count commas before cursor in old and new value
      const beforeCursor = oldValue.substring(0, cursorPos);
      const commasBeforeCursor = (beforeCursor.match(/,/g) || []).length;

      // Find the position in the formatted string
      let newCursorPos = cursorPos;
      let digitCount = 0;
      for (let i = 0; i < formattedValue.length; i++) {
        if (formattedValue[i] !== ",") {
          digitCount++;
        }
        // cursorPos - commasBeforeCursor is the no of digits behind the cursor
        // When the no of digits behind the cursor is the same as the digit we have gotten to
        //  Increse the cursorPosition to move the cursor the the front of the current digit and break
        if (digitCount === cursorPos - commasBeforeCursor) {
          newCursorPos = i + 1;
          break;
        }
      }

      e.target.value = formattedValue;
      onChange?.(e);

      // Restore cursor position after state updates
      setTimeout(() => {
        //The setTimeout ensures the browser/React have updated the input's value in the DOM and then we set the caret at the correct position.
        if (inputRef.current) {
          inputRef.current.setSelectionRange(newCursorPos, newCursorPos);
        }
      }, 0);
    }
  };

  const inputStyle = {
    fontSize: `${fontSize}`, // React inline styles use camelCase properties
  };

  // For number-with-comma type, show formatted value
  const displayValue =
    type === "number-with-comma" ? formatNumberWithCommas(value || "") : value;

  return (
    <div className="text-field-wrapper">
      {label && <label className="text-field-label">{label}</label>}
      <div className="input-field-container">
        {leftImgSrc ? ( //conditional rendering of left img
          <img className="input-field-image" src={leftImgSrc} />
        ) : null}

        <input
          ref={inputRef}
          type={type === "number-with-comma" ? "text" : type}
          inputMode={type === "number-with-comma" ? "numeric" : undefined}
          className="text-field-input"
          value={displayValue}
          onChange={
            type === "number-with-comma"
              ? handleCommaFormattedNumberChange
              : onChange
          }
          placeholder={placeholder}
          required={required}
          name={name}
          accept={accept}
          style={inputStyle}
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
