import { Link, useNavigate } from "react-router-dom";
import { useState } from "react";

export default function LoginPage() {
    const navigate = useNavigate();

    const [form, setForm] = useState({
        email: "",
        password: "",
    });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setForm({
            ...form,
            [e.target.name]: e.target.value,
        });
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        console.log(form);

        // login success
        navigate("/");
    };

    return (
        <div className="flex items-center justify-center min-h-screen bg-gray-100">
            <form
                onSubmit={handleSubmit}
                className="w-full max-w-md p-8 bg-white rounded-2xl shadow-lg"
            >
                <h1 className="mb-6 text-3xl font-bold text-center">
                    Login
                </h1>

                <div className="mb-4">
                    <label className="block mb-2 text-sm font-medium">
                        Email
                    </label>

                    <input
                        type="email"
                        name="email"
                        value={form.email}
                        onChange={handleChange}
                        placeholder="Enter your email"
                        className="w-full px-4 py-3 border rounded-lg outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                </div>

                <div className="mb-6">
                    <label className="block mb-2 text-sm font-medium">
                        Password
                    </label>

                    <input
                        type="password"
                        name="password"
                        value={form.password}
                        onChange={handleChange}
                        placeholder="Enter your password"
                        className="w-full px-4 py-3 border rounded-lg outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                </div>

                <button
                    type="submit"
                    className="w-full py-3 text-white transition bg-indigo-600 rounded-lg hover:bg-indigo-700"
                >
                    Login
                </button>

                <p className="mt-4 text-sm text-center text-gray-500">
                    Back to{" "}
                    <Link
                        to="/"
                        className="font-semibold text-indigo-600 hover:underline"
                    >
                        Home
                    </Link>
                </p>
            </form>
        </div>
    );
}