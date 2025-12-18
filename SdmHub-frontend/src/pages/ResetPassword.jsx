import { useState } from "react";
import { authService } from "../services/auth.service";
import "../assets/css/style.css";
import usePageTitle from '../hooks/usePageTitle';
import { useNavigate } from "react-router-dom";

export default function ResetPassword() {
    const navigate = useNavigate();
     usePageTitle('Reset password');
  const [email, setEmail] = useState("");
  const [oldPassword, setoldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [msg, setMsg] = useState("");

  const submit = async (e) => {
    e.preventDefault();

    if (newPassword.length < 6) {
      setMsg("Password must be 6+ characters");
      return;
    }

    try {
        const payload = { email, oldPassword, newPassword };
      const res = await authService.resetPassword(payload);
      console.log(res.data);
      setMsg(res.data.message);
      if(res.data.message == "Password reset successful")
      navigate("/login");
    } catch (err) {
      setMsg("Invalid request");
    }
  };

  return (
    <div className="single-panel-container">

      <h1 className="brand-heading">SDM Social</h1>

      <p className="brand-sub">
        Choose a strong new password you can remember.
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

        <label>OTP</label>
        <input
          type="text"
          placeholder="Your OTP"
          value={oldPassword}
          onChange={(e) => setoldPassword(e.target.value)}
          required
        />

        <label>New Password</label>
        <input
          type="password"
          placeholder="********"
          value={newPassword}
          onChange={(e) => setNewPassword(e.target.value)}
          required
        />

        {msg && <p className="form-msg">{msg}</p>}

        <button type="submit" className="primary-btn">
          Change Password
        </button>
      </form>

      <a href="/login" className="small-link">
        Back to login
      </a>

    </div>
  );
}
