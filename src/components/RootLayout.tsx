import { Outlet } from "react-router-dom";
import { useLoading } from "../contexts/LoadingContext";
import LoadingOverlay from "./LoadingOverlay";

const RootLayout = () => {
  const { isLoading } = useLoading();

  return (
    <div className="root-layout">
      {isLoading && <LoadingOverlay />}
      <Outlet />
    </div>
  );
};

export default RootLayout;
