import React, { useState } from "react";
import { api } from "../api";
import { useNavigate, Link } from "react-router-dom";

export default function Register() {
  const [f, sF] = useState({ username: "", email: "", password: "" });
  const nav = useNavigate();

  const submit = async (e) => {
    e.preventDefault();
    try {
      await api.post("/auth/register", f);
      alert("Registered! Please log in.");
      nav("/login");
    } catch (e) {
      alert(e.response?.data?.msg || "Register failed");
    }
  };

  return (
    <div className="auth-box">
      <h2>Register</h2>
      <form onSubmit={submit}>
        <input
          placeholder="Username"
          value={f.username}
          onChange={(e) => sF({ ...f, username: e.target.value })}
        />
        <input
          placeholder="Email"
          value={f.email}
          onChange={(e) => sF({ ...f, email: e.target.value })}
        />
        <input
          type="password"
          placeholder="Password"
          value={f.password}
          onChange={(e) => sF({ ...f, password: e.target.value })}
        />
        <button>Sign up</button>
      </form>
      <p>
        Have an account? <Link to="/login">Login</Link>
      </p>
    </div>
  );
}
