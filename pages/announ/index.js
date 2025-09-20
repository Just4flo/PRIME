// pages/announcement.js
import { useEffect, useState } from "react";
import Navbar from "@/components/Navbar";
import { motion } from "framer-motion";
import { Bell, ImageOff } from "lucide-react";
import { db } from "@/config/firebase";
import { collection, getDocs, query, orderBy } from "firebase/firestore";

export default function Announcement() {
    const [announcements, setAnnouncements] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchAnnouncements = async () => {
            setLoading(true);
            try {
                const q = query(collection(db, "pengumuman"), orderBy("createdAt", "desc"));
                const querySnapshot = await getDocs(q);
                const data = querySnapshot.docs.map((doc) => ({
                    id: doc.id,
                    ...doc.data(),
                }));
                setAnnouncements(data);
            } catch (error) {
                console.error("Error fetching announcements:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchAnnouncements();
    }, []);

    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: {
                staggerChildren: 0.15,
            },
        },
    };

    const itemVariants = {
        hidden: { y: 20, opacity: 0 },
        visible: {
            y: 0,
            opacity: 1,
            transition: {
                duration: 0.6,
            },
        },
    };

    return (
        <div className="min-h-screen w-full bg-gray-50 text-black flex flex-col">
            <Navbar />

            <main className="flex-1 w-full px-4 py-16 md:px-8 md:py-20">
                <div className="w-full max-w-7xl mx-auto">
                    <motion.h1
                        initial={{ opacity: 0, y: -50 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8, type: "spring" }}
                        className="text-4xl md:text-6xl font-extrabold text-center mb-12 text-gray-800"
                    >
                        <Bell className="inline-block mr-4 text-purple-600 drop-shadow-lg" size={50} />
                        Announcements
                    </motion.h1>

                    {loading ? (
                        <p className="text-center text-gray-500 text-lg">Memuat pengumuman...</p>
                    ) : announcements.length > 0 ? (
                        <motion.div
                            variants={containerVariants}
                            initial="hidden"
                            animate="visible"
                            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
                        >
                            {announcements.map((item) => (
                                <motion.div
                                    key={item.id}
                                    variants={itemVariants}
                                    whileHover={{ y: -8, scale: 1.03 }}
                                    className="bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 overflow-hidden flex flex-col group"
                                >
                                    {/* Gambar Pengumuman */}
                                    {item.imageUrl ? (
                                        // --- PERUBAHAN DI SINI ---
                                        // Kontainer tidak lagi memiliki tinggi tetap (h-56 dihapus)
                                        <div className="w-full">
                                            <img
                                                src={item.imageUrl}
                                                alt={item.judul}
                                                // --- PERUBAHAN DI SINI ---
                                                // h-full dihapus agar tinggi gambar alami
                                                className="w-full object-cover group-hover:scale-105 transition-transform duration-500"
                                            />
                                        </div>
                                    ) : (
                                        <div className="w-full h-56 bg-gray-200 flex items-center justify-center">
                                            <ImageOff className="text-gray-400" size={40} />
                                        </div>
                                    )}

                                    {/* Konten Teks */}
                                    <div className="p-6 flex-1 flex flex-col">
                                        <h3 className="text-2xl font-bold mb-3 text-gray-800">
                                            {item.judul || "Tanpa Judul"}
                                        </h3>
                                        <div className="text-gray-600 text-base leading-relaxed space-y-2 flex-1">
                                            {item.deskripsi?.split("\n").map((line, i) => (
                                                <p key={i}>{line}</p>
                                            ))}
                                        </div>
                                    </div>
                                </motion.div>
                            ))}
                        </motion.div>
                    ) : (
                        <p className="text-center text-gray-500 text-lg mt-10">
                            Belum ada pengumuman yang tersedia saat ini.
                        </p>
                    )}
                </div>
            </main>
        </div>
    );
}