# Usa una imagen de Node para construir la aplicación
FROM node:20 AS build
WORKDIR /home/app

ARG VITE_API_URL
ARG VITE_WEBSOCKET_URL

# Definir las variables de entorno
ENV VITE_API_URL=$VITE_API_URL
ENV VITE_WEBSOCKET_URL=$VITE_WEBSOCKET_URL

COPY . .
RUN npm install
RUN npm run build

# Usa una imagen de servidor web ligero para servir los archivos estáticos
FROM nginx:alpine
COPY --from=build /home/app/dist /usr/share/nginx/html
EXPOSE 80
