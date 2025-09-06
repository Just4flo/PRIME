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
    const [files, setFiles] = useState({}); // simpan file per username
    const [leaderboard, setLeaderboard] = useState([]);
    const [search, setSearch] = useState("");
    const [session, setSession] = useState(null);
    const [previewImage, setPreviewImage] = useState(null); // modal preview

    // Helper ambil nama setelah "•"
    const getSecondName = (username) => {
        if (!username) return "";
        const parts = String(username).split("•");
        return parts[1] ? parts[1].trim() : String(username).trim();
    };

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

    // Ambil session saat pertama render
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
        const match = String(timeStr || "").match(regex);
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

    // Submit waktu member (WAJIB waktu & gambar)
    const handleSubmit = async (username) => {
        const timeStr = times[username];
        const file = files[username];

        if (!timeStr || !file) {
            alert("❌ Waktu dan gambar wajib diisi!");
            return;
        }

        const totalMs = timeStringToMs(timeStr);
        if (isNaN(totalMs)) {
            alert("❌ Format waktu salah! Gunakan MM:SS.mmm (mis. 01:23.456)");
            return;
        }

        const userId = uuidv4(); // generate userId otomatis

        // Upload gambar (wajib)
        let imageUrl = "";
        let publicId = "";

        try {
            const formData = new FormData();
            formData.append("file", file);

            const res = await fetch("/api/upload", {
                method: "POST",
                body: formData,
            });

            if (!res.ok) {
                throw new Error("Upload API error");
            }

            const data = await res.json();
            imageUrl = data.url || "";
            publicId = data.public_id || "";

            if (!imageUrl) {
                throw new Error("Upload tidak mengembalikan URL gambar");
            }
        } catch (error) {
            console.error("❌ Gagal upload gambar:", error);
            alert("❌ Gagal upload gambar");
            return;
        }

        // Simpan / update dokumen
        try {
            const qUser = query(collection(db, "team_attack"), where("Username", "==", username));
            const snapshot = await getDocs(qUser);

            if (!snapshot.empty) {
                const docRef = doc(db, "team_attack", snapshot.docs[0].id);
                await updateDoc(docRef, {
                    userId,
                    time: totalMs,
                    imageUrl,        // wajib baru
                    public_id: publicId,
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

            // Reset field user ini
            setTimes((prev) => ({ ...prev, [username]: "" }));
            setFiles((prev) => ({ ...prev, [username]: null }));
        } catch (error) {
            console.error(error);
            alert("❌ Gagal menyimpan data");
        }
    };

    // Filter + sort members (pakai nama setelah "•")
    const filteredMembers = members.filter((m) =>
        m.Username.toLowerCase().includes(search.toLowerCase())
    );
    const sortedMembers = [...filteredMembers].sort((a, b) =>
        getSecondName(a.Username).localeCompare(getSecondName(b.Username))
    );

    return (
        <div className="min-h-screen w-full bg-white text-black flex flex-col">
            <Navbar />
            {/* Modal Preview Gambar */}
            {previewImage && (
                <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50">
                    <div className="relative">
                        <img
                            src={previewImage}
                            alt="Preview"
                            className="max-w-[95vw] max-h-[80vh] rounded-lg shadow-lg"
                        />

                        <button
                            onClick={() => setPreviewImage(null)}
                            className="absolute top-2 right-2 bg-red-600 text-white px-3 py-1 rounded-full shadow hover:bg-red-700 transition"
                        >
                            ✕
                        </button>
                    </div>
                </div>
            )}

            <div className="flex-1 w-full px-4 py-8 md:px-8 md:py-16">

                <div className="w-full max-w-5xl mx-auto border-4 border-purple-700 rounded-xl p-6 shadow-lg mb-8">
                    <h2 className="text-2xl font-bold mb-4 text-purple-700 flex items-center gap-2">
                        <Trophy className="w-6 h-6 text-yellow-400" /> TOP 10 LEADERBOARD
                    </h2>

                    {/* 🔹 Tambahan info map & periode */}
                    {session && (
                        <div className="mb-4 p-3 rounded-lg bg-yellow-100 border border-yellow-400 space-y-1">
                            <div className="flex">
                                <span className="w-20 font-semibold text-yellow-700">Track</span>
                                <span className="text-yellow-700">: {session.mapName}</span>
                            </div>
                            <div className="flex">
                                <span className="w-20 font-semibold text-yellow-700">Car</span>
                                <span className="text-yellow-700">: {session.carName}</span>
                            </div>
                            <div className="flex">
                                <span className="w-20 font-semibold text-yellow-700">Period</span>
                                <span className="text-gray-600">: {session.startDate} s/d {session.endDate}</span>
                            </div>
                        </div>
                    )}
                    <ol className="list-none space-y-2">
                        {leaderboard.length > 0 ? (
                            leaderboard.map((item, index) => (
                                <li
                                    key={index}
                                    className={`grid grid-cols-3 items-center p-2 sm:p-3 rounded-lg shadow text-center text-xs sm:text-sm md:text-base
        ${index === 0
                                            ? "bg-yellow-300 text-black"
                                            : index === 1
                                                ? "bg-gray-300 text-black"
                                                : index === 2
                                                    ? "bg-orange-300 text-black"
                                                    : "bg-purple-700/50 text-white"
                                        }`}
                                >
                                    {/* Username */}
                                    <span className="truncate">{item.Username}</span>

                                    {/* Waktu */}
                                    <span>{msToTimeString(item.time)}</span>

                                    {/* Gambar bukti */}
                                    {item.imageUrl ? (
                                        <img
                                            src={item.imageUrl}
                                            alt="bukti"
                                            className="w-10 h-10 object-cover rounded cursor-pointer mx-auto"
                                            onClick={() => setPreviewImage(item.imageUrl)}
                                        />
                                    ) : (
                                        <span className="text-xs text-gray-300">-</span>
                                    )}
                                </li>
                            ))
                        ) : (
                            <li className="text-gray-700 text-center">Belum ada data</li>
                        )}
                    </ol>
                </div>
                <div className="w-full max-w-5xl mx-auto border-4 border-purple-700 rounded-xl p-3 sm:p-6 shadow-lg overflow-x-auto">
                    {/* 🔍 Search bar di dalam box */}
                    <div className="mb-4">
                        <input
                            type="text"
                            placeholder="🔍 Cari username..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="w-full px-3 py-2 rounded-lg border border-purple-500 text-black focus:ring-2 focus:ring-yellow-400 text-sm sm:text-base"
                        />
                    </div>
                    <table className="w-full text-left border-collapse text-xs sm:text-sm md:text-base">
                        <thead className="bg-purple-700 text-white sticky top-0 z-10">
                            <tr>
                                <th className="p-3">Username</th>
                                <th className="p-3">Time (MM:SS.mmm)</th>
                                <th className="p-3">Image</th>
                                <th className="p-3">Action</th>
                            </tr>
                        </thead>

                        <tbody>
                            {sortedMembers.map((member) => {
                                const selectedFile = files[member.Username];
                                const timeValue = times[member.Username] || "";
                                const canSubmit = Boolean(selectedFile && timeValue);

                                return (
                                    <tr
                                        key={member.id}
                                        className="border-t border-purple-600 hover:bg-purple-600/30 transition"
                                    >
                                        <td className="p-3">{member.Username}</td>

                                        <td className="p-3">
                                            <input
                                                type="text"
                                                placeholder="MM:SS.mmm"
                                                value={timeValue}
                                                onChange={(e) =>
                                                    setTimes((prev) => ({ ...prev, [member.Username]: e.target.value }))
                                                }
                                                pattern="\d{2}:\d{2}\.\d{3}"
                                                title="Gunakan format MM:SS.mmm, contoh 01:23.456"
                                                className="px-2 sm:px-3 py-1 sm:py-2 rounded-lg border border-purple-500 focus:ring-2 focus:ring-yellow-400 w-full text-black text-xs sm:text-sm"
                                            />
                                        </td>

                                        <td className="p-3">
                                            <div className="flex items-center gap-3">
                                                <label className="inline-flex items-center px-2 sm:px-3 py-1 sm:py-2 rounded-lg border border-purple-500 cursor-pointer hover:bg-purple-50 text-xs sm:text-sm">
                                                    <span className="text-sm">Select Image</span>
                                                    <input
                                                        type="file"
                                                        accept="image/*"
                                                        onChange={(e) => {
                                                            const file = e.target.files?.[0];
                                                            if (!file) return;

                                                            // Validasi tipe file
                                                            if (!file.type.startsWith("image/")) {
                                                                alert("❌ Hanya file gambar yang diperbolehkan!");
                                                                e.target.value = "";
                                                                return;
                                                            }

                                                            // Validasi ukuran < 5 MB
                                                            if (file.size > 5 * 1024 * 1024) {
                                                                alert("❌ Ukuran gambar maksimal 5 MB!");
                                                                e.target.value = "";
                                                                return;
                                                            }

                                                            setFiles((prev) => ({ ...prev, [member.Username]: file }));
                                                        }}
                                                        className="hidden"
                                                    />
                                                </label>

                                                {/* Preview dengan border */}
                                                {selectedFile && (
                                                    <img
                                                        src={URL.createObjectURL(selectedFile)}
                                                        alt="Preview"
                                                        className="w-10 h-10 sm:w-12 sm:h-12 rounded-md object-cover border border-purple-500 shadow"
                                                    />
                                                )}
                                            </div>
                                        </td>

                                        <td className="p-3">
                                            <button
                                                onClick={() => handleSubmit(member.Username)}
                                                disabled={!canSubmit}
                                                className={`w-full sm:w-auto font-bold px-3 sm:px-5 py-1 sm:py-2 rounded-lg shadow-lg transition transform flex items-center justify-center gap-2 text-xs sm:text-sm
        ${canSubmit
                                                        ? "bg-yellow-500 hover:bg-yellow-600 text-black hover:scale-105"
                                                        : "bg-gray-300 text-gray-600 cursor-not-allowed"
                                                    }`}
                                            >
                                                💾 Upload & Save
                                            </button>
                                        </td>
                                    </tr>
                                );
                            })}

                            {sortedMembers.length === 0 && (
                                <tr>
                                    <td colSpan="4" className="text-center py-4 text-gray-700">
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



