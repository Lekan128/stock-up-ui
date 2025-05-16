import React, { useState } from "react";
import { Product } from "../model/types";
import "./EditProductModal.css";
import TextField from "./TextField";
import addImagePlaceHolder from "../assets/placeholders/add_image_placeholder.png";

interface EditProductModalProps {
  product: Product;
  onClose: () => void;
  onSave: (updatedProduct: Product, newImageFile?: File) => Promise<void>;
}

const EditProductModal = ({
  product,
  onClose,
  onSave,
}: EditProductModalProps) => {
  const [editedProduct, setEditedProduct] = useState<Product>({ ...product });
  const [newImageFile, setNewImageFile] = useState<File | null>(null);
  const [previewImage, setPreviewImage] = useState<string>(
    product.imageUrl || ""
  );

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.[0]) {
      const file = e.target.files[0];
      setNewImageFile(file);
      setPreviewImage(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async () => {
    try {
      await onSave(editedProduct, newImageFile || undefined);
      onClose();
    } catch (error) {
      // Handle error (you can add error state here)
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <div className="image-upload-section">
          <input
            type="file"
            accept="image/*"
            onChange={handleImageChange}
            id="image-upload"
            hidden
          />
          <label htmlFor="image-upload">
            <img
              src={previewImage || addImagePlaceHolder}
              alt="Product preview"
              className="clickable-image"
            />
          </label>
        </div>

        <TextField
          label="Product Name"
          value={editedProduct.name}
          placeholder="e.g. Product 1"
          onChange={(e) =>
            setEditedProduct({ ...editedProduct, name: e.target.value })
          }
          required
        />
        <TextField
          label="Description"
          value={editedProduct.description}
          placeholder="Enter Product Details"
          onChange={(e) =>
            setEditedProduct({ ...editedProduct, description: e.target.value })
          }
        />

        <TextField
          label="Cost Price (₦)"
          type="number"
          placeholder="₦100.00"
          value={editedProduct.costPrice}
          onChange={(e) =>
            setEditedProduct({
              ...editedProduct,
              costPrice: Number(e.target.value),
            })
          }
        />
        <TextField
          label="Selling Price (₦)"
          type="number"
          placeholder="₦150.00"
          value={editedProduct.sellingPrice}
          onChange={(e) =>
            setEditedProduct({
              ...editedProduct,
              sellingPrice: Number(e.target.value),
            })
          }
          required
        />
        <TextField
          label="Stock / Quantity"
          type="number"
          value={editedProduct.numberAvailable}
          placeholder="50"
          onChange={(e) =>
            setEditedProduct({
              ...editedProduct,
              numberAvailable: Number(e.target.value),
            })
          }
        />

        <div className="modal-actions">
          <button className="button cancel-button" onClick={onClose}>
            Cancel
          </button>
          <button className="button save-button" onClick={handleSubmit}>
            Save
          </button>
        </div>
      </div>
    </div>
  );
};

export default EditProductModal;
