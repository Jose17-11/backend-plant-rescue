import express from 'express';
import multer from 'multer';
const app = express();
const upload = multer();

let latestFrame = null;

app.post('/api/stream', upload.single('frame'), (req, res) => {
  try {
    if (!req.file) {
      console.error('No se recibió archivo en el request');
      return res.status(400).send('No file uploaded');
    }

    console.log(`Frame recibido - Tamaño: ${req.file.size} bytes`);
    latestFrame = req.file.buffer;
    res.status(200).send('Frame recibido');
    
  } catch (error) {
    console.error('Error en POST /api/stream:', error);
    res.status(500).send(`Server error: ${error.message}`);
  }
});

app.get('/api/stream', (req, res) => {
  try {
    if (!latestFrame) {
      console.log('Solicitud GET pero no hay frames aún');
      return res.status(404).send('No frames available');
    }

    console.log(`Enviando frame - Tamaño: ${latestFrame.length} bytes`);
    res.setHeader('Content-Type', 'image/jpeg');
    res.send(latestFrame);
    
  } catch (error) {
    console.error('Error en GET /api/stream:', error);
    res.status(500).send(`Server error: ${error.message}`);
  }
});

// Importante: Escuchar en todas las interfaces de red
const PORT = 3000;
app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running on http://localhost:${PORT}`);
  console.log(`Accesible en la red local como: http://[TU_IP_LOCAL]:${PORT}`);
});