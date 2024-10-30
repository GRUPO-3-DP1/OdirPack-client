# Usa una imagen de Node para construir la aplicación
FROM node:20 AS build
WORKDIR /home/app
COPY . .
RUN npm install
RUN npm run build

# Usa una imagen de servidor web ligero para servir los archivos estáticos
FROM nginx:alpine
COPY --from=build /home/app/dist /usr/share/nginx/html
EXPOSE 80
