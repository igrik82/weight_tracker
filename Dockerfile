# 1. Базовый образ с нужной версией Node.js
FROM node:18-alpine

# 2. Устанавливаем рабочую директорию внутри контейнера
WORKDIR /usr/src/app

# 3. Копируем package.json и package-lock.json
COPY package*.json ./

# 4. Устанавливаем зависимости
RUN npm install

# 5. Копируем все остальные файлы проекта
COPY . .

# 6. Открываем порт, на котором работает приложение
EXPOSE 3000

# 7. Команда для запуска приложения
CMD [ "node", "server.js" ]
