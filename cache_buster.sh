#!/bin/sh

# --- НАСТРОЙКИ ---
# Исходная директория проекта
SOURCE_DIR="/app/repo"
# Целевая директория (на уровень выше)
DEST_DIR="$(dirname "$SOURCE_DIR")/weighttracker"

# --- НАЧАЛО СКРИПТА ---

# 1. Создание целевой директории, если она не существует
echo "Целевая директория: $DEST_DIR"
mkdir -p "$DEST_DIR"

# 2. Синхронизация файлов с помощью rsync для оптимизации
echo "Синхронизация файлов из $SOURCE_DIR в $DEST_DIR..."
rsync -av --delete --exclude='.git' --exclude='cache_buster.sh' --exclude='.github' --exclude='.gitignore' "$SOURCE_DIR/" "$DEST_DIR/"

# 3. Переход в целевую директорию для удобства работы
cd "$DEST_DIR" || exit

# 4. Переименование CSS файлов с добавлением хеша и обновление HTML
echo "Обработка CSS и обновление HTML файлов..."

for css_file in styles/*.css; do
    # Проверяем, что файл существует и это не просто строка, если нет .css файлов
    [ -f "$css_file" ] || continue

    # Пропускаем уже обработанные файлы, чтобы не хешировать их повторно
    if echo "$css_file" | grep -qE '\.[a-f0-9]{8}\.css$'; then
        echo "Пропускаем уже хешированный файл: $css_file"
        continue
    fi

    # Вычисляем md5 хеш и берем первые 8 символов
    hash=$(md5sum "$css_file" | awk '{print $1}' | cut -c1-8)

    # Составляем новое имя
    filename=$(basename "$css_file" .css)
    extension=$(expr "$css_file" : '.*\.\(.*\)')
    new_name="styles/${filename}.${hash}.${extension}"

    original_name=$(basename "$css_file")
    new_basename=$(basename "$new_name")

    # 5. Обновление ссылок на CSS в HTML файлах
    echo "Обновление ссылок для $original_name -> $new_basename в HTML файлах..."
    for html_file in *.html; do
        [ -f "$html_file" ] || continue
        echo "В файле $html_file заменяем '$original_name' на '$new_basename'"
        sed -i "s|$original_name|$new_basename|g" "$html_file"
    done

    echo "Переименовываем $css_file -> $new_name"
    mv "$css_file" "$new_name"
done

echo "Готово! Все файлы обработаны и находятся в директории $DEST_DIR"