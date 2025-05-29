// backend/index.js
import express from "express";
import multer from "multer";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { dirname } from "path";

// Necesario para que __dirname funcione con ES Modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
const PORT = 3340;

// Crear carpeta 'frames' si no existe
const framesDir = path.join(__dirname, "frames");
if (!fs.existsSync(framesDir)) {
  fs.mkdirSync(framesDir);
}

// Configurar Multer para guardar en memoria
const storage = multer.memoryStorage();
const upload = multer({ storage });

// Ruta para recibir frame
app.post("/video", express.raw({ type: "image/jpeg", limit: "2mb" }), (req, res) => {
  const imageBuffer = req.body;
  if (!imageBuffer || !imageBuffer.length) {
    return res.status(400).send("No se recibió imagen");
  }

  const filename = `frame_${Date.now()}.jpg`;
  const filePath = path.join(framesDir, filename);
  fs.writeFileSync(filePath, imageBuffer);
  console.log("📷 Frame recibido y guardado:", filename);

  // Limitar a 15 imágenes
  const files = fs.readdirSync(framesDir).filter(f => f.endsWith(".jpg"));
  if (files.length > 15) {
    const sorted = files.sort(); // orden cronológico por nombre
    const toDelete = sorted.slice(0, files.length - 15); // las más viejas

    toDelete.forEach(file => {
      fs.unlinkSync(path.join(framesDir, file));
      console.log("🗑️ Imagen eliminada:", file);
    });
  }

  res.status(200).send("Frame recibido");
});



// Ruta para obtener el último frame guardado
app.get("/latest-frame", (req, res) => {
  const files = fs.readdirSync(framesDir).filter(f => f.endsWith(".jpg"));
  if (!files.length) return res.status(404).send("No hay frames");

  const latestFile = files.sort().reverse()[0];
  const filePath = path.join(framesDir, latestFile);
  res.sendFile(filePath);
});

// Iniciar servidor
app.listen(PORT, () => {
  console.log(`🚀 Servidor backend en http://localhost:${PORT}`);
});
