# ETAPA 1: Construcción
FROM node:20 AS build

WORKDIR /app

# Copiamos archivos de dependencias
COPY package*.json ./
# RUN npm install --legacy-peer-deps

# Por esto:
RUN npm ci --legacy-peer-deps
# Copiamos el resto del código
COPY . .

# Argumentos para Vite
ARG VITE_API_BASE_URL
ARG VITE_API_BASE_URL_CALCULATE
ARG VITE_URL_PROINVIERTE
ARG VITE_URL_PROBUDGETS_PORTAL

# Definimos las variables de entorno
ENV VITE_API_BASE_URL=$VITE_API_BASE_URL
ENV VITE_API_BASE_URL_CALCULATE=$VITE_API_BASE_URL_CALCULATE
ENV VITE_URL_PROINVIERTE=$VITE_URL_PROINVIERTE
ENV VITE_URL_PROBUDGETS_PORTAL=$VITE_URL_PROBUDGETS_PORTAL

# Construimos la aplicación
RUN npm run build

# ETAPA 2: Servidor de producción (Nginx)
FROM nginx:alpine


# Copiamos los archivos generados de la etapa 'build' al servidor Nginx
COPY --from=build /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Exponemos el puerto 80
EXPOSE 80

# Iniciamos Nginx
CMD ["nginx", "-g", "daemon off;"]