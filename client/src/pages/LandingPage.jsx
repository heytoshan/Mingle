import React from "react";
import { Link } from "react-router-dom";
import { useTheme } from "../context/ThemeContext";
import {
  Sun, Moon, MessageCircle, Zap, Shield, Users,
  ArrowRight, Github, Hash, Send
} from "lucide-react";

const features = [
  {
    icon: <Zap size={22} />,
    color: "text-MineBlue",
    bg: "bg-MineBlue/10 dark:bg-MineBlue/20",
    title: "Real-Time Messaging",
    description:
      "Instant message delivery powered by WebSockets. No delays, no refreshing — pure, seamless communication.",
  },
  {
    icon: <Shield size={22} />,
    color: "text-MinePink",
    bg: "bg-MinePink/10 dark:bg-MinePink/20",
    title: "Secure Authentication",
    description:
      "JWT-based auth with OTP email verification ensures your account and conversations stay protected.",
  },
  {
    icon: <Users size={22} />,
    color: "text-MineYellow",
    bg: "bg-MineYellow/10 dark:bg-MineYellow/20",
    title: "Groups & Direct Messages",
    description:
      "Create group chat rooms for your team or have private one-on-one conversations — all in one place.",
  },
];

const mockMessages = [
  { from: "Alice", text: "Hey! Did you see the new update? 🚀", time: "2:01 PM", isMe: false },
  { from: "Me", text: "Yes! It looks absolutely amazing 🔥", time: "2:02 PM", isMe: true },
  { from: "Alice", text: "Real-time is so smooth now!", time: "2:03 PM", isMe: false },
];

export default function LandingPage() {
  const { isDark, toggleTheme } = useTheme();

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-DarkIndigo transition-colors duration-300">

      {/* ── Navbar ── */}
      <nav className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-6 md:px-14 py-4 bg-white/80 dark:bg-[#0b0c15]/80 backdrop-blur-xl border-b border-gray-200/60 dark:border-gray-800/50">
        <Link to="/" className="flex items-center space-x-2">
          <MessageCircle size={22} className="text-MineBlue" />
          <span className="text-lg font-bold bg-gradient-to-r from-MineBlue via-MinePink to-MineYellow bg-clip-text text-transparent">
            Mingle
          </span>
        </Link>

        <div className="flex items-center gap-3">
          {/* Theme Toggle */}
          <button
            onClick={toggleTheme}
            className="p-2 rounded-lg bg-gray-100 hover:bg-gray-200 dark:bg-white/10 dark:hover:bg-white/20 transition-all duration-200"
            title={isDark ? "Switch to Light Mode" : "Switch to Dark Mode"}
          >
            {isDark
              ? <Sun size={17} className="text-MineYellow" />
              : <Moon size={17} className="text-MineBlue" />
            }
          </button>

          <Link
            to="/login"
            className="hidden sm:inline-flex px-4 py-2 text-sm font-medium border border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:border-MineBlue dark:hover:border-MineBlue hover:text-MineBlue transition-all"
          >
            Login
          </Link>

          <Link
            to="/signup"
            className="inline-flex items-center gap-1.5 px-4 py-2 text-sm font-semibold text-white rounded-lg bg-gradient-to-r from-MineBlue to-MinePink hover:opacity-90 transition-opacity shadow-lg shadow-MineBlue/20"
          >
            Get Started <ArrowRight size={14} />
          </Link>
        </div>
      </nav>

      {/* ── Hero ── */}
      <section className="relative pt-36 pb-24 px-6 md:px-14 flex flex-col items-center text-center overflow-hidden">
        {/* Decorative blobs */}
        <div className="absolute top-24 left-1/3 w-80 h-80 bg-MineBlue/10 dark:bg-MineBlue/15 rounded-full blur-3xl -z-10 animate-float" />
        <div className="absolute top-48 right-1/4 w-64 h-64 bg-MinePink/10 dark:bg-MinePink/15 rounded-full blur-3xl -z-10 animate-float-delay" />
        <div className="absolute bottom-0 left-1/4 w-56 h-56 bg-MineYellow/5 dark:bg-MineYellow/10 rounded-full blur-3xl -z-10" />

        {/* Badge */}
        <div className="animate-fade-in inline-flex items-center gap-2 px-4 py-1.5 mb-8 text-xs font-semibold text-MineBlue bg-MineBlue/10 dark:bg-MineBlue/20 border border-MineBlue/30 rounded-full">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-MineBlue opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-MineBlue"></span>
          </span>
          Real-time chat, reimagined for MERN
        </div>

        {/* Headline */}
        <h1 className="animate-fade-in text-5xl sm:text-6xl md:text-7xl font-black leading-tight mb-6 text-gray-900 dark:text-white tracking-tight">
          Connect.{" "}
          <span className="bg-gradient-to-r from-MineBlue via-MinePink to-MineYellow bg-clip-text text-transparent">
            Chat.
          </span>
          <br />
          Mingle.
        </h1>

        <p className="animate-fade-in max-w-lg text-lg text-gray-600 dark:text-gray-400 mb-10 leading-relaxed">
          A modern real-time chat app with WebSocket-powered messaging, group rooms, direct messages, and a stunning UI — built for people who love to connect.
        </p>

        {/* CTAs */}
        <div className="animate-fade-in flex flex-col sm:flex-row items-center gap-4 mb-20">
          <Link
            to="/signup"
            className="inline-flex items-center gap-2 px-8 py-4 text-base font-bold text-white rounded-2xl bg-gradient-to-r from-MineBlue via-MinePink to-MineDarkYellow hover:opacity-90 hover:scale-105 active:scale-95 transition-all duration-200 shadow-2xl shadow-MineBlue/30"
          >
            Start for Free <ArrowRight size={20} />
          </Link>
          <Link
            to="/login"
            className="inline-flex items-center gap-2 px-8 py-4 text-base font-semibold rounded-2xl border-2 border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:border-MineBlue dark:hover:border-MineBlue hover:text-MineBlue dark:hover:text-MineBlue transition-all duration-200"
          >
            Sign In
          </Link>
        </div>

        {/* Mock Chat Preview */}
        <div className="w-full max-w-md animate-fade-in">
          <div className="rounded-2xl overflow-hidden border border-gray-200 dark:border-gray-800/80 shadow-2xl shadow-gray-200/50 dark:shadow-black/50 bg-white dark:bg-white/5 backdrop-blur-sm">
            {/* Chat Header */}
            <div className="px-4 py-3 bg-gray-100 dark:bg-white/5 border-b border-gray-200 dark:border-gray-800/50 flex items-center gap-3">
              <div className="relative">
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-MineBlue to-MinePink flex items-center justify-center text-white text-xs font-bold">A</div>
                <div className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 bg-green-400 rounded-full border-2 border-white dark:border-[#0b0c15]" />
              </div>
              <div className="text-left">
                <p className="text-sm font-semibold text-gray-900 dark:text-white">Alice</p>
                <p className="text-xs text-green-500">Online</p>
              </div>
            </div>
            {/* Messages */}
            <div className="p-4 space-y-3 bg-white dark:bg-transparent">
              {mockMessages.map((msg, i) => (
                <div key={i} className={`flex ${msg.isMe ? "justify-end" : "justify-start"}`}>
                  <div className={`max-w-[75%] px-3.5 py-2.5 rounded-2xl text-sm ${
                    msg.isMe
                      ? "bg-MineBlue text-white rounded-br-none"
                      : "bg-gray-100 dark:bg-white/10 text-gray-800 dark:text-gray-200 rounded-bl-none"
                  }`}>
                    <p>{msg.text}</p>
                    <p className={`text-[10px] mt-1 ${msg.isMe ? "text-blue-200" : "text-gray-400"}`}>{msg.time}</p>
                  </div>
                </div>
              ))}
            </div>
            {/* Input bar */}
            <div className="px-4 py-3 border-t border-gray-200 dark:border-gray-800/50 bg-white dark:bg-white/5 flex items-center gap-2">
              <div className="flex-1 bg-gray-100 dark:bg-white/10 rounded-xl px-3 py-2 text-sm text-gray-400">Type a message...</div>
              <div className="p-2 rounded-xl bg-gradient-to-r from-MineBlue to-MinePink text-white">
                <Send size={14} />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Features ── */}
      <section className="py-24 px-6 md:px-14">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-14">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4">
              Everything you need to{" "}
              <span className="bg-gradient-to-r from-MineBlue to-MinePink bg-clip-text text-transparent">
                stay connected
              </span>
            </h2>
            <p className="text-gray-600 dark:text-gray-400 max-w-md mx-auto">
              Mingle combines cutting-edge real-time technology with a premium experience that feels effortless.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {features.map((f, i) => (
              <div
                key={i}
                className="p-6 rounded-2xl bg-white dark:bg-white/5 border border-gray-200 dark:border-gray-800/50 hover:border-MineBlue/50 dark:hover:border-MineBlue/50 hover:-translate-y-1.5 transition-all duration-300 group"
              >
                <div className={`w-11 h-11 rounded-xl ${f.bg} flex items-center justify-center mb-5 ${f.color} group-hover:scale-110 transition-transform`}>
                  {f.icon}
                </div>
                <h3 className="text-base font-bold text-gray-900 dark:text-white mb-2">{f.title}</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">{f.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA Banner ── */}
      <section className="py-20 px-6 md:px-14">
        <div className="max-w-3xl mx-auto text-center rounded-3xl p-12 bg-gradient-to-br from-MineBlue/5 via-MinePink/5 to-MineYellow/5 dark:from-MineBlue/10 dark:via-MinePink/10 dark:to-MineYellow/10 border border-gray-200 dark:border-gray-800/50">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-br from-MineBlue to-MinePink mb-6">
            <MessageCircle size={26} className="text-white" />
          </div>
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4">
            Ready to start mingling?
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mb-8 max-w-sm mx-auto">
            Join and experience real-time communication that feels instant and natural.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              to="/signup"
              className="inline-flex items-center gap-2 px-8 py-3.5 text-base font-bold text-white rounded-xl bg-gradient-to-r from-MineBlue to-MinePink hover:opacity-90 hover:scale-105 transition-all"
            >
              Create Free Account <ArrowRight size={18} />
            </Link>
            <Link
              to="/login"
              className="inline-flex items-center gap-1 text-base font-medium text-gray-600 dark:text-gray-400 hover:text-MineBlue dark:hover:text-MineBlue transition-colors"
            >
              Already have an account? Login →
            </Link>
          </div>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer className="py-8 px-6 md:px-14 border-t border-gray-200 dark:border-gray-800/50">
        <div className="max-w-5xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <Link to="/" className="flex items-center space-x-2">
            <MessageCircle size={18} className="text-MineBlue" />
            <span className="text-sm font-bold bg-gradient-to-r from-MineBlue via-MinePink to-MineYellow bg-clip-text text-transparent">
              Mingle
            </span>
          </Link>
          <p className="text-xs text-gray-400 dark:text-gray-600">
            Built with ❤️ — MERN Stack + WebSockets
          </p>
          <a
            href="https://github.com/heytoshan/Chat-App"
            target="_blank"
            rel="noreferrer"
            className="flex items-center gap-2 text-xs text-gray-500 hover:text-gray-900 dark:hover:text-white transition-colors"
          >
            <Github size={14} />
            heytoshan/Chat-App
          </a>
        </div>
      </footer>
    </div>
  );
}
