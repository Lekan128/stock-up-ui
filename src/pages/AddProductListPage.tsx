import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import ProductRow from "../components/ProductRow";
import { ProductRowDetail } from "../model/types";
import logo from "../assets/logo.png";
import "./AddProductListPage.css";
import "../components/EditProductModal.css";
import { isNullOrWhitespace } from "../utils/string-utils";
import { useNotification } from "../contexts/NotificationContext";
import { useLoading } from "../contexts/LoadingContext";
import axiosInstance from "../utils/axiosInstance";
import { AxiosError } from "axios";

const AddProductListPage: React.FC = () => {
  const navigate = useNavigate();
  const { showLoading, hideLoading } = useLoading();
  const { showNotification } = useNotification();

  const emptyRow = (): ProductRowDetail => ({
    rowId: crypto.randomUUID(),
    name: "",
    costPrice: "",
    sellingPrice: "",
    numberAvailable: "",
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
    showLoading();
    removeEmptyRows((filteredRow) => {
      let errors: string[] = [];

      filteredRow.forEach((row, idx) => {
        let rowIdentifyer = "Row " + (idx + 1) + ": ";
        if (isNullOrWhitespace(row.name)) {
          errors.push(rowIdentifyer + "Name is required");
        }
        if (row.costPrice === "" || row.costPrice <= 0) {
          errors.push(rowIdentifyer + "Cost price must be > 0");
        }
        if (row.sellingPrice === "" || row.sellingPrice <= 0) {
          errors.push(rowIdentifyer + "Selling price must be > 0");
        }
        if (row.numberAvailable === "" || row.numberAvailable <= 0) {
          errors.push(rowIdentifyer + "Quantity must be non-negative");
        }
      });

      if (errors.length > 0) {
        if (errors.length > 3) errors = errors.slice(0, 3);
        hideLoading();
        showNotification(errors.join("\n"), "info");
        return;
      }

      const toSave = productRows.filter((p) => p.name.trim() !== "");
      handleSaveToDatabase(toSave);
      console.log("Saving these products:", toSave);
    });
  };

  const handleSaveToDatabase = async (productShortList: ProductRowDetail[]) => {
    try {
      await axiosInstance.post(`/products/list`, productShortList);
      hideLoading();
      navigate("/products");
    } catch (error) {
      console.error("Error submitting product:", error);
      hideLoading();
      if (error instanceof AxiosError) {
        showNotification(
          "Error: " + error.response?.data.errorMessage,
          "error"
        );
        return;
      }
      showNotification("Error: " + error, "error");
    } finally {
      hideLoading();
    }
  };

  const handleCancel = () => {
    navigate("/");
  };

  const removeEmptyRows = (
    callback?: (filtered: ProductRowDetail[]) => void
  ) => {
    setProductRows((prev) => {
      // Filter out rows that are completely empty
      const filtered = prev.filter(
        (row) =>
          !(
            isNullOrWhitespace(row.name) &&
            row.costPrice === "" &&
            row.sellingPrice === "" &&
            row.numberAvailable === ""
          )
      );

      let finalRows = filtered;

      // If everything got removed, keep one empty row
      if (filtered.length === 0) {
        finalRows = [
          {
            rowId: crypto.randomUUID(),
            name: "",
            costPrice: "",
            sellingPrice: "",
            numberAvailable: "",
          },
        ];
      }

      if (callback) callback(finalRows);
      return finalRows;
    });
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
