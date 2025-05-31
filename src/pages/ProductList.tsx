import { useEffect, useState } from "react";
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
import { useNotification } from "../contexts/NotificationContext";
import NoProduct from "../components/NoProduct";
import { AxiosError } from "axios";

const ProductList = () => {
  const { showLoading, hideLoading } = useLoading();
  const { showNotification } = useNotification();

  const [products, setProducts] = useState<Product[]>([]);
  const navigate = useNavigate();

  const [editingProduct, setEditingProduct] = useState<Product | null>(null);

  const [searchWord, setSearchWord] = useState<string>("");
  const handleProductClick = (product: Product) => {
    //Todo: undo
    if (false) {
      navigate("/product", { state: { product } });
    }
    showNotification("Coming soon", "info");
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
        showNotification("Login", "info");
        hideLoading();
        navigate("/login");
      });
  }, []);

  useEffect(() => {
    if (editingProduct) {
      // Push a new state to history when modal is opened
      window.history.pushState({ modalOpen: true }, "");

      // Listen for back/forward button
      const handlePopState = (_: PopStateEvent) => {
        setEditingProduct(null);
      };

      window.addEventListener("popstate", handlePopState);

      // Cleanup when modal closes
      return () => {
        window.removeEventListener("popstate", handlePopState);

        // Go back one history step so that the URL is back to what it was
        if (window.history.state?.modalOpen) {
          window.history.back();
        }
      };
    }
  }, [editingProduct]);

  const handleSearch = () => {
    showLoading();
    axiosInstance
      .get("/products?search=" + searchWord)
      .then((res) => {
        setProducts(res.data);
        hideLoading();
      })
      .catch((err) => {
        hideLoading();
        console.error("Error fetching products:", err);
        showNotification("Error: " + err, "error");
      });
  };

  const handleSaveProduct = async (
    //Loading managed by EditProductModal
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

        // await axiosInstance.patch(`/products/image/${updatedProduct.id}`, {
        //   imageUrl: imageUrl,
        // });

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

      showNotification("Product saved", "success");
    } catch (error) {
      console.log(error);
      console.error("Login failed", error);
      hideLoading();

      if (error instanceof AxiosError) {
        showNotification(
          "Error: " + error.response?.data.errorMessage,
          "error"
        );
        return;
      } else {
        showNotification("Error: " + error, "error");
      }
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

      {!products.length && <NoProduct />}
    </div>
  );
};

export default ProductList;
