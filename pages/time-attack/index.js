import { motion } from "framer-motion";
import Navbar from "@/components/Navbar";
import Link from "next/link";

export default function TimeAttackHome() {
    const timeAttackGroups = [
        {
            id: 1,
            title: "PRIME",
            image: "/download (3).jpeg",
            slug: "prime",
        },
        {
            id: 2,
            title: "PRIME ID",
            image: "/pc wallpaper.jpeg",
            slug: "prime_id",
        },
    ];

    return (
        <div className="min-h-screen bg-white text-black border-4 border-purple-700">
            <Navbar />
            <div className="container mx-auto px-4 py-16">
                <motion.h1
                    initial={{ opacity: 0, y: -50 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 1 }}
                    className="text-4xl md:text-6xl font-extrabold text-center mb-12 text-purple-700"
                >
                    Time Attack
                </motion.h1>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
                    {timeAttackGroups.map((group) => (
                        // Arahkan ke halaman Time Attack dinamis, misal /time-attack/prime
                        <Link key={group.id} href={`/time-attack/${group.slug}`} passHref>
                            <motion.div
                                whileHover={{ scale: 1.03 }}
                                className="border-4 border-purple-700 rounded-2xl overflow-hidden shadow-lg cursor-pointer transition-all"
                            >
                                <img
                                    src={group.image}
                                    alt={group.title}
                                    className="w-full h-48 object-cover"
                                />
                                <div className="p-4 bg-white">
                                    <h3 className="text-xl font-bold text-purple-700">{group.title}</h3>
                                </div>
                            </motion.div>
                        </Link>
                    ))}
                </div>
            </div>
        </div>
    );
}