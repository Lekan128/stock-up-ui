import React, { useEffect, useState } from "react";
import ProductItem from "../components/ProductItem";
import "./ProductList.css";
import { Product } from "../model/types";
import { useNavigate } from "react-router-dom";
import axiosInstance from "../utils/axiosInstance";
import logo from "../assets/logo.png";
import seatchIcon from "../assets/icons/search.png";
import TextField from "../components/TextField";
import EditProductModal from "../components/EditProductModal";
import { useLoading } from "../contexts/LoadingContext";

const ProductList = () => {
  const { showLoading, hideLoading } = useLoading();
  const [products, setProducts] = useState<Product[]>([]);
  const navigate = useNavigate();

  const [editingProduct, setEditingProduct] = useState<Product | null>(null);

  const [searchWord, setSearchWord] = useState<string>("");
  const handleProductClick = (product: Product) => {
    //Todo: undo
    navigate("/product", { state: { product } });
  };

  useEffect(() => {
    showLoading();
    axiosInstance
      .get("/products")
      .then((res) => {
        setProducts(res.data);
        hideLoading();
      })
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

  const handleSaveProduct = async (
    updatedProduct: Product,
    newImageFile?: File
  ) => {
    try {
      // First update product data
      await axiosInstance.patch(`/products/${updatedProduct.id}`, {
        name: updatedProduct.name,
        numberAvailable: updatedProduct.numberAvailable,
        costPrice: updatedProduct.costPrice,
        sellingPrice: updatedProduct.sellingPrice,
        description: updatedProduct.description,
      });

      // Then handle image upload if exists
      if (newImageFile) {
        const formData = new FormData();
        formData.append("file", newImageFile);

        const uploadResponse = await axiosInstance.post(
          `/s3/upload/${updatedProduct.id}`,
          formData,
          { headers: { "Content-Type": "multipart/form-data" } }
        );

        const imageUrl = uploadResponse.data;

        await axiosInstance.patch(`/products/image/${updatedProduct.id}`, {
          imageUrl: imageUrl,
        });

        updatedProduct.imageUrl = imageUrl;
      }

      // Optimistic update
      setProducts((prev) =>
        prev.map((p) =>
          p.id === updatedProduct.id
            ? {
                ...updatedProduct,
              }
            : p
        )
      );
    } catch (error) {
      // Handle error (add error notification state here)
      throw error;
    }
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
          onEditClicked={(p) => setEditingProduct(p)}
        />
      ))}

      {editingProduct && (
        <EditProductModal
          product={editingProduct}
          onClose={() => setEditingProduct(null)}
          onSave={handleSaveProduct}
        />
      )}
    </div>
  );
};

export default ProductList;
