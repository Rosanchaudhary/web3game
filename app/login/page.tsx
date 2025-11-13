"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      if (!res.ok) throw new Error("Login failed");

      const data = await res.json();
      localStorage.setItem("token", data.token);

      router.push("/dashboard"); // redirect after login
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen flex flex-col items-center justify-center px-6 overflow-hidden text-center">
      {/* Gradient background effects */}
      <div className="absolute top-0 left-0 w-full h-full bg-linear-to-b from-indigo-900/40 via-black/80 to-black -z-10" />
      <div className="absolute -top-40 right-40 w-[400px] h-[400px] bg-indigo-500/30 rounded-full blur-3xl -z-10" />
      <div className="absolute -bottom-40 left-40 w-[400px] h-[400px] bg-purple-500/30 rounded-full blur-3xl -z-10" />

      <motion.div
        initial={{ opacity: 0, y: 25 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-3xl p-10 w-full max-w-md text-left shadow-xl"
      >
        <h2 className="text-4xl font-extrabold text-transparent bg-clip-text bg-linear-to-r from-indigo-400 to-purple-400 mb-8 text-center">
          Welcome Back 👋
        </h2>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-gray-300 text-sm mb-2">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full p-3 rounded-xl bg-white/10 border border-white/20 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              placeholder="Enter your email"
            />
          </div>

          <div>
            <label className="block text-gray-300 text-sm mb-2">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full p-3 rounded-xl bg-white/10 border border-white/20 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              placeholder="Enter your password"
            />
          </div>

          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            type="submit"
            className="w-full mt-4 bg-linear-to-r from-indigo-600 to-purple-600 text-white py-3 rounded-xl shadow-lg hover:shadow-indigo-500/30 transition"
          >
            Log In
          </motion.button>
        </form>

        <p className="text-gray-400 text-sm mt-6 text-center">
          Don’t have an account?{" "}
          <Link
            href="/register"
            className="text-indigo-400 hover:text-indigo-300 font-medium"
          >
            Register
          </Link>
        </p>
      </motion.div>
    </div>
  );
}
