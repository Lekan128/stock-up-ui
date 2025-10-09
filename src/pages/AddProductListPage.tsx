import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import ProductRow from "../components/ProductRow";
import { ProductShort } from "../model/types";
// import ProductRow, { ProductShort } from "./ProductRow";

const AddProductListPage: React.FC = () => {
  const navigate = useNavigate();

  const emptyRow = (): ProductShort => ({
    name: "",
    costPrice: 0,
    sellingPrice: 0,
    numberAvailable: 0,
  });

  const [products, setProducts] = useState<ProductShort[]>([
    emptyRow(),
    emptyRow(),
    emptyRow(),
    emptyRow(),
  ]);

  const handleChange = (index: number, updated: ProductShort) => {
    setProducts((prev) => {
      const newArr = [...prev];
      newArr[index] = updated;

      // if user typed something non-empty into the second-to-last of old array
      if (index === prev.length - 2 && updated.name.trim() !== "") {
        newArr.push(emptyRow()); // add 1 new row
      }

      return newArr;
    });
  };

  const handleRemove = (index: number) => {
    setProducts((prev) => {
      if (prev.length <= 1) return prev;
      return prev.filter((_, i) => i !== index);
    });
  };

  const handleAdd = () => {
    setProducts((prev) => [...prev, emptyRow()]);
  };

  const handleSave = () => {
    const toSave = products.filter((p) => p.name.trim() !== "");
    console.log("Saving these products:", toSave);
  };

  const handleCancel = () => {
    navigate("/");
  };

  return (
    <div className="add-product-list-page">
      <h2>Add Products</h2>
      <div className="product-list-rows">
        {products.map((prod, idx) => (
          <ProductRow
            key={idx}
            product={prod}
            onChange={(updated) => handleChange(idx, updated)}
            onRemove={() => handleRemove(idx)}
          />
        ))}
      </div>

      <button type="button" className="plus-btn" onClick={handleAdd}>
        + Add Row
      </button>

      <div className="bottom-buttons">
        <button type="button" className="save-btn" onClick={handleSave}>
          Save
        </button>
        <button type="button" className="cancel-btn" onClick={handleCancel}>
          Cancel
        </button>
      </div>
    </div>
  );
};

export default AddProductListPage;
