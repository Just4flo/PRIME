import Navbar from "@/components/Navbar";
import { motion } from "framer-motion";

export default function Prestasi() {
    // Array gambar prestasi dari folder public
    const prestasiImages = [
        "/prestasi/prestasi1.jpg",
        "/prestasi/prestasi2.jpg",
        "/prestasi/prestasi3.jpg",
        "/prestasi/prestasi4.jpg",
        "/prestasi/prestasi5.jpg",
    ];

    return (
        <div className="min-h-screen w-full bg-white text-black flex flex-col">
            <Navbar />

            <div className="flex-1 w-full px-4 py-16 md:px-8 md:py-20">
                {/* Header */}
                <motion.h1
                    initial={{ opacity: 0, y: -50 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 1 }}
                    className="text-4xl md:text-6xl font-extrabold text-center mb-6 drop-shadow-md text-purple-700"
                >
                    Prestasi <span className="text-purple-500">Tim</span>
                </motion.h1>

                <motion.p
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.5, duration: 1 }}
                    className="max-w-3xl mx-auto text-center text-lg md:text-xl leading-relaxed mb-12 text-gray-700"
                >
                    Berikut beberapa prestasi yang telah kami raih di berbagai turnamen dan kompetisi esports.
                </motion.p>

                {/* Grid Gambar Prestasi */}
                <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-8 max-w-7xl mx-auto w-full">
                    {prestasiImages.map((src, idx) => (
                        <motion.div
                            key={idx}
                            whileHover={{ scale: 1.05, y: -5 }}
                            className="bg-purple-50 rounded-2xl shadow-lg overflow-hidden cursor-pointer transition-all"
                        >
                            <img
                                src={src}
                                alt={`Prestasi ${idx + 1}`}
                                className="w-full h-64 object-cover"
                            />
                            <div className="p-4 text-center">
                                <h3 className="text-xl font-bold text-purple-800">
                                    Prestasi {idx + 1}
                                </h3>
                            </div>
                        </motion.div>
                    ))}
                </div>
            </div>
        </div>
    );
}
