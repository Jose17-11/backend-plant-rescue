# Usa Node.js oficial
FROM node:20

# Crear directorio de trabajo
WORKDIR /app

# Copiar archivos
COPY package*.json ./
RUN npm install

# Copiar el resto del código
COPY . .

# Crear la carpeta de frames (por si no existe)
RUN mkdir -p src/frames

# Expone el puerto
EXPOSE 3340

# Comando para iniciar
CMD ["node", "src/index.js"]
