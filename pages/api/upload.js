// pages/api/upload.js
import nextConnect from "next-connect";
import multer from "multer";
import cloudinary from "../../config/cloudinary";

const upload = multer({ storage: multer.memoryStorage() });
const apiRoute = nextConnect();

apiRoute.use(upload.single("file"));

apiRoute.post((req, res) => {
    cloudinary.uploader.upload_stream(
        { folder: "team_attack" },
        (error, result) => {
            if (error) {
                console.error("❌ Upload gagal:", error);
                return res.status(500).json({ error: "Upload gagal" });
            }

            console.log("✅ Cloudinary Result:", result); // <-- DEBUG

            res.status(200).json({
                url: result.secure_url,
                public_id: result.public_id,
            });
        }
    ).end(req.file.buffer);
});

export default apiRoute;
export const config = { api: { bodyParser: false } };
