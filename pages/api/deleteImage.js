// pages/api/deleteImage.js
import cloudinary from "../../config/cloudinary";

export default async function handler(req, res) {
    if (req.method !== "POST") {
        return res.status(405).json({ error: "Method not allowed" });
    }

    try {
        const { public_id } = req.body;
        if (!public_id) {
            return res.status(400).json({ error: "public_id kosong" });
        }

        const result = await cloudinary.uploader.destroy(public_id);
        console.log("🗑️ Delete result:", result);

        res.status(200).json({ success: true, result });
    } catch (error) {
        console.error("❌ Gagal hapus di Cloudinary:", error);
        res.status(500).json({ error: "Gagal hapus gambar" });
    }
}
