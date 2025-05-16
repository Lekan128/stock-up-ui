import noProductPlaceHolder from "../assets/placeholders/no_product_placeholder.png";
import "./NoProduct.css";

const NoProduct = () => {
  return (
    <div className="no-product-container">
      <img className="no-product-image" src={noProductPlaceHolder} />
      <p>No Product Found</p>
    </div>
  );
};

export default NoProduct;
