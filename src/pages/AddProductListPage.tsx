import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import ProductRow from "../components/ProductRow";
import { ProductRowDetail } from "../model/types";
import logo from "../assets/logo.png";
import "./AddProductListPage.css";
import "../components/EditProductModal.css";

const AddProductListPage: React.FC = () => {
  const navigate = useNavigate();

  const emptyRow = (): ProductRowDetail => ({
    rowId: crypto.randomUUID(),
    name: "",
    costPrice: 0,
    sellingPrice: 0,
    numberAvailable: 0,
  });

  const [productRows, setProductRows] = useState<ProductRowDetail[]>([
    emptyRow(),
    emptyRow(),
    emptyRow(),
    emptyRow(),
  ]);

  const handleChange = (rowId: string, updated: ProductRowDetail) => {
    setProductRows((prev) => {
      let lastRowChanged = false;

      const newArr = prev.map((currentRow, idx) => {
        if (currentRow.rowId === rowId) {
          // If this row was last in the old array
          if (idx === prev.length - 1) {
            lastRowChanged = true;
          }
          return { ...updated, rowId };
        }
        return currentRow;
      });

      if (lastRowChanged && updated.name.trim() !== "") {
        //When the second to the last row is updated a new row is added
        newArr.push(emptyRow());
      }

      return newArr;
    });
  };

  const handleRemove = (rowId: string) => {
    setProductRows((prev) => {
      if (prev.length <= 1) return prev;
      return prev.filter((row) => row.rowId !== rowId);
    });
  };

  const handleAdd = () => {
    setProductRows((prev) => [...prev, emptyRow()]);
  };

  const handleSave = () => {
    const toSave = productRows.filter((p) => p.name.trim() !== "");
    console.log("Saving these products:", toSave);
  };

  const handleCancel = () => {
    navigate("/");
  };

  return (
    <div className="add-product-list-page">
      <img src={logo} alt="Logo" className="center-logo" />

      <header className="header-container">
        <div className="row">
          <p className="element-charachter product-line-big">Product Name</p>
          <p className="product-name element-charachter product-line">
            Cost Price
          </p>
          <p className="product-name element-charachter product-line">
            Selling Price
          </p>
          <p className="element-charachter product-line-small">SKU</p>
          <p className="element-charachter-2"> ↓ </p>
        </div>
      </header>

      {/* <h2>Add Products</h2> */}
      <div className="product-list-rows">
        {productRows.map((prodRow) => (
          <ProductRow
            key={prodRow.rowId}
            product={prodRow}
            onChange={(updated) => handleChange(prodRow.rowId, updated)}
            onRemove={() => handleRemove(prodRow.rowId)}
          />
        ))}
      </div>

      <button type="button" className="button plus-btn" onClick={handleAdd}>
        + Add Row
      </button>

      <div className="bottom-buttons modal-actions">
        <button
          type="button"
          className="button save-button"
          onClick={handleSave}
        >
          Save
        </button>
        <button
          type="button"
          className="button cancel-button"
          onClick={handleCancel}
        >
          Cancel
        </button>
      </div>
    </div>
  );
};

export default AddProductListPage;
