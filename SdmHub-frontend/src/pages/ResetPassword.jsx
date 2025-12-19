import { useState } from "react";
import { authService } from "../services/auth.service";
import "../assets/css/style.css";
import usePageTitle from '../hooks/usePageTitle';
import { useNavigate } from "react-router-dom";

export default function ResetPassword() {
    const navigate = useNavigate();
     usePageTitle('Reset password');
  const [newPassword, setnewPassword] = useState("");
  const [confirmNewPassword, setconfirmNewPassword] = useState("");
  const [msg, setMsg] = useState("");

  const submit = async (e) => {
    e.preventDefault();

    if (confirmNewPassword.length < 6) {
      setMsg("Password must be 6+ characters");
      return;
    }
    if(newPassword != confirmNewPassword){
      setMsg("Password Mismatch!!");
      return;
    }

    try {
      const payload = { newPassword, confirmNewPassword };
      const res = await authService.resetPassword(payload);
      console.log(res.message);
      setMsg(res.message);
      if(res.message === "Password reset successful")
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

        <label>New Password</label>
        <input
          type="Password"
          placeholder="*********"
          value={newPassword}
          onChange={(e) => setnewPassword(e.target.value)}
          required
        />

        <label>Confirm New Password</label>
        <input
          type="password"
          placeholder="********"
          value={confirmNewPassword}
          onChange={(e) => setconfirmNewPassword(e.target.value)}
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
