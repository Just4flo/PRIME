import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import { app } from "@/config/firebase";

const auth = getAuth(app);

export default function ProtectedRoute({ children }) {
    const [loading, setLoading] = useState(true);
    const router = useRouter();

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, (user) => {
            if (!user) {
                router.replace("/login"); // redirect ke login jika belum login
            } else {
                setLoading(false); // user sudah login
            }
        });

        return () => unsubscribe();
    }, [router]);

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen text-purple-700 font-bold">
                Memeriksa login...
            </div>
        );
    }

    return <>{children}</>;
}
