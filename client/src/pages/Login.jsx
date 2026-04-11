import React, { useState } from "react";
import axios from "axios";
import toast from "react-hot-toast";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useTheme } from "../context/ThemeContext";
import { Sun, Moon, MessageCircle, Eye, EyeOff } from "lucide-react";

export default function Login() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const { isDark, toggleTheme } = useTheme();
  const [formData, setFormData] = useState({ email: "", password: "" });
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    const toastId = toast.loading("Logging in...");
    try {
      const res = await axios.post("/api/auth/login", formData);
      toast.success("Welcome back! 👋", { id: toastId });
      login(res.data.user, res.data.token);
      navigate("/dashboard");
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to login", { id: toastId });
    } finally {
      setIsLoading(false);
    }
  };

  const inputClass =
    "w-full bg-gray-100 dark:bg-white/5 border border-gray-300 dark:border-gray-700 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 text-sm rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-MineBlue focus:border-transparent transition-all";

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 bg-gray-50 dark:bg-DarkIndigo transition-colors duration-300">
      {/* Theme toggle */}
      <div className="fixed top-4 right-4">
        <button
          onClick={toggleTheme}
          className="p-2.5 rounded-xl bg-white dark:bg-white/10 border border-gray-200 dark:border-gray-700 hover:border-MineBlue transition-all shadow-sm"
        >
          {isDark ? <Sun size={17} className="text-MineYellow" /> : <Moon size={17} className="text-MineBlue" />}
        </button>
      </div>

      {/* Back to home */}
      <Link to="/" className="flex items-center gap-2 mb-8">
        <MessageCircle size={22} className="text-MineBlue" />
        <span className="text-lg font-bold bg-gradient-to-r from-MineBlue via-MinePink to-MineYellow bg-clip-text text-transparent">
          Mingle
        </span>
      </Link>

      {/* Card */}
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Welcome Back! 👋</h1>
          <p className="text-gray-500 dark:text-gray-400 text-sm">
            Back for more? We knew you'd return!
          </p>
        </div>

        <div className="bg-white dark:bg-white/5 border border-gray-200 dark:border-gray-800/50 rounded-2xl p-8 shadow-xl shadow-gray-200/50 dark:shadow-none backdrop-blur-sm">
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block mb-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                Email address
              </label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className={inputClass}
                placeholder="name@company.com"
                required
              />
            </div>

            <div>
              <label className="block mb-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  className={`${inputClass} pr-11`}
                  placeholder="••••••••"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3.5 text-sm font-bold text-white rounded-xl bg-gradient-to-r from-MineBlue via-MinePink to-MineDarkYellow hover:opacity-90 active:scale-95 transition-all disabled:opacity-50 shadow-lg shadow-MineBlue/20 mt-2"
            >
              {isLoading ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                  </svg>
                  Logging in...
                </span>
              ) : "Login"}
            </button>
          </form>
        </div>

        <p className="text-center text-sm text-gray-500 dark:text-gray-400 mt-6">
          Don't have an account?{" "}
          <Link to="/signup" className="text-MineBlue hover:underline font-semibold">
            Sign up for free
          </Link>
        </p>
      </div>
    </div>
  );
}
