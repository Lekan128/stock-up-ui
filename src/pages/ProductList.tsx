import React, { useEffect, useState } from "react";
import ProductItem from "../components/ProductItem";
import "./ProductList.css";
import { Product } from "../model/types";
import { useNavigate } from "react-router-dom";
import axiosInstance from "../utils/axiosInstance";
import logo from "../assets/logo.png";
import seatchIcon from "../assets/icons/search.png";
import TextField from "../components/TextField";
import AiProductItem from "../components/AiProductItem";

const ProductList = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const navigate = useNavigate();

  const [searchWord, setSearchWord] = useState<string>("");
  const handleProductClick = (product: Product) => {
    //Todo: undo
    navigate("/product", { state: { product } });
  };

  useEffect(() => {
    axiosInstance
      .get("/products")
      .then((res) => setProducts(res.data))
      .catch((err) => {
        console.error("Error fetching products:", err);
        navigate("/login");
      });
  }, []);

  const handleSearch = () => {
    axiosInstance
      .get("/products?search=" + searchWord)
      .then((res) => setProducts(res.data))
      .catch((err) => {
        console.error("Error fetching products:", err);
        navigate("/login");
      });
  };

  return (
    <div className="main-container">
      <img src={logo} alt="Logo" className="center-logo" />
      {/* search bar */}
      <TextField
        placeholder="search"
        rightImgSrc={seatchIcon}
        onRightImageClick={(_) => handleSearch()}
        onChange={(e) => setSearchWord(e.target.value)}
        value={searchWord}
      />

      <header className="header-container">
        <div className="row">
          <p className="element-charachter"> ↓ </p>
          <p className="product-name element-charachter">Products</p>
          <p
            onClick={(_) => navigate("/addProduct")}
            className="element-charachter add-product-button"
          >
            Add Product ↗
          </p>
        </div>
      </header>

      {products.map((product) => (
        <ProductItem
          key={product.id}
          product={product}
          onClick={(e) => handleProductClick(e)}
        />
      ))}
    </div>
  );
};

export default ProductList;
