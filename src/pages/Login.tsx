import { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import "./../components/AuthForm.css";
import { endpoints } from "../api/config";
import TextField from "../components/TextField";
import emailIcon from "../assets/icons/email.png";
import passwordIcon from "../assets/icons/lock.png";
import logo from "../assets/logo.png";
import { useLoading } from "../contexts/LoadingContext";
import { useNotification } from "../contexts/NotificationContext";

const Login = () => {
  const { showLoading, hideLoading } = useLoading();
  const { showNotification } = useNotification();

  const [form, setForm] = useState({ email: "", password: "" });
  const navigate = useNavigate();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    showLoading();
    try {
      const res = await axios.post(endpoints.login, form);
      localStorage.setItem("accessToken", res.data.accessToken);
      localStorage.setItem("refreshToken", res.data.refreshToken);
      hideLoading();
      showNotification("Wellcome back", "success");
      navigate("/products");
    } catch (err) {
      hideLoading();
      console.error("Login failed", err);
      showNotification("Error: " + err, "error");
    }
  };

  return (
    <div className="auth-layout">
      <div aria-hidden={true} className="side-content">
        <div className="side-container-text">
          <h2 className="text-logo">StockUp</h2>
          <p className="text-mission">
            Manage your inventory and boost your sales online—all in one place.
          </p>
        </div>
      </div>

      <div className="auth-container">
        <form className="auth-form" onSubmit={handleSubmit}>
          <img src={logo} alt="Logo" className="form-logo" />

          <TextField
            label="Email Address"
            placeholder="johndoe@gmail.com"
            value={form.email}
            onChange={(e) => handleChange(e)}
            required={true}
            leftImgSrc={emailIcon}
            name="email"
            type="email"
          />
          <TextField
            label="Password"
            placeholder="*****************"
            onChange={(e) => handleChange(e)}
            value={form.password}
            required={true}
            leftImgSrc={passwordIcon}
            type="password"
            name="password"
          />
          <button type="submit">Login</button>
        </form>
        <div className="bottom-sheet">
          <p>Don't have an account?</p>{" "}
          <p onClick={(_) => navigate("/signup")} className="bottom-sheet-link">
            SignUp
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
