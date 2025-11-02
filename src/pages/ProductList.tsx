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
import SalesCart from "../components/SalesCart";
import { AxiosError } from "axios";

const ProductList = () => {
  const { showLoading, hideLoading } = useLoading();
  const { showNotification } = useNotification();

  const [products, setProducts] = useState<Product[]>([]);
  const [cartCounts, setCartCounts] = useState<Record<string, number>>({});
  const navigate = useNavigate();

  const handleQuantityChange = (productId: string | undefined, qty: number) => {
    setCartCounts((prev) => ({ ...prev, [String(productId)]: qty }));
  };

  const handleSaveSales = async () => {
    // Build payload from cartCounts (only > 0)
    const payload = Object.entries(cartCounts)
      .filter(([, qty]) => qty > 0)
      .map(([productId, qty]) => ({ productId, quantity: qty }));

    if (payload.length === 0) {
      showNotification("No items to save", "info");
      return;
    }

    showLoading();
    try {
      await axiosInstance.post("/sales/bulk", payload);
      showNotification("Sales recorded", "success");

      // Clear cartCounts
      setCartCounts({});

      // Update product availability locally (optimistic)
      setProducts((prev) =>
        prev.map((p) => {
          const sold = cartCounts[String(p.id)] || 0;
          if (!sold) return p;
          const newAvailable = typeof p.numberAvailable === "number" ? p.numberAvailable - sold : p.numberAvailable;
          return { ...p, numberAvailable: newAvailable } as Product;
        })
      );
    } catch (err) {
      console.error("Error saving sales", err);
      showNotification("Error saving sales", "error");
    } finally {
      hideLoading();
    }
  };

  useEffect(() => {
    console.log("cartCounts", cartCounts);
  }, [cartCounts]);

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
        showNotification("Product Updated! Uploading Image", "success");

        const formData = new FormData();
        formData.append("file", newImageFile);

        const uploadResponse = await axiosInstance.post(
          `/s3/upload/${updatedProduct.id}`,
          formData,
          { headers: { "Content-Type": "multipart/form-data" } }
        );

        updatedProduct.imageUrl = uploadResponse.data;
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
            onClick={(_) => navigate("/addProductList")}
            className="element-charachter add-product-button"
          >
            Add Products ↗
          </p>
        </div>
      </header>

      {products.map((product) => (
        <ProductItem
          key={product.id}
          product={product}
          onClick={(e) => handleProductClick(e)}
          onEditClicked={(p) => setEditingProduct(p)}
          initialQuantity={cartCounts[String(product.id)] || 0}
          onQuantityChange={(id, qty) => handleQuantityChange(id, qty)}
        />
      ))}

      <SalesCart
        cartCounts={cartCounts}
        products={products}
        onQuantityChange={(id, qty) => handleQuantityChange(id, qty)}
        onSave={handleSaveSales}
      />

      {editingProduct && (
        <EditProductModal
          product={editingProduct}
          onClose={() => setEditingProduct(null)}
          onSave={handleSaveProduct}
        />
      )}

      {!products.length && <NoProduct />}

      <button
        className="circular-button"
        onClick={(_) => navigate("/addProduct")}
      >
        +
      </button>
    </div>
  );
};

export default ProductList;
