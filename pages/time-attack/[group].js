import { useEffect, useState } from "react";
import { useRouter } from "next/router";
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
import { Trophy, CheckCircle2 } from "lucide-react";
import Navbar from "@/components/Navbar";
import { v4 as uuidv4 } from "uuid";
import Swal from 'sweetalert2'
import withReactContent from 'sweetalert2-react-content'

const MySwal = withReactContent(Swal)

export default function DynamicTeamAttack() {
    const router = useRouter();
    const { group } = router.query;

    const [members, setMembers] = useState([]);
    const [times, setTimes] = useState({});
    const [files, setFiles] = useState({});
    const [leaderboard, setLeaderboard] = useState([]);
    const [participants, setParticipants] = useState([]);
    const [search, setSearch] = useState("");
    const [session, setSession] = useState(null);
    const [previewImage, setPreviewImage] = useState(null);

    const memberCollectionName = group === 'prime_id' ? 'prime_id' : 'members';
    const timeAttackCollectionName = group === 'prime_id' ? 'prime_id_team_attack' : 'team_attack';
    const sessionCollectionName = group === 'prime_id' ? 'prime_id_team_attack_sessions' : 'team_attack_sessions';

    const getSecondName = (username) => {
        if (!username) return "";
        const parts = String(username).split("•");
        return parts[1] ? parts[1].trim() : String(username).trim();
    };

    useEffect(() => {
        if (!group) return;
        const fetchMembers = async () => {
            try {
                const snapshot = await getDocs(collection(db, memberCollectionName));
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
    }, [group, memberCollectionName]);

    useEffect(() => {
        if (!group) return;
        const fetchSession = async () => {
            try {
                const snapshot = await getDocs(collection(db, sessionCollectionName));
                if (!snapshot.empty) {
                    const docData = snapshot.docs[0].data();
                    setSession({ id: snapshot.docs[0].id, ...docData });
                } else {
                    setSession(null);
                }
            } catch (error) {
                console.error("Error ambil session:", error);
            }
        };
        fetchSession();
    }, [group, sessionCollectionName]);

    useEffect(() => {
        if (!group) return;
        const q = query(collection(db, timeAttackCollectionName), orderBy("time", "asc"));
        const unsubscribe = onSnapshot(q, (snapshot) => {
            const participantsData = snapshot.docs.map((d) => d.data());
            setParticipants(participantsData);
            setLeaderboard(participantsData.slice(0, 10));
        });
        return () => unsubscribe();
    }, [group, timeAttackCollectionName]);

    const timeStringToMs = (timeStr) => {
        const regex = /^(\d{2}):(\d{2})\.(\d{3})$/;
        const match = String(timeStr || "").match(regex);
        if (!match) return NaN;
        const [, mm, ss, ms] = match.map(Number);
        return mm * 60000 + ss * 1000 + ms;
    };

    const msToTimeString = (totalMs) => {
        if (typeof totalMs !== 'number') return "00:00.000";
        const mm = Math.floor(totalMs / 60000);
        const ss = Math.floor((totalMs % 60000) / 1000);
        const ms = totalMs % 1000;
        return `${String(mm).padStart(2, "0")}:${String(ss).padStart(2, "0")}.${String(ms).padStart(3, "0")}`;
    };

    const handleSubmit = async (username) => {
        const timeStr = times[username];
        const file = files[username];

        // Ganti alert dengan MySwal.fire
        if (!timeStr || !file) {
            MySwal.fire({
                title: 'Gagal!',
                text: 'Waktu dan gambar wajib diisi!',
                icon: 'error',
                confirmButtonColor: '#7c3aed' // Warna ungu
            });
            return;
        }
        const totalMs = timeStringToMs(timeStr);
        if (isNaN(totalMs)) {
            MySwal.fire({
                title: 'Format Salah!',
                text: 'Gunakan format MM:SS.mmm (contoh: 01:23.456)',
                icon: 'warning',
                confirmButtonColor: '#7c3aed'
            });
            return;
        }

        // Tampilkan notifikasi loading
        MySwal.fire({
            title: 'Mengunggah...',
            text: 'Mohon tunggu sebentar',
            allowOutsideClick: false,
            didOpen: () => {
                MySwal.showLoading()
            }
        });

        const userId = uuidv4();
        let imageUrl = "";
        let publicId = "";
        try {
            const formData = new FormData();
            formData.append("file", file);
            const res = await fetch("/api/upload", {
                method: "POST",
                body: formData,
            });
            if (!res.ok) throw new Error("Upload API error");
            const data = await res.json();
            imageUrl = data.url || "";
            publicId = data.public_id || "";
            if (!imageUrl) throw new Error("Upload tidak mengembalikan URL gambar");
        } catch (error) {
            console.error("❌ Gagal upload gambar:", error);
            MySwal.fire({
                title: 'Upload Gagal!',
                text: 'Gagal mengunggah gambar ke server.',
                icon: 'error',
                confirmButtonColor: '#7c3aed'
            });
            return;
        }

        try {
            const qUser = query(collection(db, timeAttackCollectionName), where("Username", "==", username));
            const snapshot = await getDocs(qUser);

            if (!snapshot.empty) {
                const docRef = doc(db, timeAttackCollectionName, snapshot.docs[0].id);
                await updateDoc(docRef, { userId, time: totalMs, imageUrl, public_id: publicId });
            } else {
                await addDoc(collection(db, timeAttackCollectionName), {
                    Username: username,
                    userId,
                    time: totalMs,
                    imageUrl,
                    public_id: publicId,
                });
            }
            setTimes((prev) => ({ ...prev, [username]: "" }));
            setFiles((prev) => ({ ...prev, [username]: null }));

            // Tampilkan notifikasi BERHASIL di sini
            MySwal.fire({
                title: 'Berhasil!',
                text: 'Data time attack berhasil disimpan.',
                icon: 'success',
                confirmButtonColor: '#7c3aed',
                timer: 2000 // Otomatis hilang setelah 2 detik
            });

        } catch (error) {
            console.error(error);
            MySwal.fire({
                title: 'Penyimpanan Gagal!',
                text: 'Gagal menyimpan data ke database.',
                icon: 'error',
                confirmButtonColor: '#7c3aed'
            });
        }
    };

    const filteredMembers = members.filter((m) =>
        m.Username.toLowerCase().includes(search.toLowerCase())
    );
    const sortedMembers = [...filteredMembers].sort((a, b) =>
        getSecondName(a.Username).localeCompare(getSecondName(b.Username))
    );

    if (!group) {
        return <div className="min-h-screen flex items-center justify-center bg-white text-black">Loading...</div>;
    }

    const formatDate = (dateString) => {
        if (!dateString) return "";
        const date = new Date(dateString);
        const formatted = date.toLocaleDateString("id-ID", {
            day: "numeric",
            month: "long",
            year: "numeric",
        });
        return formatted.replace(/ /g, '-');
    };

    return (
        <div className="min-h-screen w-full bg-white text-black flex flex-col">
            <Navbar />
            {previewImage && (
                <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50">
                    <div className="relative">
                        <img src={previewImage} alt="Preview" className="max-w-[95vw] max-h-[80vh] rounded-lg shadow-lg" />
                        <button onClick={() => setPreviewImage(null)} className="absolute top-2 right-2 bg-red-600 text-white px-3 py-1 rounded-full shadow hover:bg-red-700 transition">✕</button>
                    </div>
                </div>
            )}
            <div className="flex-1 w-full px-4 py-8 md:px-8 md:py-16">
                <div className="w-full max-w-5xl mx-auto border-4 border-purple-700 rounded-xl p-6 shadow-lg mb-8">
                    <h2 className="text-2xl font-bold mb-4 text-purple-700 flex items-center gap-2 uppercase">
                        <Trophy className="w-6 h-6 text-yellow-400" />
                        {group.replace('_', ' ')} - TOP 10 LEADERBOARD
                    </h2>
                    {session ? (
                        <div className="mb-4 p-3 rounded-lg bg-yellow-100 border border-yellow-400 space-y-1 text-yellow-800">
                            <div className="flex"><span className="w-20 font-semibold">Track</span><span>: {session.mapName}</span></div>
                            <div className="flex"><span className="w-20 font-semibold">Car</span><span>: {session.carName}</span></div>
                            <div className="flex"><span className="w-20 font-semibold">Period</span><span>: {formatDate(session.startDate)} s/d {formatDate(session.endDate)}</span></div>
                        </div>
                    ) : <div className="text-center text-gray-500 p-4">No active session.</div>}
                    <ol className="list-none space-y-2">
                        {leaderboard.map((item, index) => (
                            <li key={index} className={`grid grid-cols-[auto_1fr_auto_auto] items-center gap-4 p-2 sm:p-3 rounded-lg shadow text-xs sm:text-sm md:text-base ${index === 0 ? "bg-yellow-300 text-black" : index === 1 ? "bg-gray-300 text-black" : index === 2 ? "bg-orange-300 text-black" : "bg-purple-700/50 text-white"}`}>
                                <span className="font-bold">{index + 1}.</span>
                                <span className="truncate text-left font-semibold">{item.Username}</span>
                                <span className="font-mono text-center">{msToTimeString(item.time)}</span>
                                {item.imageUrl ? (<img src={item.imageUrl} alt="bukti" className="w-12 h-12 object-cover rounded cursor-pointer mx-auto" onClick={() => setPreviewImage(item.imageUrl)} />) : (<span className="text-xs text-gray-400">-</span>)}
                            </li>
                        ))}
                    </ol>
                </div>
                <div className="w-full max-w-5xl mx-auto border-4 border-purple-700 rounded-xl p-3 sm:p-6 shadow-lg overflow-x-auto">
                    <div className="mb-4"><input type="text" placeholder="🔍 Cari username..." value={search} onChange={(e) => setSearch(e.target.value)} className="w-full px-3 py-2 rounded-lg border border-purple-500 text-black focus:ring-2 focus:ring-yellow-400 text-sm sm:text-base" /></div>
                    <table className="w-full text-left border-collapse text-xs sm:text-sm md:text-base">
                        <thead className="bg-purple-700 text-white sticky top-0 z-10">
                            <tr>
                                <th className="p-3">Username</th>
                                <th className="p-3">Waktu (MM:SS.mmm)</th>
                                <th className="p-3">Gambar</th>
                                <th className="p-3">Aksi</th>
                            </tr>
                        </thead>
                        <tbody>
                            {sortedMembers.map((member) => {
                                const selectedFile = files[member.Username];
                                const timeValue = times[member.Username] || "";
                                const hasSubmitted = participants.some(p => p.Username === member.Username);
                                const canSubmit = Boolean(selectedFile && timeValue);
                                return (
                                    <tr key={member.id} className={`border-t border-purple-600 transition ${hasSubmitted ? 'bg-green-50' : 'hover:bg-purple-100'}`}>
                                        <td className="p-3">{member.Username}</td>
                                        <td className="p-3">
                                            <input type="text" placeholder="MM:SS.mmm" value={timeValue} onChange={(e) => setTimes((prev) => ({ ...prev, [member.Username]: e.target.value }))} pattern="\d{2}:\d{2}\.\d{3}" title="Gunakan format MM:SS.mmm, contoh 01:23.456" className="px-2 sm:px-3 py-1 sm:py-2 rounded-lg border border-purple-500 focus:ring-2 focus:ring-yellow-400 w-full text-black text-xs sm:text-sm disabled:bg-gray-200" disabled={hasSubmitted} />
                                        </td>
                                        <td className="p-3">
                                            <div className="flex items-center gap-3">
                                                <label className={`inline-flex items-center px-2 sm:px-3 py-1 sm:py-2 rounded-lg border border-purple-500 text-xs sm:text-sm ${hasSubmitted ? 'cursor-not-allowed bg-gray-200' : 'cursor-pointer hover:bg-purple-50'}`}>
                                                    <span className="text-sm">Pilih Gambar</span>
                                                    <input type="file" accept="image/*" onChange={(e) => {
                                                        const file = e.target.files?.[0];
                                                        if (!file) return;
                                                        if (!file.type.startsWith("image/")) { alert("❌ Hanya file gambar yang diperbolehkan!"); e.target.value = ""; return; }
                                                        if (file.size > 5 * 1024 * 1024) { alert("❌ Ukuran gambar maksimal 5 MB!"); e.target.value = ""; return; }
                                                        setFiles((prev) => ({ ...prev, [member.Username]: file }));
                                                    }} className="hidden" disabled={hasSubmitted} />
                                                </label>
                                                {selectedFile && (<img src={URL.createObjectURL(selectedFile)} alt="Preview" className="w-10 h-10 sm:w-12 sm:h-12 rounded-md object-cover border border-purple-500 shadow" />)}
                                            </div>
                                        </td>
                                        <td className="p-3">
                                            <div className="flex items-center gap-2">
                                                <button onClick={() => handleSubmit(member.Username)} disabled={!canSubmit || hasSubmitted} className={`w-full sm:w-auto font-bold px-3 sm:px-5 py-1 sm:py-2 rounded-lg shadow-lg transition transform flex items-center justify-center gap-2 text-xs sm:text-sm ${canSubmit && !hasSubmitted ? "bg-yellow-500 hover:bg-yellow-600 text-black hover:scale-105" : "bg-gray-300 text-gray-600 cursor-not-allowed"}`}>
                                                    💾 Upload & Save
                                                </button>
                                                {hasSubmitted && (<CheckCircle2 className="text-green-500 flex-shrink-0" size={24} title="Sudah diupload" />)}
                                            </div>
                                        </td>
                                    </tr>
                                );
                            })}
                            {sortedMembers.length === 0 && (<tr><td colSpan="4" className="text-center py-4 text-gray-700">❌ Tidak ada member ditemukan</td></tr>)}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}