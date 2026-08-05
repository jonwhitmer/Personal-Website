FROM node:20-alpine AS build
WORKDIR /app

# Accept build args
ARG NODE_ENV
ARG VITE_API_URL

# Make them available as environment variables for Vite
ENV NODE_ENV=$NODE_ENV
ENV VITE_API_URL=$VITE_API_URL

COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

FROM nginx:stable-alpine
COPY --from=build /app/dist /usr/share/nginx/html
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
