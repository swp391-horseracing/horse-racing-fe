import React, { useState } from "react";
import { AuthService } from "../services/authService.ts";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const { login } = AuthService;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setError("");
      const user = await login(email, password);
      console.log("Đăng nhập thành công, user dữ liệu:", user);
    } catch (err: any) {
      setError(
        err.response?.data?.message || "Email hoặc mật khẩu không chính xác."
      );
    }
  };

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-200 flex items-center justify-center font-sans antialiased">
      <div className="w-full max-w-[1048px] min-h-[500px] bg-zinc-900 rounded-3xl p-10 flex flex-col md:flex-row justify-between box-border shadow-2xl">
        <div className="flex flex-col justify-between flex-1 pb-8 md:pb-0">
          <div>
            <h1 className="text-[40px] font-normal text-white leading-tight mb-4">
              Sign in
            </h1>
          </div>
        </div>

        <div className="flex flex-col justify-between flex-1 max-w-[448px] w-full pt-4">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="relative group">
              <input
                type="text"
                id="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder=" "
                className="w-full bg-transparent border border-zinc-500 rounded-md px-4 py-4 text-base text-white focus:outline-none focus:border-sky-400 focus:ring-1 focus:ring-sky-400 transition-all peer"
              />

              <label className="absolute left-4 top-4 text-zinc-400 text-base transition-all duration-200 transform -translate-y-1/2 scale-75 top-2 z-10 origin-[0] bg-zinc-900 px-1 peer-placeholder-shown:scale-100 peer-placeholder-shown:top-1/2 peer-focus:top-2 peer-focus:scale-75 peer-focus:text-sky-400">
                Email
              </label>
            </div>
            <div className="relative group">
              <input
                type="text"
                id="email"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder=" "
                className="w-full bg-transparent border border-zinc-500 rounded-md px-4 py-4 text-base text-white focus:outline-none focus:border-sky-400 focus:ring-1 focus:ring-sky-400 transition-all peer"
              />

              <label className="absolute left-4 top-4 text-zinc-400 text-base transition-all duration-200 transform -translate-y-1/2 scale-75 top-2 z-10 origin-[0] bg-zinc-900 px-1 peer-placeholder-shown:scale-100 peer-placeholder-shown:top-1/2 peer-focus:top-2 peer-focus:scale-75 peer-focus:text-sky-400">
                Password
              </label>
            </div>

            {error && <p className="text-red-400 text-sm">{error}</p>}

            <div className="flex items-center justify-between pt-8">
              <a className="text-sky-400 font-medium text-sm hover:underline">
                Create account
              </a>

              <button
                type="submit"
                className="bg-sky-400 text-sky-950 font-semibold px-6 py-2.5 rounded-full hover:bg-sky-300 active:bg-sky-200 transition-colors text-sm"
              >
                login
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
