import React, { useState } from "react";
import TextField from "../components/TextField";
import "./ProductForm.css";
import logo from "../assets/logo.png"; // your logo file
import axiosInstance from "../utils/axiosInstance";
import { useNavigate } from "react-router-dom";
import SideContent from "../components/SideContent";
import { useLoading } from "../contexts/LoadingContext";
import { useNotification } from "../contexts/NotificationContext";
import { AxiosError } from "axios";

const ProductForm: React.FC = () => {
  const { showLoading, hideLoading } = useLoading();
  const { showNotification } = useNotification();

  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [costPrice, setCostPrice] = useState("");
  const [sellingPrice, setSellingPrice] = useState("");
  const [stock, setStock] = useState("");
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    showLoading();
    // if {isSubmitting} return;
    setIsSubmitting(true);

    try {
      // Step 1: Create the product
      const productResponse = await axiosInstance.post(`/products`, {
        name,
        description: description || null,
        costPrice: costPrice ? parseFloat(costPrice) : null,
        sellingPrice: sellingPrice ? parseFloat(sellingPrice) : null,
        numberAvailable: stock ? parseInt(stock) : null,
        categoryId: null, // Add your categoryId if needed
      });

      const productId = productResponse.data.id;

      // Step 2: Upload image if exists
      if (imageFile) {
        const formData = new FormData();
        formData.append("file", imageFile);

        const uploadResponse = await axiosInstance.post(
          `/s3/upload/${productId}`,
          formData,
          {
            headers: {
              "Content-Type": "multipart/form-data",
            },
          }
        );

        const imageUrl = uploadResponse.data;

        // Step 3: Update product with image URL
        await axiosInstance.patch(`/products/image/${productId}`, { imageUrl });
      }

      hideLoading();

      // Navigate to products page
      //   window.location.href = "/products";
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
      setIsSubmitting(false);
    }
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setImageFile(e.target.files[0]);
    }
    console.log(e.target.files);
  };

  return (
    <div className="form-page">
      <div aria-hidden={true} className="side-content">
        <SideContent />
      </div>

      <div className="form-container">
        <form className="product-form" onSubmit={handleSubmit}>
          <img src={logo} alt="Logo" className="form-logo" />
          <TextField
            label="Product Name"
            value={name}
            placeholder="e.g. Product 1"
            onChange={(e) => setName(e.target.value)}
            required
          />
          <TextField
            label="Description"
            value={description}
            placeholder="Enter Product Details"
            onChange={(e) => setDescription(e.target.value)}
          />

          {/* Image upload field */}
          {/* <div className="form-group">
            <label className="form-label">Product Image</label>
            <input
              type="file"
              accept="image/*"
              onChange={handleImageChange}
              className="form-control"
            />
          </div> */}

          <TextField
            label="Product Image"
            type="file"
            onChange={handleImageChange}
            accept="image/*"
          />

          <TextField
            label="Cost Price (₦)"
            type="number"
            placeholder="₦100.00"
            value={costPrice}
            onChange={(e) => setCostPrice(e.target.value)}
          />
          <TextField
            label="Selling Price (₦)"
            type="number"
            placeholder="₦150.00"
            value={sellingPrice}
            onChange={(e) => setSellingPrice(e.target.value)}
            required
          />
          <TextField
            label="Stock / Quantity"
            type="number"
            value={stock}
            placeholder="50"
            onChange={(e) => setStock(e.target.value)}
            required
          />
          <button type="submit" className="submit-btn">
            {isSubmitting ? "Processing..." : "Add Product"}
          </button>
        </form>
      </div>
      {/* <div className="side-image" /> */}
    </div>
  );
};

export default ProductForm;
