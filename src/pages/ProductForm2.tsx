import React, { useState } from "react";
import TextField from "../components/TextField";
import { Product } from "../model/types";
import "./ProductForm2.css";

const ProductForm = () => {
  const [categoryId, setCategoryId] = useState<string>("");
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [costPrice, setCostPrice] = useState<number | "">("");
  const [sellingPrice, setSellingPrice] = useState<number | "">("");
  const [numberAvailable, setNumberAvailable] = useState<number | "">("");

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>): void => {
    e.preventDefault();
    console.log(
      categoryId,
      name,
      description,
      costPrice,
      sellingPrice,
      numberAvailable
    );
  };

  function clearForm() {
    setCategoryId("");
    setName("");
    setDescription("");
    setCostPrice("");
    setSellingPrice("");
    setNumberAvailable("");
  }

  return (
    <div>
      <main>
        <div className="main-container">
          <form onSubmit={handleSubmit}>
            <TextField
              type="text"
              label="Product Name"
              placeholder="Enter name"
              onChange={(e) => setName(e.target.value)}
            />
            <TextField
              type="text"
              label="Description"
              placeholder="Enter Product Description"
              onChange={(e) => setDescription(e.target.value)}
            />
            <TextField
              type="number"
              label="Cost Price (₦)"
              placeholder="1000"
              onChange={(e) => setCostPrice(Number(e.target.value))}
            />
            <TextField
              type="number"
              label="Selling Price (₦)"
              placeholder="1500"
              onChange={(e) => setSellingPrice(Number(e.target.value))}
            />
            <TextField
              type="number"
              label="Quantity/Stock"
              placeholder="12"
              onChange={(e) => setNumberAvailable(Number(e.target.value))}
            />

            <button className="btn">Add Product</button>
          </form>
        </div>
      </main>
    </div>
  );
};

export default ProductForm;
