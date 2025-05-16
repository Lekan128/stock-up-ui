import { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import "./../components/AuthForm.css";
import logo from "../assets/logo.png";
import TextField from "../components/TextField";
import emailIcon from "../assets/icons/email.png";
import passwordIcon from "../assets/icons/lock.png";
import personIcon from "../assets/icons/person.png";
import { endpoints } from "../api/config";
import { useLoading } from "../contexts/LoadingContext";
import { useNotification } from "../contexts/NotificationContext";

const SignUp = () => {
  const navigate = useNavigate();
  const { showLoading, hideLoading } = useLoading();
  const { showNotification } = useNotification();

  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    mobileNumber: "",
    storeName: "",
    storeAddress: "",
  });

  //

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    showLoading();
    try {
      const res = await axios.post(endpoints.register, form);
      localStorage.setItem("accessToken", res.data.accessToken);
      localStorage.setItem("refreshToken", res.data.refreshToken);
      hideLoading();
      showNotification("Wellcome", "success");
      navigate("/products"); // reference to product list page
    } catch (err) {
      hideLoading();
      console.error("Signup failed", err);
      showNotification("Error: " + err, "error");
    }
  };

  return (
    <>
      <div className="auth-layout">
        <div aria-hidden={true} className="side-content">
          <div className="side-container-text">
            <h2 className="text-logo">StockUp</h2>
            <p className="text-mission">
              Manage your inventory and boost your sales online—all in one
              place.
            </p>
          </div>
        </div>

        <div className="auth-container">
          <form className="auth-form" onSubmit={handleSubmit}>
            <img src={logo} alt="Logo" className="form-logo" />

            <TextField
              name="firstName"
              placeholder="First name"
              onChange={handleChange}
              value={form.firstName}
              leftImgSrc={personIcon}
              required
            />

            <TextField
              name="lastName"
              placeholder="Last name"
              onChange={handleChange}
              value={form.lastName}
              leftImgSrc={personIcon}
              required
            />
            <TextField
              name="email"
              type="email"
              placeholder="Email"
              onChange={handleChange}
              value={form.email}
              leftImgSrc={emailIcon}
              required
            />
            <TextField
              name="password"
              type="password"
              placeholder="Password"
              onChange={handleChange}
              value={form.password}
              leftImgSrc={passwordIcon}
              required
            />
            <TextField
              name="mobileNumber"
              placeholder="Mobile number (optional)"
              onChange={handleChange}
              value={form.mobileNumber}
            />
            <TextField
              name="storeName"
              placeholder="Store name"
              onChange={handleChange}
              value={form.storeName}
              required
            />
            <TextField
              name="storeAddress"
              placeholder="Store address (optional)"
              onChange={handleChange}
              value={form.storeAddress}
            />
            <button type="submit">Sign Up</button>
          </form>

          <div className="bottom-sheet">
            <p>Already have an account?</p>{" "}
            <p
              onClick={(_) => navigate("/login")}
              className="bottom-sheet-link"
            >
              Login
            </p>
          </div>
        </div>
      </div>
    </>
  );
};

export default SignUp;
