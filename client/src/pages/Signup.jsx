import React, { useState } from "react";
import axios from "axios";
import toast from "react-hot-toast";
import { useNavigate, Link } from "react-router-dom";
import { useTheme } from "../context/ThemeContext";
import { Sun, Moon, MessageCircle, Eye, EyeOff, ArrowLeft } from "lucide-react";

export default function Signup() {
  const navigate = useNavigate();
  const { isDark, toggleTheme } = useTheme();
  const [formData, setFormData] = useState({
    email: "", username: "", firstName: "", lastName: "", password: "", otp: ""
  });
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleSendOtp = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    const toastId = toast.loading("Sending OTP...");
    try {
      await axios.post("/api/auth/otp", { email: formData.email });
      toast.success("OTP sent to your email!", { id: toastId });
      setIsDialogOpen(true);
    } catch (err) {
      toast.error("Failed to send OTP", { id: toastId });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignup = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    const toastId = toast.loading("Creating your account...");
    try {
      await axios.post("/api/auth/signup", formData);
      toast.success("Account created! Please login 🎉", { id: toastId });
      navigate("/login");
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to create account", { id: toastId });
    } finally {
      setIsLoading(false);
    }
  };

  const inputClass =
    "w-full bg-gray-100 dark:bg-white/5 border border-gray-300 dark:border-gray-700 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 text-sm rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-MineBlue focus:border-transparent transition-all";
  const labelClass = "block mb-1.5 text-sm font-medium text-gray-700 dark:text-gray-300";

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 py-10 bg-gray-50 dark:bg-DarkIndigo transition-colors duration-300">
      {/* Theme toggle */}
      <div className="fixed top-4 right-4">
        <button
          onClick={toggleTheme}
          className="p-2.5 rounded-xl bg-white dark:bg-white/10 border border-gray-200 dark:border-gray-700 hover:border-MineBlue transition-all shadow-sm"
        >
          {isDark ? <Sun size={17} className="text-MineYellow" /> : <Moon size={17} className="text-MineBlue" />}
        </button>
      </div>

      {/* Logo */}
      <Link to="/" className="flex items-center gap-2 mb-8">
        <MessageCircle size={22} className="text-MineBlue" />
        <span className="text-lg font-bold bg-gradient-to-r from-MineBlue via-MinePink to-MineYellow bg-clip-text text-transparent">
          Mingle
        </span>
      </Link>

      {/* Card */}
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            {isDialogOpen ? "Verify Your Email ✉️" : "Create an Account 🚀"}
          </h1>
          <p className="text-gray-500 dark:text-gray-400 text-sm">
            {isDialogOpen
              ? `We sent a 4-digit code to ${formData.email}`
              : "One click away from greatness"}
          </p>
        </div>

        <div className="bg-white dark:bg-white/5 border border-gray-200 dark:border-gray-800/50 rounded-2xl p-8 shadow-xl shadow-gray-200/50 dark:shadow-none backdrop-blur-sm">

          {!isDialogOpen ? (
            <form onSubmit={handleSendOtp} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className={labelClass}>First Name</label>
                  <input type="text" className={inputClass} placeholder="John" value={formData.firstName}
                    onChange={(e) => setFormData({ ...formData, firstName: e.target.value })} required />
                </div>
                <div>
                  <label className={labelClass}>Last Name</label>
                  <input type="text" className={inputClass} placeholder="Doe" value={formData.lastName}
                    onChange={(e) => setFormData({ ...formData, lastName: e.target.value })} />
                </div>
              </div>
              <div>
                <label className={labelClass}>Username</label>
                <input type="text" className={inputClass} placeholder="johndoe" value={formData.username}
                  onChange={(e) => setFormData({ ...formData, username: e.target.value })} required />
              </div>
              <div>
                <label className={labelClass}>Email</label>
                <input type="email" className={inputClass} placeholder="name@company.com" value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })} required />
              </div>
              <div>
                <label className={labelClass}>Password</label>
                <div className="relative">
                  <input type={showPassword ? "text" : "password"} className={`${inputClass} pr-11`}
                    placeholder="••••••••" value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })} required />
                  <button type="button" onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300">
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>
              <button type="submit" disabled={isLoading}
                className="w-full py-3.5 text-sm font-bold text-white rounded-xl bg-gradient-to-r from-MineBlue via-MinePink to-MineDarkYellow hover:opacity-90 active:scale-95 transition-all disabled:opacity-50 shadow-lg shadow-MineBlue/20 mt-1">
                {isLoading ? "Sending OTP..." : "Continue — Verify Email"}
              </button>
            </form>
          ) : (
            <form onSubmit={handleSignup} className="space-y-5">
              <div>
                <label className={`${labelClass} text-center block`}>Enter 4-digit OTP</label>
                <input
                  type="text"
                  maxLength={4}
                  className={`${inputClass} text-center text-3xl font-bold tracking-[0.6em] py-4`}
                  value={formData.otp}
                  onChange={(e) => setFormData({ ...formData, otp: e.target.value })}
                  required
                  autoFocus
                />
              </div>
              <button type="submit" disabled={isLoading}
                className="w-full py-3.5 text-sm font-bold text-white rounded-xl bg-green-500 hover:bg-green-400 active:scale-95 transition-all disabled:opacity-50">
                {isLoading ? "Creating Account..." : "Create Account 🎉"}
              </button>
              <button type="button" onClick={() => setIsDialogOpen(false)}
                className="w-full flex items-center justify-center gap-2 py-2.5 text-sm text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 transition-colors">
                <ArrowLeft size={14} /> Go back and edit
              </button>
            </form>
          )}
        </div>

        <p className="text-center text-sm text-gray-500 dark:text-gray-400 mt-6">
          Already have an account?{" "}
          <Link to="/login" className="text-MineBlue hover:underline font-semibold">
            Login
          </Link>
        </p>
      </div>
    </div>
  );
}
