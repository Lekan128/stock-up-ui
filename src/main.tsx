import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./styles.css";
import "./variable.css";
import App from "./App.tsx";
import TextField from "./components/TextField.tsx";
import ProductForm2 from "./pages/ProductForm2.tsx";
import ProductForm from "./pages/ProductForm.tsx";
import Login from "./pages/Login.tsx";
import SignUp from "./pages/SignUp.tsx";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import NotFound from "./pages/NotFound.tsx";
import ProductList from "./pages/ProductList.tsx";

const router = createBrowserRouter([
  {
    path: "/",
    element: <ProductList />,
    errorElement: <NotFound />,
  },
  {
    path: "/products",
    element: <ProductList />,
    errorElement: <NotFound />,
  },
  {
    path: "/signup",
    element: <SignUp />,
    errorElement: <NotFound />,
  },
  {
    path: "/login",
    element: <Login />,
    errorElement: <NotFound />,
  },
  {
    path: "/addProduct",
    element: <ProductForm />,
    errorElement: <NotFound />,
  },
]);

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <RouterProvider router={router} />
  </StrictMode>
);
