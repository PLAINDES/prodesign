FROM node:20-alpine3.19

WORKDIR /app

ARG VITE_API_BASE_URL
ARG VITE_API_BASE_URL_CALCULATE

ENV VITE_API_BASE_URL=$VITE_API_BASE_URL
ENV VITE_API_BASE_URL_CALCULATE=$VITE_API_BASE_URL_CALCULATE

COPY package*.json ./
RUN npm install --legacy-peer-deps

COPY . .

RUN npm run build

EXPOSE 80
ENV PORT_SERVER=80

CMD ["npm", "run", "preview", "--", "--host", "--port", "80"]