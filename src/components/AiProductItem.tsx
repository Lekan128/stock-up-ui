import React, { useState } from "react";
import "./AiProductItem.css"; // You can move the styles here
import { Product } from "../model/types";

interface ProductViewProps {
  product: Product;
  onClick: (product: Product) => void;
}

const AiProductItem: React.FC<ProductViewProps> = ({ product, onClick }) => {
  const {
    imageUrl,
    name,
    sellingPrice,
    costPrice,
    numberAvailable,
    description,
  } = product;
  const [isExpanded, setIsExpanded] = useState(false);

  const toggleExpand = (e: React.MouseEvent) => {
    // e.stopPropagation(); // Prevent triggering the parent onClick
    setIsExpanded(!isExpanded);
  };

  return (
    <div
      className="container"
      // onClick={() => onClick(product)}
    >
      <div className="row">
        <img
          className="image element-space"
          src={imageUrl || "/placeholder-product.png"}
          alt={name}
        />

        <div className="product-info">
          <p className="product-name">{name}</p>
          <p className="selling-price">₦{sellingPrice.toLocaleString()}</p>
        </div>

        <button className="expand-button" onClick={toggleExpand}>
          <span className={`arrow ${isExpanded ? "down" : "up"}`}></span>
        </button>
      </div>

      {isExpanded && (
        <div className="expanded-content">
          {costPrice && (
            <div className="detail-row">
              <span>Cost Price:</span>
              <span>₦{costPrice.toLocaleString()}</span>
            </div>
          )}
          <div className="detail-row">
            <span>Available:</span>
            <span>{numberAvailable}</span>
          </div>
          <div className="detail-row">
            <span>Description:</span>
            <span>{description}</span>
          </div>
        </div>
      )}
    </div>
  );
};

export default AiProductItem;
