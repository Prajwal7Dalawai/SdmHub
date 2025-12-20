import { useState, useEffect } from "react";
import { authService } from "../services/auth.service";
import usePageTitle from '../hooks/usePageTitle';
import "../assets/css/style.css";
import { useNavigate } from "react-router-dom";

export default function ForgotPassword() {
    const navigate = useNavigate();
     usePageTitle('Forgot Password');
  const [email, setEmail] = useState("");
  const [msg, setMsg] = useState("");
  let [loading, setloading] = useState("");

  useEffect(()=>{
    loading = false;
  },)

  const submit = async (e) => {
    e.preventDefault();
    try {
      setloading(true);
        console.log("tadi bhai");
        const res = await authService.forgotPassword(email);
        if(!res) console.log("Response innu bandilla bhai");
        console.log(res);
        setMsg(res.data?.message || "OTP sent!");
        setloading(false);
        // Optional redirect after success:
        navigate("/verify-reset");

    } catch (err) {
      setMsg(err.response?.data?.message || "Error sending OTP");
    }
  };

  return (
    <div className="single-panel-container">

      <h1 className="brand-heading">SDM Social</h1>

      <p className="brand-sub">
        Forgot your password? We will send OTP to your email.
      </p>

      <form onSubmit={submit} className="single-panel-form">

        <label>Email ID</label>
        <input
          type="email"
          placeholder="yourname@sdmcet.in"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />

        {msg && <p className="form-msg">{msg}</p>}
        {loading ? <p className="form-msg">Sending OTP</p> : null}

        <button type="submit" className="primary-btn">
          Send OTP
        </button>
      </form>

      <a href="/login" className="small-link">Back to login</a>
    </div>
  );
}
