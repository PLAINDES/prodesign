FROM node:20-alpine3.19

WORKDIR /app

# Copiamos archivos de dependencias
COPY package*.json ./

# Instalación limpia de dependencias
RUN npm install --legacy-peer-deps

# Copiamos el resto del código
COPY . .

# Construimos el proyecto (genera la carpeta dist)
RUN npm run build

# EXPOSE es informativo, pero lo ponemos en 80 para que coincida con el Compose
EXPOSE 80

# Variable de entorno para que Express/Node sepa en qué puerto escuchar
ENV PORT_SERVER=80

CMD ["npm", "run", "preview", "--", "--host", "--port", "80"]