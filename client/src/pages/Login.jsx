import React, { useState } from "react";
import axios from "axios";
import toast from "react-hot-toast";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function Login() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [formData, setFormData] = useState({ email: "", password: "" });
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    const toastId = toast.loading("Logging in...");
    try {
      const res = await axios.post("/api/auth/login", formData);
      toast.success("Welcome back!", { id: toastId });
      login(res.data.user, res.data.token);
      navigate("/dashboard");
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to login", { id: toastId });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-6 py-8 bg-DarkIndigo">
      <p className="mb-6 text-2xl font-semibold bg-gradient-to-r from-MineBlue via-MinePink to-MineYellow bg-clip-text text-transparent text-center">
        Back for More? We Knew You'd Return!
      </p>
      <div className="w-full max-w-md bg-white/5 border border-gray-800/30 rounded-2xl p-8 space-y-6 backdrop-blur-sm">
        <h1 className="text-2xl font-bold text-white">Welcome Back!</h1>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block mb-2 text-sm font-medium text-gray-300">Your email</label>
            <input
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              className="bg-white/5 border border-gray-700 text-white placeholder-gray-500 text-sm rounded-lg focus:ring-MineBlue focus:border-MineBlue block w-full px-4 py-3 focus:outline-none"
              placeholder="name@company.com"
              required
            />
          </div>
          <div>
            <label className="block mb-2 text-sm font-medium text-gray-300">Password</label>
            <input
              type="password"
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              className="bg-white/5 border border-gray-700 text-white placeholder-gray-500 text-sm rounded-lg focus:ring-MineBlue focus:border-MineBlue block w-full px-4 py-3 focus:outline-none"
              placeholder="••••••••"
              required
            />
          </div>
          <button
            type="submit"
            disabled={isLoading}
            className="w-full text-white font-semibold rounded-xl text-sm px-5 py-3 bg-gradient-to-r from-MineBlue via-MinePink to-MineDarkYellow hover:opacity-90 transition-opacity disabled:opacity-50"
          >
            {isLoading ? "Logging in..." : "Login"}
          </button>
          <p className="text-sm font-light text-gray-400">
            Don't Have An Account?{" "}
            <Link to="/signup" className="text-MineBlue hover:underline font-medium">
              Signup
            </Link>
          </p>
        </form>
      </div>
    </div>
  );
}
