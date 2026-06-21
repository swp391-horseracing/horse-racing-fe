import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../components/ui/select.tsx";
import { ROUTES } from "../router/routes.tsx";
import * as axios from "axios";
import useAuth from "../hooks/auth/useAuth.ts";
import ReCaptchaPanel from "../components/reCapchaPanel.tsx";

type Mode = "login" | "register";

const roles = [
  {
    text: "Spectator",
    value: "spectator",
  },
  {
    text: "Jockey",
    value: "jockey",
  },
  {
    text: "Horse owner",
    value: "horse_owner",
  },
];

export default function Login() {
  const navigate = useNavigate();
  const [mode, setMode] = useState<Mode>("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [role, setRole] = useState("");
  const [name, setName] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const { login, register } = useAuth();
  const [captchaToken, setCaptchaToken] = useState<string | null>(null);

  const validate = (): string | null => {
    if (!email.trim()) {
      return "Email is required.";
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!emailRegex.test(email)) {
      return "Invalid email format.";
    }

    if (!password.trim()) {
      return "Password is required.";
    }

    if (password.length < 6) {
      return "Password must be at least 6 characters.";
    }

    if (mode === "register") {
      if (!name.trim()) {
        return "Full name is required.";
      }

      const nameRegex = /^[A-Za-z\s]{2,}$/;
      if (!nameRegex.test(name.trim())) {
        return "Full name must contain at least 2 words and no numbers.";
      }

      if (!role) {
        return "Please select a role.";
      }

      if (!confirm.trim()) {
        return "Please confirm your password.";
      }

      if (password !== confirm) {
        return "Passwords do not match.";
      }
    }

    if (!captchaToken) {
      return "Please complete the reCAPTCHA.";
    }

    return null;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    const validationError = validate();

    if (validationError) {
      setError(validationError);
      return;
    }

    if (!captchaToken) {
      setError("Please complete the reCAPTCHA.");
      return;
    }

    try {
      setLoading(true);
      if (mode === "login") {
        await login(email, password, captchaToken);
      } else {
        await register(name, email, password, role, captchaToken);
      }
      navigate(ROUTES.FEED);
    } catch (err: unknown) {
      let errorMessage =
        mode === "login"
          ? "Invalid email or password."
          : "Registration failed.";

      if (axios.isAxiosError(err)) {
        errorMessage = err.response?.data?.message || errorMessage;
      }

      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const switchMode = (next: Mode) => {
    setMode(next);
    setError("");
    setEmail("");
    setPassword("");
    setConfirm("");
    setRole("");
    setName("");
  };

  return (
    <div className="min-h-screen bg-[#F9FAFB] dark:bg-gray-900 flex items-center justify-center px-4">
      <div className="w-full max-w-4xl bg-white dark:bg-gray-800 rounded-3xl shadow-xl flex flex-col md:flex-row overflow-hidden min-h-[520px]">
        <div className="flex-1 bg-[#064E3B] text-white p-10 flex flex-col justify-between">
          <div>
            <p className="flex w-full justify-center items-center text-[#D4AF37] text-xs font-bold tracking-widest uppercase mb-6">
              <span>Horse Racing</span>
              <button
                type="button"
                onClick={() => navigate(ROUTES.HOME)}
                className="ml-auto px-2 py-0.5 rounded-sm bg-green-800 font-medium text-sm hover:bg-green-600 hover:text-white transition-colors"
              >
                Home Page
              </button>
            </p>
            <h1 className="text-4xl font-bold leading-tight mb-4">
              {mode === "login" ? "Welcome back." : "Join the stable."}
            </h1>
            <p className="text-white/60 text-sm leading-relaxed max-w-xs">
              {mode === "login"
                ? "Sign in to manage your horses, races, and performance data."
                : "Create your professional equestrian account and get started today."}
            </p>
          </div>
          <div className="flex gap-2 mt-10">
            {(["login", "register"] as Mode[]).map((m) => (
              <span
                key={m}
                className={`h-1.5 rounded-full transition-all duration-300 ${mode === m ? "w-8 bg-[#D4AF37]" : "w-3 bg-white/30"}`}
              />
            ))}
          </div>
        </div>

        <div className="flex-1 p-10 flex flex-col justify-center w-full">
          <h2
            className="text-2xl font-bold text-gray-900 dark:text-gray-50"
            style={{ marginBottom: 20 }}
          >
            {mode === "login" ? "Sign in" : "Create account"}
          </h2>

          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            {mode === "register" && (
              <FloatingInput
                id="name"
                label="Full Name"
                type="text"
                value={name}
                onChange={setName}
              />
            )}
            <FloatingInput
              id="email"
              label="Email"
              type="text"
              value={email}
              onChange={setEmail}
            />
            <FloatingInput
              id="password"
              label="Password"
              type="password"
              value={password}
              onChange={setPassword}
            />
            {mode === "register" && (
              <FloatingInput
                id="confirm"
                label="Confirm Password"
                type="password"
                value={confirm}
                onChange={setConfirm}
              />
            )}

            {mode === "register" && (
              <Select onValueChange={setRole}>
                <SelectTrigger className="w-full rounded-sm border-1 border-gray-400">
                  <SelectValue placeholder="Select your role" />
                </SelectTrigger>
                <SelectContent className="w-full rounded-sm">
                  <SelectGroup>
                    {roles.map((role) => (
                      <SelectItem
                        className="w-full rounded-sm"
                        key={role.value}
                        value={role.value}
                      >
                        {role.text}
                      </SelectItem>
                    ))}
                  </SelectGroup>
                </SelectContent>
              </Select>
            )}

            <div className="">
              <ReCaptchaPanel onVerify={setCaptchaToken} />
            </div>

            {error && (
              <p className="text-red-500 dark:text-red-400 text-xs">{error}</p>
            )}

            <button
              type="submit"
              disabled={loading}
              className="mt-2 w-full py-3 rounded-xl bg-[#064E3B] text-white font-semibold text-sm hover:bg-[#053d2f] active:bg-[#042e23] transition-colors disabled:opacity-50"
            >
              {loading
                ? "Please wait…"
                : mode === "login"
                  ? "Sign in"
                  : "Create account"}
            </button>

            <p className="text-sm text-gray-400 mb-8">
              {mode === "login"
                ? "Don't have an account? "
                : "Already have an account? "}
              <button
                onClick={() => {
                  switchMode(mode === "login" ? "register" : "login");
                  navigate(ROUTES.REGISTER);
                }}
                className="text-[#064E3B] font-semibold hover:underline"
              >
                {mode === "login" ? "Create account" : "Sign in"}
              </button>
            </p>
          </form>
        </div>
      </div>
    </div>
  );
}

function FloatingInput({
  id,
  label,
  type,
  value,
  onChange,
}: {
  id: string;
  label: string;
  type: string;
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <div className="relative">
      <input
        id={id}
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder=" "
        className="peer w-full bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl px-4 pt-5 pb-2 text-sm text-gray-900 dark:text-gray-100 outline-none focus:border-[#064E3B] focus:ring-1 focus:ring-[#064E3B] transition-all"
      />
      <label className="absolute left-4 top-3.5 text-xs text-gray-400 transition-all duration-200 peer-placeholder-shown:top-3.5 peer-placeholder-shown:text-sm peer-focus:top-1.5 peer-focus:text-[10px] peer-focus:text-[#064E3B] peer-not-placeholder-shown:top-1.5 peer-not-placeholder-shown:text-[10px]">
        {label}
      </label>
    </div>
  );
}
