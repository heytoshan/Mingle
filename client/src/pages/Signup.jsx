import React, { useState } from "react";
import axios from "axios";
import toast from "react-hot-toast";
import { useNavigate, Link } from "react-router-dom";

export default function Signup() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    email: "",
    username: "",
    firstName: "",
    lastName: "",
    password: "",
    otp: ""
  });
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleSendOtp = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    const toastId = toast.loading("Sending OTP...");
    try {
      await axios.post("/api/auth/otp", { email: formData.email });
      toast.success("OTP Sent to your email!", { id: toastId });
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
    const toastId = toast.loading("Creating Account...");
    try {
      await axios.post("/api/auth/signup", formData);
      toast.success("Account Created! Please login.", { id: toastId });
      navigate("/login");
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to create account", { id: toastId });
    } finally {
      setIsLoading(false);
    }
  };

  const inputClass = "bg-white/5 border border-gray-700 text-white placeholder-gray-500 text-sm rounded-lg focus:ring-MineBlue focus:border-MineBlue block w-full px-4 py-3 focus:outline-none";
  const labelClass = "block mb-2 text-sm font-medium text-gray-300";

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-6 py-8 bg-DarkIndigo">
      <p className="mb-6 text-2xl font-semibold bg-gradient-to-r from-MineBlue via-MinePink to-MineYellow bg-clip-text text-transparent text-center">
        One Click Away from Greatness
      </p>
      <div className="w-full max-w-md bg-white/5 border border-gray-800/30 rounded-2xl p-8 space-y-6 backdrop-blur-sm">
        <h1 className="text-2xl font-bold text-white">
          {isDialogOpen ? "Verify Your Email" : "Create an Account"}
        </h1>

        {!isDialogOpen ? (
          <form onSubmit={handleSendOtp} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className={labelClass}>First Name</label>
                <input type="text" className={inputClass} placeholder="John" value={formData.firstName} onChange={(e) => setFormData({ ...formData, firstName: e.target.value })} required />
              </div>
              <div>
                <label className={labelClass}>Last Name</label>
                <input type="text" className={inputClass} placeholder="Doe" value={formData.lastName} onChange={(e) => setFormData({ ...formData, lastName: e.target.value })} />
              </div>
            </div>
            <div>
              <label className={labelClass}>Username</label>
              <input type="text" className={inputClass} placeholder="johndoe" value={formData.username} onChange={(e) => setFormData({ ...formData, username: e.target.value })} required />
            </div>
            <div>
              <label className={labelClass}>Email</label>
              <input type="email" className={inputClass} placeholder="name@company.com" value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} required />
            </div>
            <div>
              <label className={labelClass}>Password</label>
              <input type="password" className={inputClass} placeholder="••••••••" value={formData.password} onChange={(e) => setFormData({ ...formData, password: e.target.value })} required />
            </div>
            <button type="submit" disabled={isLoading} className="w-full font-semibold rounded-xl px-5 py-3 bg-gradient-to-r from-MineBlue via-MinePink to-MineDarkYellow text-white hover:opacity-90 transition-opacity disabled:opacity-50">
              {isLoading ? "Sending..." : "Verify Email & Continue"}
            </button>
          </form>
        ) : (
          <form onSubmit={handleSignup} className="space-y-4">
            <p className="text-gray-400 text-sm text-center">We sent a 4-digit OTP to <span className="text-white font-medium">{formData.email}</span></p>
            <div>
              <label className={`${labelClass} text-center`}>Enter OTP</label>
              <input type="text" maxLength={4} className={`${inputClass} text-center text-2xl tracking-[0.5em] font-bold`} value={formData.otp} onChange={(e) => setFormData({ ...formData, otp: e.target.value })} required />
            </div>
            <button type="submit" disabled={isLoading} className="w-full font-semibold rounded-xl px-5 py-3 bg-green-600 hover:bg-green-500 text-white transition-colors disabled:opacity-50">
              {isLoading ? "Creating..." : "Create Account"}
            </button>
            <button type="button" onClick={() => setIsDialogOpen(false)} className="w-full text-sm text-gray-500 hover:text-gray-300 transition-colors">
              ← Go back
            </button>
          </form>
        )}
        <p className="text-sm font-light text-gray-400">
          Already have an account?{" "}
          <Link to="/login" className="text-MineBlue hover:underline font-medium">Login</Link>
        </p>
      </div>
    </div>
  );
}
