import { useState } from "react";
import { authService } from "../services/auth.service";
import "../assets/css/style.css";
import usePageTitle from '../hooks/usePageTitle';
import { useNavigate } from "react-router-dom";

export default function VerifyOTP() {
    const navigate = useNavigate();
     usePageTitle('OTP verification');
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [msg, setMsg] = useState("");

  const submitOtp = async (e) => {
    e.preventDefault();
    try {
      const res = await authService.verifyOTP(email, otp);
      setMsg(res.message);
      console.log(res.data);
      if(res.data.success) navigate("/reset-password");
    } catch (err) {
      setMsg("Invalid OTP");
    }
  };

  return (
    <div className="single-panel-container">

      <h1 className="brand-heading">SDM Social</h1>

      <p className="brand-sub">
        Enter the OTP you received on your email.
      </p>

      <form onSubmit={submitOtp} className="single-panel-form">

        <label>Email ID</label>
        <input
          type="email"
          placeholder="yourname@sdmcet.in"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />

        <label>OTP</label>
        <input
          type="text"
          placeholder="6-digit code"
          value={otp}
          onChange={(e) => setOtp(e.target.value)}
          required
        />

        {msg && <p className="form-msg">{msg}</p>}

        <button type="submit" className="primary-btn">
          Verify OTP
        </button>
      </form>

      <a href="/forgot-password" className="small-link">
        Resend OTP
      </a>

    </div>
  );
}
