FROM node:23 AS base

WORKDIR /app

COPY package.json package-lock.json ./

RUN npm install

COPY . .


FROM base AS build

RUN npm run build


FROM nginx:latest AS prod

COPY --from=build /app/dist /usr/share/nginx/html

COPY ./nginx.conf /etc/nginx/nginx.conf

EXPOSE 5173
