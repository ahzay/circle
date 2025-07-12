FROM node:current-alpine
WORKDIR /app
COPY backend/ ./backend/
COPY shared/ ./shared/
WORKDIR /app/backend
RUN npm install
RUN npm install -g tsx
CMD ["npm", "run", "dev"]