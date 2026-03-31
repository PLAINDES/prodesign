FROM node:20-alpine3.19

WORKDIR /app

# 1. Declaramos los argumentos que vendrán desde el docker-compose.yml
# Deben empezar con VITE_ para que Vite los reconozca automáticamente
ARG VITE_API_BASE_URL
ARG VITE_API_BASE_URL_CALCULATE

# 2. Convertimos los argumentos en variables de entorno del sistema 
# para que el proceso de 'npm run build' pueda leerlos
ENV VITE_API_BASE_URL=$VITE_API_BASE_URL
ENV VITE_API_BASE_URL_CALCULATE=$VITE_API_BASE_URL_CALCULATE

# Copiamos archivos de dependencias e instalamos
COPY package*.json ./
RUN npm install --legacy-peer-deps

# Copiamos el resto del código
COPY . .

# 3. Construimos el proyecto
# Aquí es donde Vite "inyecta" los valores de ENV en el código JS final
RUN npm run build

EXPOSE 80
ENV PORT_SERVER=80

# Usamos preview para servir los archivos compilados en el puerto 80
CMD ["npm", "run", "preview", "--", "--host", "--port", "80"]