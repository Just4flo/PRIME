import { useEffect, useState } from "react";
import { db } from "@/config/firebase";
import { collection, getDocs, updateDoc, doc } from "firebase/firestore";
import { motion } from "framer-motion";
import { User } from "lucide-react";
import Navbar from "@/components/Navbar";

export default function Members() {
    const [members, setMembers] = useState([]);
    const [loading, setLoading] = useState(true);

    // Fetch data dari Firestore
    useEffect(() => {
        const fetchMembers = async () => {
            try {
                const querySnapshot = await getDocs(collection(db, "members"));
                let data = querySnapshot.docs.map((d) => ({
                    id: d.id,
                    ...d.data(),
                }));
                setMembers(data);
            } catch (error) {
                console.error("Error fetching members:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchMembers();
    }, []);

    // Update performa
    const handleUpdatePerformance = async (id, newPerformance) => {
        try {
            const memberRef = doc(db, "members", id);
            await updateDoc(memberRef, { Status: newPerformance });

            setMembers((prev) =>
                prev.map((m) =>
                    m.id === id ? { ...m, Status: newPerformance } : m
                )
            );
        } catch (error) {
            console.error("Error updating performance:", error);
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-white text-purple-700">
                Loading members...
            </div>
        );
    }

    // Grouping berdasarkan peringkat
    const captains = members.filter((m) => m.Peringkat === "Captain");
    const viceCaptains = members.filter((m) => m.Peringkat === "Vice Captain");
    const others = members.filter(
        (m) => m.Peringkat !== "Captain" && m.Peringkat !== "Vice Captain"
    );
    // Component untuk render group
    const renderGroup = (title, data, center = false) => (
        <div className="border-4 border-purple-700 rounded-2xl p-6 mb-12 relative">
            {/* Judul di tengah atas border */}
            <h3 className="absolute -top-6 left-1/2 transform -translate-x-1/2 bg-white px-4 text-2xl font-extrabold text-purple-700">
                {title}
            </h3>

            <div
                className={`mt-6 gap-8
        ${center
                        ? "flex flex-wrap justify-center"
                        : "flex flex-wrap justify-center sm:grid sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4"}
      `}
            >
                {data.map((member) => (
                    <motion.div
                        key={member.id}
                        whileHover={{ scale: 1.05 }}
                        className="w-full max-w-xs bg-white shadow-lg p-6 rounded-2xl flex flex-col items-center text-center transition-transform duration-300 border-2 border-purple-300 h-80"
                    >
                        <User size={50} className="text-purple-500 mb-4 flex-shrink-0" />
                        <h3 className="text-xl font-bold mb-1 text-black truncate w-full">
                            {member.Username}
                        </h3>

                        {/* Peringkat */}
                        {member.Peringkat && (
                            <p
                                className={`text-sm font-extrabold mb-2 px-3 py-1 rounded-full 
                ${member.Peringkat === "Captain"
                                        ? "bg-red-100 text-red-600"
                                        : "bg-blue-100 text-blue-600"}
              `}
                            >
                                {member.Peringkat}
                            </p>
                        )}
                        <p className="text-purple-700 mb-4 break-words">
                            ID Game: {member.ID}
                        </p>
                        {/* Performance Indicator */}
                        <span
                            className={`px-4 py-2 rounded-full text-sm font-bold mt-auto
              ${member.Status === "Good"
                                    ? "bg-green-500 text-white"
                                    : member.Status === "Warning"
                                        ? "bg-yellow-400 text-black"
                                        : "bg-red-600 text-white"}
            `}
                        >
                            {member.Status}
                        </span>
                    </motion.div>
                ))}
            </div>
        </div>
    );

    return (
        <div className="min-h-screen bg-white text-black">
            <Navbar />
            <div className="container mx-auto px-4 py-16">
                <motion.h1
                    initial={{ opacity: 0, y: -50 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 1 }}
                    className="text-4xl md:text-6xl font-extrabold text-center mb-16 text-purple-700"
                >
                    Member List
                </motion.h1>

                {/* Border Sections */}
                {captains.length > 0 && renderGroup("Captain", captains, true)}
                {viceCaptains.length > 0 &&
                    renderGroup("Vice Captain", viceCaptains, true)}
                {others.length > 0 && renderGroup("Members", others, false)}

                {members.length > 20 && (
                    <p className="text-center mt-10 text-purple-700 text-sm">
                        Menampilkan {members.length} members
                    </p>
                )}
            </div>
        </div>
    );
}
