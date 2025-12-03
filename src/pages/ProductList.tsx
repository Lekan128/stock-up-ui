import { useEffect, useState } from "react";
import ProductItem from "../components/ProductItem";
import "./ProductList.css";
import { Product } from "../model/types";
import { useNavigate } from "react-router-dom";
import axiosInstance from "../utils/axiosInstance";
import logo from "../assets/logo.png";
import seatchIcon from "../assets/icons/search.png";
import TextField from "../components/TextField";
import ChatInterface from "../components/ChatInterface";
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

  const sessionStorageKey = "salesCart";

  // Load saved cartCounts from sessionStorage on initial mount
  useEffect(() => {
    try {
      const raw = sessionStorage.getItem(sessionStorageKey);
      if (raw) {
        const parsed = JSON.parse(raw) as Record<string, number>;
        // Basic validation: ensure parsed is an object
        if (parsed && typeof parsed === "object") {
          setCartCounts(parsed);
        }
      }
    } catch (err) {
      // ignore parse errors and keep cartCounts empty
      console.warn("Failed to parse saved cartCounts, clearing session", err);
      sessionStorage.removeItem(sessionStorageKey);
      setCartCounts({});
    }
    // Only run on mount
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleQuantityChange = (productId: string | undefined, qty: number) => {
    if (!productId) return;
    setCartCounts((prev) => {
      const next: Record<string, number> = { ...prev };
      if (qty <= 0) {
        delete next[String(productId)];
      } else {
        next[String(productId)] = qty;
      }
      try {
        sessionStorage.setItem(sessionStorageKey, JSON.stringify(next));
      } catch (err) {
        console.warn("Failed to persist cartCounts to sessionStorage", err);
      }
      return next;
    });
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
      try {
        sessionStorage.removeItem(sessionStorageKey);
      } catch (err) {
        console.warn("Failed to remove cartCounts from sessionStorage", err);
      }

      // Update product availability locally (optimistic)
      setProducts((prev) =>
        prev.map((p) => {
          const sold = cartCounts[String(p.id)] || 0;
          if (!sold) return p;
          const newAvailable =
            typeof p.numberAvailable === "number"
              ? p.numberAvailable - sold
              : p.numberAvailable;
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

  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [isChatOpen, setIsChatOpen] = useState(false);
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

        // Validate saved cartCounts: if any saved productId doesn't exist in fetched products,
        // clear the saved cart to avoid conflicts between session data and DB state.
        try {
          const raw = sessionStorage.getItem(sessionStorageKey);
          if (raw) {
            const parsed = JSON.parse(raw) as Record<string, number>;
            const ids = new Set(res.data.map((p: Product) => String(p.id)));
            const keys = Object.keys(parsed || {});
            const allExist = keys.every((k) => ids.has(k));
            if (!allExist) {
              sessionStorage.removeItem(sessionStorageKey);
              setCartCounts({});
            } else {
              // ensure memory matches parsed (covers case mount-load didn't pick it up)
              setCartCounts(parsed);
            }
          }
        } catch (err) {
          console.warn("Error validating cartCounts from sessionStorage", err);
          sessionStorage.removeItem(sessionStorageKey);
          setCartCounts({});
        }
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
          {/* sales link moved to floating button for better UX */}
        </div>
      </header>

      {/* Floating buttons (hidden when chat is open to avoid overlap on mobile) */}
      {!isChatOpen && (
        <>
          <button
            className="sales-floating"
            onClick={() => navigate("/sales")}
            aria-label="Open Sales dashboard"
          >
            Sales
          </button>

          <button
            className="chat-floating"
            onClick={() => setIsChatOpen(true)}
            aria-label="Open AI Chat"
          >
            💬
          </button>

          <button
            className="add-single-product-floating"
            onClick={(_) => navigate("/addProduct")}
          >
            +
          </button>
        </>
      )}

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

      {isChatOpen && <ChatInterface onClose={() => setIsChatOpen(false)} />}
    </div>
  );
};

export default ProductList;
