import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import ProductRow from "../components/ProductRow";
import { ProductRowDetail } from "../model/types";
// import ProductRow, { ProductShort } from "./ProductRow";

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
      let changedRowWasSecondToLast = false;

      const newArr = prev.map((currentRow, idx) => {
        if (currentRow.rowId === rowId) {
          // If this row was second to last in the old array
          if (idx === prev.length - 2) {
            changedRowWasSecondToLast = true;
          }
          return { ...updated, rowId };
        }
        return currentRow;
      });

      if (changedRowWasSecondToLast && updated.name.trim() !== "") {
        //When the second to the last row is updated a new row is added
        newArr.push(emptyRow());
      }

      return newArr;
    });
  };

  //   const handleChange = (index: number, updated: ProductRowDetail) => {
  //     setProducts((prev) => {
  //       const newArr = [...prev];
  //       newArr[index] = updated;

  //       // if user typed something non-empty into the second-to-last of old array
  //       if (index === prev.length - 2 && updated.name.trim() !== "") {
  //         newArr.push(emptyRow()); // add 1 new row
  //       }

  //       return newArr;
  //     });
  //   };

  const handleRemove = (rowId: string) => {
    setProductRows((prev) => {
      if (prev.length <= 1) return prev;
      return prev.filter((row) => row.rowId !== rowId);
    });
  };

  //   const handleRemove = (index: number) => {
  //     setProducts((prev) => {
  //       if (prev.length <= 1) return prev;
  //       return prev.filter((_, i) => i !== index);
  //     });
  //   };

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
      <h2>Add Products</h2>
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
