import React, { useEffect, useState } from "react";
import "./ProductItem.css";
import { Product } from "../model/types";
import arrowUpIcon from "../assets/icons/arrow-up.png";
import arrowDownIcon from "../assets/icons/arrow-down.png";
import { renderMarkdownToHtml } from "../utils/markdownUtils";

interface ProductViewProps {
  product: Product;
  onClick: (product: Product) => void;
  onEditClicked: (product: Product) => void;
  initialQuantity?: number;
  onQuantityChange?: (productId: string | undefined, qty: number) => void;
}

const ProductItem: React.FC<ProductViewProps> = ({
  product,
  onClick,
  onEditClicked,
  initialQuantity = 0,
  onQuantityChange,
}) => {
  const {
    imageUrl,
    name,
    sellingPrice,
    category,
    costPrice,
    numberAvailable,
    description,
  } = product;
  // (Image)(ProductName)(SellingPrice)
  // const mystyle = {
  //   color: "black",
  // };

  const [isExpanded, setIsExpanded] = useState(false);
  const [count, setCount] = useState<number>(initialQuantity ?? 0);

  // Keep local count in sync if parent updates initialQuantity (e.g. session restore or other components)
  useEffect(() => {
    setCount(initialQuantity ?? 0);
  }, [initialQuantity]);

  const toggleExpand = (e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent triggering the parent onClick
    setIsExpanded(!isExpanded);
  };

  const handleEditClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onEditClicked(product);
  };

  // useEffect(() => {
  //   // inform parent of initial value (useful if parent expects an entry)
  //   onQuantityChange?.(product.id, count);
  //   // eslint-disable-next-line react-hooks/exhaustive-deps
  // }, []); // run once on mount

  const increment = (e: React.MouseEvent<HTMLButtonElement>) => {
    // prevent parent row/product click when pressing the qty buttons
    e.stopPropagation();
    setCount((c) => {
      const next = c + 1;
      onQuantityChange?.(product.id, next);
      return next;
    });
  };

  const decrement = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.stopPropagation();
    setCount((c) => {
      const next = Math.max(0, c - 1);
      if (next !== c) {
        onQuantityChange?.(product.id, next);
      }
      return next;
    });
  };

  return (
    <div className="container" onClick={() => onClick(product)}>
      <div className="inner-container">
        <div className="row">
          <img className="image element-space" src={imageUrl} />

          <div className="product-info">
            <p className="product-name">{name}</p>
            <p className="selling-price">₦{sellingPrice.toLocaleString()}</p>
          </div>

          {/* quantity controls: plus (top), box (middle), minus (bottom) */}
          <div className="quantity-controls">
            <button
              className="qty-btn plus"
              onClick={increment}
              aria-label="add"
            >
              +
            </button>
            <div className="qty-box">{count}</div>
            <button
              className="qty-btn minus"
              onClick={decrement}
              aria-label="remove"
            >
              −
            </button>
          </div>

          <button className="expand-button" onClick={toggleExpand}>
            <img src={isExpanded ? arrowUpIcon : arrowDownIcon} />
          </button>
        </div>
        {isExpanded && (
          <div className="expanded-content">
            <div className="expanded-content-left">
              {costPrice && (
                <div className="detail-row">
                  <span className="description">Cost Price:</span>
                  <span className="value">₦{costPrice.toLocaleString()}</span>
                </div>
              )}
              <div className="detail-row">
                <span className="description">Available:</span>
                <span className="value">{numberAvailable}</span>
              </div>
              <div className="detail-row" style={{ whiteSpace: "pre-wrap" }}>
                <span className="description">Description:</span>
                <span
                  className="value"
                  dangerouslySetInnerHTML={{
                    __html: renderMarkdownToHtml(description),
                  }}
                />
              </div>
              <div className="detail-row">
                <span className="description">Category:</span>
                <span className="value">{category?.name}</span>
              </div>
            </div>
            <button
              className="expanded-content-button"
              onClick={handleEditClick}
            >
              <span>Edit</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProductItem;
