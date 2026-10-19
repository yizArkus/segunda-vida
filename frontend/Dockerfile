# 1. Etapa de compilación web con Expo
FROM node:20-alpine AS build

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .

# Apuntar las llamadas a la API al backend en producción en Railway
ARG EXPO_PUBLIC_API_URL=https://segunda-vida-production.up.railway.app
ENV EXPO_PUBLIC_API_URL=$EXPO_PUBLIC_API_URL

RUN npx expo export --platform web

# 2. Etapa de producción: servidor estático ligero
FROM node:20-alpine

WORKDIR /app

RUN npm install -g serve

COPY --from=build /app/dist ./dist

EXPOSE 3000

# serve -s habilita SPA routing (evita 404 en rutas internas de Expo Router)
CMD ["sh", "-c", "serve -s dist -l tcp://0.0.0.0:${PORT:-3000}"]
