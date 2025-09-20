import { useEffect, useState } from "react";
import AdminSidebar from "@/components/AdminSidebar";
import ProtectedRoute from "@/components/ProtectedRoute";
import { db } from "@/config/firebase";
import {
    collection,
    addDoc,
    getDocs,
    deleteDoc,
    doc,
    serverTimestamp,
    query,
    orderBy,
} from "firebase/firestore";

export default function AdminAnnouncement() {
    const [judul, setJudul] = useState("");
    const [deskripsi, setDeskripsi] = useState("");
    const [gambar, setGambar] = useState(null);
    const [previewGambar, setPreviewGambar] = useState("");
    const [isUploading, setIsUploading] = useState(false);
    const [pengumuman, setPengumuman] = useState([]);
    const [loading, setLoading] = useState(true);

    const fetchPengumuman = async () => {
        setLoading(true);
        try {
            const q = query(collection(db, "pengumuman"), orderBy("createdAt", "desc"));
            const snap = await getDocs(q);
            const data = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
            setPengumuman(data);
        } catch (err) {
            console.error("Error fetch pengumuman:", err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchPengumuman();
    }, []);

    const handleGambarChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            if (file.size > 5 * 1024 * 1024) {
                alert("❌ Ukuran gambar maksimal 5 MB!");
                return;
            }
            setGambar(file);
            setPreviewGambar(URL.createObjectURL(file));
        }
    };

    const handleAddPengumuman = async (e) => {
        e.preventDefault();
        if (!judul.trim() || !deskripsi.trim() || !gambar) {
            alert("⚠️ Judul, Deskripsi, dan Gambar tidak boleh kosong!");
            return;
        }

        setIsUploading(true);
        try {
            const formData = new FormData();
            formData.append("file", gambar);
            const res = await fetch("/api/upload", {
                method: "POST",
                body: formData,
            });

            if (!res.ok) {
                throw new Error("Gagal mengunggah gambar.");
            }
            const data = await res.json();
            const imageUrl = data.url;
            const publicId = data.public_id; // <-- DAPATKAN public_id

            await addDoc(collection(db, "pengumuman"), {
                judul,
                deskripsi,
                imageUrl,
                public_id: publicId, // <-- SIMPAN public_id KE FIRESTORE
                createdAt: serverTimestamp(),
            });

            setJudul("");
            setDeskripsi("");
            setGambar(null);
            setPreviewGambar("");
            document.getElementById("file-input").value = "";

            alert("✅ Pengumuman berhasil ditambahkan!");
            fetchPengumuman();
        } catch (err) {
            console.error("Error add pengumuman:", err);
            alert("❌ Gagal menambahkan pengumuman.");
        } finally {
            setIsUploading(false);
        }
    };

    const handleDeletePengumuman = async (pengumumanItem) => {
        if (!confirm("Apakah yakin ingin menghapus pengumuman ini?")) return;

        try {
            // Langkah 1: Hapus gambar dari Cloudinary jika ada public_id
            if (pengumumanItem.public_id) {
                const res = await fetch('/api/deleteImage', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ public_id: pengumumanItem.public_id }),
                });

                if (!res.ok) {
                    const errorData = await res.json();
                    console.warn("Gagal hapus gambar dari Cloudinary:", errorData.details);
                    alert("Peringatan: Gagal menghapus file gambar, namun data akan tetap dihapus.");
                }
            }

            // Langkah 2: Hapus dokumen dari Firestore
            await deleteDoc(doc(db, "pengumuman", pengumumanItem.id));

            alert("✅ Pengumuman berhasil dihapus.");
            fetchPengumuman();

        } catch (err) {
            console.error("Error saat menghapus pengumuman:", err);
            alert("❌ Terjadi kesalahan saat menghapus pengumuman.");
        }
    };

    const formatDate = (ts) => {
        if (!ts?.toDate) return "-";
        return ts.toDate().toLocaleDateString("id-ID", {
            day: 'numeric', month: 'long', year: 'numeric'
        });
    };

    return (
        <ProtectedRoute>
            <div className="flex">
                <AdminSidebar />
                <div className="flex-1 lg:ml-64 p-8 min-h-screen bg-gradient-to-br from-gray-100 via-purple-200 to-indigo-300 text-black">
                    <div className="pt-16 lg:pt-0">
                        <h1 className="text-4xl font-bold mb-6">Kelola Pengumuman</h1>
                        <p className="text-lg mb-6">Tambahkan, lihat, atau hapus pengumuman di sini.</p>

                        <form onSubmit={handleAddPengumuman} className="bg-white/90 p-6 rounded-2xl shadow-xl mb-8">
                            <h2 className="text-2xl font-semibold mb-4">Tambah Pengumuman</h2>
                            <div className="mb-4">
                                <input type="text" placeholder="Judul Pengumuman" value={judul} onChange={(e) => setJudul(e.target.value)} className="p-3 border rounded-lg w-full" />
                            </div>
                            <div className="mb-4">
                                <textarea placeholder="Isi pengumuman..." value={deskripsi} onChange={(e) => setDeskripsi(e.target.value)} rows={4} className="p-3 border rounded-lg w-full" />
                            </div>
                            <div className="mb-4">
                                <label className="block mb-2 font-medium">Upload Gambar</label>
                                <input id="file-input" type="file" accept="image/*" onChange={handleGambarChange} className="p-2 border rounded-lg w-full file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-purple-50 file:text-purple-700 hover:file:bg-purple-100" />
                                {previewGambar && (
                                    <div className="mt-4">
                                        <p className="text-sm font-medium mb-2">Preview:</p>
                                        <img src={previewGambar} alt="Preview" className="w-48 h-auto rounded-lg shadow-md" />
                                    </div>
                                )}
                            </div>
                            <button type="submit" disabled={isUploading} className="bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-lg shadow transition disabled:bg-gray-400 disabled:cursor-not-allowed">
                                {isUploading ? "Mengunggah..." : "Simpan"}
                            </button>
                        </form>

                        <div className="bg-white/90 p-6 rounded-2xl shadow-xl">
                            <h2 className="text-2xl font-semibold mb-4">Daftar Pengumuman</h2>
                            {loading ? (<p>Loading...</p>) : pengumuman.length > 0 ? (
                                <ul className="space-y-4">
                                    {pengumuman.map((p) => (
                                        <li key={p.id} className="flex flex-col md:flex-row justify-between items-start gap-4 p-4 border rounded-lg bg-gray-50">
                                            {p.imageUrl && (
                                                <img src={p.imageUrl} alt={p.judul} className="w-full md:w-40 h-auto object-cover rounded-md shadow-sm" />
                                            )}
                                            <div className="flex-1">
                                                <h3 className="font-bold text-lg">{p.judul}</h3>
                                                <p className="text-gray-700 whitespace-pre-wrap">{p.deskripsi}</p>
                                                <p className="text-sm text-gray-500 mt-1">{formatDate(p.createdAt)}</p>
                                            </div>
                                            <button
                                                onClick={() => handleDeletePengumuman(p)} // <-- Kirim seluruh objek 'p'
                                                className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg self-start md:self-center flex-shrink-0"
                                            >
                                                Hapus
                                            </button>
                                        </li>
                                    ))}
                                </ul>
                            ) : (<p className="text-gray-600">❌ Belum ada pengumuman</p>)}
                        </div>
                    </div>
                </div>
            </div>
        </ProtectedRoute>
    );
}