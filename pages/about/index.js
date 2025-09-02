import Navbar from "@/components/Navbar";
import { motion } from "framer-motion";
import { Users, Target, Gamepad2, Trophy } from "lucide-react";
import { useRouter } from "next/router";

export default function About() {
    const router = useRouter(); // router Next.js

    return (
        <div className="min-h-screen w-full bg-white text-black flex flex-col">
            <Navbar />

            <div className="flex-1 w-full px-4 py-16 md:px-8 md:py-20">
                {/* Judul Animasi */}
                <motion.h1
                    initial={{ opacity: 0, y: -50 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 1 }}
                    className="text-4xl md:text-6xl font-extrabold text-center mb-6 drop-shadow-md text-purple-700"
                >
                    About <span className="text-purple-500">Us</span>
                </motion.h1>

                <motion.p
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.5, duration: 1 }}
                    className="max-w-3xl mx-auto text-center text-lg md:text-xl leading-relaxed mb-12 text-gray-700"
                >
                    Kami adalah komunitas gamer yang berdedikasi untuk mengembangkan skill,
                    menjalin persahabatan, dan menorehkan prestasi di dunia esports.
                    Dengan semangat kebersamaan, kami terus berjuang untuk menjadi tim yang
                    solid, kreatif, dan berprestasi.
                </motion.p>

                {/* Grid Info */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto w-full mb-12">
                    {[
                        {
                            icon: Users,
                            title: "Komunitas",
                            desc: "Lebih dari sekedar tim, kami adalah keluarga gamer yang saling mendukung."
                        },
                        {
                            icon: Target,
                            title: "Misi",
                            desc: "Menjadi tim esports dengan strategi kreatif dan kemampuan terbaik."
                        },
                        {
                            icon: Trophy,
                            title: "Prestasi",
                            desc: "Berpartisipasi di berbagai turnamen dan mengukir kemenangan bersama.",
                            link: "/about/prestasi" // tambahkan link
                        }
                    ].map((card, idx) => {
                        const Icon = card.icon;
                        return (
                            <motion.div
                                key={idx}
                                whileHover={{ scale: 1.05 }}
                                className={`bg-purple-50 p-6 rounded-2xl shadow-lg flex flex-col items-center text-center transition-all cursor-pointer ${card.link ? "hover:bg-purple-100" : ""
                                    }`}
                                onClick={() => card.link && router.push(card.link)}
                            >
                                <Icon size={50} className="text-purple-700 mb-4" />
                                <h3 className="text-2xl font-bold mb-2 text-purple-800">{card.title}</h3>
                                <p className="text-gray-700">{card.desc}</p>
                            </motion.div>
                        );
                    })}
                </div>

                {/* Section Tambahan */}
                <motion.div
                    initial={{ opacity: 0, y: 50 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 1, duration: 1 }}
                    className="mt-16 bg-purple-50 rounded-2xl shadow-xl p-10 max-w-5xl mx-auto text-center"
                >
                    <Gamepad2 size={60} className="text-purple-700 mx-auto mb-4" />
                    <h2 className="text-3xl md:text-4xl font-extrabold mb-4 text-purple-800">Kenapa Bergabung Dengan Kami?</h2>
                    <p className="text-gray-700 text-lg md:text-xl leading-relaxed">
                        Karena di sini kamu tidak hanya bermain game, tapi juga membangun
                        hubungan, mengasah strategi, dan merasakan pengalaman esports yang sesungguhnya.
                    </p>
                </motion.div>
            </div>
        </div>
    );
}