import { useEffect, useState } from "react";
import { db } from "@/config/firebase";
import {
    collection,
    getDocs,
    addDoc,
    query,
    orderBy,
    limit,
    onSnapshot,
    where,
    doc,
    updateDoc,
} from "firebase/firestore";
import { Trophy } from "lucide-react";
import Navbar from "@/components/Navbar";
import { v4 as uuidv4 } from "uuid";

export default function TeamAttack() {
    const [members, setMembers] = useState([]);
    const [times, setTimes] = useState({});
    const [leaderboard, setLeaderboard] = useState([]);
    const [search, setSearch] = useState("");
    const [session, setSession] = useState(null); // 🔹 Data session aktif

    // Ambil daftar members
    useEffect(() => {
        const fetchMembers = async () => {
            try {
                const snapshot = await getDocs(collection(db, "members"));
                const data = snapshot.docs.map((d) => ({
                    id: d.id,
                    Username: d.data().Username,
                }));
                setMembers(data);
            } catch (error) {
                console.error("Error fetching members:", error);
            }
        };
        fetchMembers();
    }, []);

    const fetchSession = async () => {
        try {
            const snapshot = await getDocs(collection(db, "team_attack_sessions"));
            if (!snapshot.empty) {
                const docData = snapshot.docs[0].data(); // ambil sesi aktif pertama
                setSession({
                    id: snapshot.docs[0].id,
                    ...docData,
                });
            }
        } catch (error) {
            console.error("Error ambil session:", error);
        }
    };

    // 🔹 Ambil session saat pertama render
    useEffect(() => {
        fetchSession();
    }, []);

    // Leaderboard realtime (10 besar)
    useEffect(() => {
        const q = query(collection(db, "team_attack"), orderBy("time", "asc"), limit(10));
        const unsubscribe = onSnapshot(q, (snapshot) => {
            const data = snapshot.docs.map((d) => d.data());
            setLeaderboard(data);
        });
        return () => unsubscribe();
    }, []);

    // Konversi "MM:SS.mmm" ke total milidetik
    const timeStringToMs = (timeStr) => {
        const regex = /^(\d{2}):(\d{2})\.(\d{3})$/;
        const match = timeStr.match(regex);
        if (!match) return NaN;
        const [, mm, ss, ms] = match.map(Number);
        return mm * 60000 + ss * 1000 + ms;
    };

    // Konversi total milidetik ke "MM:SS.mmm"
    const msToTimeString = (totalMs) => {
        const mm = Math.floor(totalMs / 60000);
        const ss = Math.floor((totalMs % 60000) / 1000);
        const ms = totalMs % 1000;
        return `${String(mm).padStart(2, "0")}:${String(ss).padStart(2, "0")}.${String(ms).padStart(3, "0")}`;
    };

    // Submit waktu member
    const handleSubmit = async (username) => {
        const timeStr = times[username];
        const file = files[username];

        if (!timeStr) {
            alert("❌ Masukkan waktu yang valid (MM:SS.mmm)!");
            return;
        }

        const totalMs = timeStringToMs(timeStr);
        if (isNaN(totalMs)) {
            alert("❌ Format waktu salah! Gunakan MM:SS.mmm");
            return;
        }

        const userId = uuidv4(); // 🔑 generate userId otomatis

        let imageUrl = "";
        let publicId = "";

        if (file) {
            try {
                const formData = new FormData();
                formData.append("file", file);

                const res = await fetch("/api/upload", {
                    method: "POST",
                    body: formData,
                });

                const data = await res.json();
                console.log("✅ Upload Response:", data); // <-- DEBUG

                imageUrl = data.url || "";
                publicId = data.public_id || "";
            } catch (error) {
                console.error("❌ Gagal upload gambar:", error);
                alert("❌ Gagal upload gambar");
                return;
            }
        }

        try {
            const q = query(collection(db, "team_attack"), where("Username", "==", username));
            const snapshot = await getDocs(q);

            if (!snapshot.empty) {
                const docRef = doc(db, "team_attack", snapshot.docs[0].id);
                await updateDoc(docRef, {
                    userId,
                    time: totalMs,
                    imageUrl: imageUrl || snapshot.docs[0].data().imageUrl || "",
                    public_id: publicId || snapshot.docs[0].data().public_id || "",
                });
            } else {
                await addDoc(collection(db, "team_attack"), {
                    Username: username,
                    userId,
                    time: totalMs,
                    imageUrl,
                    public_id: publicId,
                });
            }
            setTimes((prev) => ({ ...prev, [username]: "" }));
            setFiles((prev) => ({ ...prev, [username]: null }));
        } catch (error) {
            console.error(error);
            alert("❌ Gagal menyimpan data");
        }
    };

    // 🔍 Filter members berdasarkan search
    const filteredMembers = members.filter((m) =>
        m.Username.toLowerCase().includes(search.toLowerCase())
    );
    const [files, setFiles] = useState({}); // simpan file per username
    

    return (
        <div className="min-h-screen w-full bg-white text-black flex flex-col">
            <Navbar />

            <div className="flex-1 w-full px-4 py-8 md:px-8 md:py-16">
                {/* Leaderboard Section */}
                <div className="w-full max-w-5xl mx-auto border-4 border-purple-700 rounded-xl p-6 shadow-lg mb-8">
                    {/* Header dengan nama map & tanggal (tetap ada, tidak dihapus) */}


                    <h2 className="text-2xl font-bold mb-4 text-purple-700 flex items-center gap-2">
                        <Trophy className="w-6 h-6 text-yellow-400" /> TOP 10 LEADERBOARD
                    </h2>

                    {/* 🔹 Tambahan info map & periode di bawah judul leaderboard */}
                    {session && (
                        <div className="mb-4 p-3 rounded-lg bg-yellow-100 border border-yellow-400">
                            <p className="text-lg font-semibold text-yellow-700">
                                🗺️ Map: {session.mapName}
                            </p>
                            <p className="text-sm text-gray-600">
                                📅 Periode: {session.startDate} s/d {session.endDate}
                            </p>
                        </div>
                    )}

                    <ol className="list-decimal pl-5 space-y-2">
                        {leaderboard.length > 0 ? (
                            leaderboard.map((item, index) => (
                                <li
                                    key={index}
                                    className={`flex justify-between p-3 rounded-lg shadow transition ${index === 0
                                        ? "bg-yellow-300 text-black"
                                        : index === 1
                                            ? "bg-gray-300 text-black"
                                            : index === 2
                                                ? "bg-orange-300 text-black"
                                                : "bg-purple-700/50 text-white"
                                        }`}
                                >
                                    <span>{item.Username}</span>
                                    <span>{msToTimeString(item.time)}</span>
                                </li>
                            ))
                        ) : (
                            <li className="text-gray-700">Belum ada data</li>
                        )}
                    </ol>
                </div>

                {/* Search bar */}
                <div className="mb-4 max-w-5xl mx-auto">
                    <input
                        type="text"
                        placeholder="🔍 Cari username..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="w-full px-4 py-2 rounded-lg border border-purple-500 text-black focus:ring-2 focus:ring-yellow-400"
                    />
                </div>

                {/* Member Input Section */}
                <div className="w-full max-w-5xl mx-auto border-4 border-purple-700 rounded-xl p-6 shadow-lg overflow-x-auto">
                    <table className="w-full text-left border-collapse rounded-lg overflow-hidden">
                        <thead className="bg-purple-700 text-white">
                            <tr>
                                <th className="p-3">Username</th>
                                <th className="p-3">Waktu (MM:SS.mmm)</th>
                                <th className="p-3">Gambar</th> {/* Tambahan kolom */}
                                <th className="p-3">Aksi</th>
                            </tr>
                        </thead>

                        <tbody>
                            {filteredMembers.map((member) => (
                                <tr
                                    key={member.id}
                                    className="border-t border-purple-600 hover:bg-purple-600/30 transition"
                                >
                                    <td className="p-3">{member.Username}</td>
                                    <td className="p-3">
                                        <input
                                            type="text"
                                            placeholder="MM:SS.mmm"
                                            value={times[member.Username] || ""}
                                            onChange={(e) =>
                                                setTimes((prev) => ({ ...prev, [member.Username]: e.target.value }))
                                            }
                                            className="px-3 py-2 rounded-lg border border-purple-500 focus:ring-2 focus:ring-yellow-400 w-full text-black"
                                        />
                                    </td>
                                    <td className="p-3">
                                        <input
                                            type="file"
                                            accept="image/*"
                                            onChange={(e) => {
                                                const file = e.target.files[0];
                                                if (!file) return;

                                                // Validasi tipe file
                                                if (!file.type.startsWith("image/")) {
                                                    alert("❌ Hanya file gambar yang diperbolehkan!");
                                                    e.target.value = null;
                                                    return;
                                                }

                                                // Validasi ukuran < 1 MB
                                                if (file.size > 1024 * 1024) {
                                                    alert("❌ Ukuran gambar maksimal 1 MB!");
                                                    e.target.value = null;
                                                    return;
                                                }

                                                setFiles((prev) => ({ ...prev, [member.Username]: file }));
                                            }}
                                            className="w-full"
                                        />
                                    </td>

                                    <td className="p-3">
                                        <button
                                            onClick={() => handleSubmit(member.Username)}
                                            className="bg-yellow-500 hover:bg-yellow-600 text-black font-bold px-5 py-2 rounded-lg shadow-lg transition duration-300 ease-in-out transform hover:scale-105 flex items-center justify-center gap-2"
                                        >
                                            💾 Upload & Simpan
                                        </button>
                                    </td>
                                </tr>
                            ))}
                            {filteredMembers.length === 0 && (
                                <tr>
                                    <td colSpan="3" className="text-center py-4 text-gray-700">
                                        ❌ Tidak ada member ditemukan
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
