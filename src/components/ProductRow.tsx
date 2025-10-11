import React, { useEffect, useState } from "react";
import TextField from "./TextField";
import "./ProductRow.css";
import { ProductRowDetail } from "../model/types";

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
      <div className="product-line-big">
        <TextField
          placeholder="e.g. Product 1"
          value={localProduct.name}
          onChange={(e) => updateField("name", e.target.value)}
          required
          type="text"
        />
      </div>
      <div className="product-line">
        <TextField
          type="number"
          placeholder="Cost price e.g. 2000"
          value={localProduct.costPrice.toString()}
          onChange={(e) => updateField("costPrice", Number(e.target.value))}
          required
        />
      </div>
      <div className="product-line">
        <TextField
          type="number"
          placeholder="Selling price e.g. 2000"
          value={localProduct.sellingPrice.toString()}
          onChange={(e) => updateField("sellingPrice", Number(e.target.value))}
          required
        />
      </div>
      <div className="product-line-small">
        <TextField
          type="number"
          placeholder="SKU"
          value={localProduct.numberAvailable.toString()}
          onChange={(e) =>
            updateField("numberAvailable", Number(e.target.value))
          }
          required
        />
      </div>

      <button type="button" className="close-btn" onClick={onRemove}>
        &times;
      </button>
    </div>
  );
};

export default ProductRow;
