import React, { useEffect, useState } from "react";
import TextField from "./TextField";
import "./ProductRow.css";
import { ProductRowDetail } from "../model/types";
import TextFieldArea from "./TextAreaField";

interface ProductRowProps {
  product: ProductRowDetail;
  onChange: (product: ProductRowDetail) => void;
  onRemove: () => void;
}

const ProductRow: React.FC<ProductRowProps> = ({
  product,
  onChange,
  onRemove,
}) => {
  const [localProduct, setLocalProduct] = useState<ProductRowDetail>(product);

  // Whenever localProduct changes, notify parent
  useEffect(() => {
    onChange(localProduct);
  }, [localProduct]);

  const updateField = <K extends keyof ProductRowDetail>(
    field: K,
    value: ProductRowDetail[K]
  ) => {
    setLocalProduct((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  return (
    <div className="product-line-container">
      <div className="product-line-big element">
        <TextFieldArea
          placeholder="e.g. Product 1"
          value={localProduct.name}
          onChange={(e) => updateField("name", e.target.value)}
          required
          rows={2}
        />
      </div>
      <div className="product-line element">
        <TextField
          type="number-with-comma"
          placeholder="Cost price e.g. 2000"
          value={localProduct.costPrice.toString()}
          onChange={(e) =>
            updateField("costPrice", Number(e.target.value.replace(/,/g, "")))
          }
          required
          fontSize="0.85rem"
        />
      </div>
      <div className="product-line element">
        <TextField
          type="number-with-comma"
          placeholder="Selling price e.g. 2000"
          value={localProduct.sellingPrice.toString()}
          onChange={(e) =>
            updateField(
              "sellingPrice",
              Number(e.target.value.replace(/,/g, ""))
            )
          }
          required
          fontSize="0.85rem"
        />
      </div>
      <div className="product-line-small element">
        <TextField
          type="number-with-comma"
          placeholder="SKU"
          value={localProduct.numberAvailable.toString()}
          onChange={(e) =>
            updateField(
              "numberAvailable",
              Number(e.target.value.replace(/,/g, ""))
            )
          }
          required
          fontSize="0.85rem"
        />
      </div>

      <button type="button" className="close-btn element" onClick={onRemove}>
        &times;
      </button>
    </div>
  );
};

export default ProductRow;
