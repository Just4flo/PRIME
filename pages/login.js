import { useState } from "react";
import { useRouter } from "next/router";
import { signInWithEmailAndPassword, getAuth } from "firebase/auth";
import { app } from "@/config/firebase";
import Navbar from "@/components/Navbar"; // ✅ import Navbar

const auth = getAuth(app);

export default function LoginPage() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const router = useRouter();

    const handleLogin = async (e) => {
        e.preventDefault();
        setError("");

        try {
            await signInWithEmailAndPassword(auth, email, password);
            router.push("/admin");
        } catch (err) {
            setError("Email atau password salah!");
        }
    };

    return (
        <div className="min-h-screen bg-white text-gray-900 flex flex-col">
            {/* Navbar */}
            <Navbar />

            <div className="flex items-center justify-center flex-1 px-4 py-16">
                <div className="bg-purple-50/80 backdrop-blur-md border border-purple-300 rounded-2xl shadow-xl w-full max-w-md p-8">
                    <h1 className="text-3xl font-extrabold text-purple-700 text-center mb-6">
                        Login Admin
                    </h1>

                    {error && (
                        <p className="text-red-500 text-center mb-4">{error}</p>
                    )}

                    <form onSubmit={handleLogin} className="flex flex-col space-y-4">
                        <input
                            type="email"
                            placeholder="Email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="px-4 py-2 rounded-lg border border-purple-300 focus:border-purple-500 focus:ring-2 focus:ring-purple-300 bg-white text-purple-700 placeholder-purple-300 outline-none"
                            required
                        />
                        <input
                            type="password"
                            placeholder="Password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="px-4 py-2 rounded-lg border border-purple-300 focus:border-purple-500 focus:ring-2 focus:ring-purple-300 bg-white text-purple-700 placeholder-purple-300 outline-none"
                            required
                        />
                        <button
                            type="submit"
                            className="bg-purple-600 hover:bg-purple-700 text-white font-bold py-2 rounded-lg transition-all"
                        >
                            Login
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
}
