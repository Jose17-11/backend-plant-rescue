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

// Middleware para loggear todas las peticiones entrantes
app.use((req, res, next) => {
  console.log(`📥 [${new Date().toISOString()}] ${req.method} ${req.url}`);
  console.log("Headers:", req.headers);
  next();
});

// Configurar Multer para guardar en memoria
const storage = multer.memoryStorage();
const upload = multer({ storage });

// Ruta para recibir frame
app.post("/video", express.raw({ type: "image/jpeg", limit: "2mb" }), (req, res) => {
  const imageBuffer = req.body;
  if (!imageBuffer || !imageBuffer.length) {
    console.error("❌ No se recibió imagen o está vacía");
    return res.status(400).send("No se recibió imagen");
  }

  const filename = `frame_${Date.now()}.jpg`;
  const filePath = path.join(framesDir, filename);

  try {
    fs.writeFileSync(filePath, imageBuffer);
    console.log("📷 Frame recibido y guardado:", filename);
  } catch (err) {
    console.error("❌ Error guardando frame:", err);
    return res.status(500).send("Error guardando imagen");
  }

  // Limitar a 15 imágenes
  try {
    const files = fs.readdirSync(framesDir).filter(f => f.endsWith(".jpg"));
    if (files.length > 15) {
      const sorted = files.sort(); // orden cronológico por nombre
      const toDelete = sorted.slice(0, files.length - 15); // las más viejas

      toDelete.forEach(file => {
        fs.unlinkSync(path.join(framesDir, file));
        console.log("🗑️ Imagen eliminada:", file);
      });
    }
  } catch (err) {
    console.error("❌ Error limpiando imágenes:", err);
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
