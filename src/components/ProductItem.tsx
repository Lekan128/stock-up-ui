import React, { useState } from "react";
import "./ProductItem.css";
import { Product } from "../model/types";
import arrowUpIcon from "../assets/icons/arrow-up.png";
import arrowDownIcon from "../assets/icons/arrow-down.png";

interface ProductViewProps {
  product: Product;
  onClick: (product: Product) => void;
}

const ProductItem: React.FC<ProductViewProps> = ({ product, onClick }) => {
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

  const toggleExpand = (e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent triggering the parent onClick
    setIsExpanded(!isExpanded);
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

          <button className="expand-button" onClick={toggleExpand}>
            <img src={isExpanded ? arrowDownIcon : arrowUpIcon} />
          </button>

          {/* <p className="product-name element-space">{name}</p>
          <p className="element-space">{sellingPrice}</p> */}
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
              <div className="detail-row">
                <span className="description">Description:</span>
                <span className="value">{description}</span>
              </div>
              <div className="detail-row">
                <span className="description">Category:</span>
                <span className="value">{category?.name}</span>
              </div>
            </div>
            <button className="expanded-content-button">
              <span>Edit</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProductItem;
