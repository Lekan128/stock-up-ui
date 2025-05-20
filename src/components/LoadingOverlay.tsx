import logo from "../assets/logo.png";
import "./LoadingOverlay.css";

const LoadingOverlay = () => {
  return (
    <div className="loading-overlay">
      <div className="loading-content">
        <img src={logo} alt="Loading..." className="pulsing-logo" />
      </div>
    </div>
  );
};

export default LoadingOverlay;
