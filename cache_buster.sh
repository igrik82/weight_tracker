#!/bin/bash

# --- НАСТРОЙКИ ---
# Исходная директория проекта
SOURCE_DIR="/home/igrik/Projects/html_js/weight_tracker"
# Целевая директория (на уровень выше)
DEST_DIR="$(dirname "$SOURCE_DIR")/weighttracker_test"

# --- НАЧАЛО СКРИПТА ---

# 1. Создание целевой директории, если она не существует
echo "Целевая директория: $DEST_DIR"
mkdir -p "$DEST_DIR"

# 2. Синхронизация файлов с помощью rsync для оптимизации
# rsync копирует только новые или измененные файлы.
# -a: режим архива (рекурсия, сохранение прав, и т.д.)
# -v: подробный вывод
# --delete: удалять файлы в DEST_DIR, если они были удалены в SOURCE_DIR
# --exclude: исключить ненужные директории
echo "Синхронизация файлов из $SOURCE_DIR в $DEST_DIR..."
rsync -av --delete --exclude='.git' --exclude='cache_buster.sh' --exclude='.github' --exclude='.gitignore' "$SOURCE_DIR/" "$DEST_DIR/"

# 3. Переход в целевую директорию для удобства работы
cd "$DEST_DIR" || exit

# 4. Переименование CSS файлов с добавлением хеша
echo "Обработка CSS файлов..."
# Используем ассоциативный массив для хранения соответствий "старое_имя" -> "новое_имя"
declare -A css_map

for css_file in styles/*.css; do
    # Проверяем, что файл существует и это не просто строка, если нет .css файлов
    [ -f "$css_file" ] || continue

    # Пропускаем уже обработанные файлы, чтобы не хешировать их повторно
    if [[ "$css_file" =~ \.[a-f0-9]{8}\.css$ ]]; then
        echo "Пропускаем уже хешированный файл: $css_file"
        continue
    fi

    # Вычисляем md5 хеш и берем первые 8 символов
    hash=$(md5sum "$css_file" | awk '{print $1}' | cut -c1-8)

    # Составляем новое имя
    filename=$(basename -- "$css_file" .css)
    extension="${css_file##*.}"
    new_name="styles/${filename}.${hash}.${extension}"

    # Сохраняем оригинальное и новое имя для замены в HTML
    original_name=$(basename -- "$css_file")
    css_map["$original_name"]="$(basename -- "$new_name")"

    echo "Переименовываем $css_file -> $new_name"
    mv "$css_file" "$new_name"
done

# 5. Обновление ссылок на CSS в HTML файлах
echo "Обновление HTML файлов..."
for html_file in *.html; do
    [ -f "$html_file" ] || continue

    for original_css in "${!css_map[@]}"; do
        hashed_css="${css_map[$original_css]}"
        echo "В файле $html_file заменяем '$original_css' на '$hashed_css'"
        # Используем sed для замены. Знак '|' используется как разделитель,
        # чтобы избежать проблем с путями, содержащими '/'
        sed -i "s|$original_css|$hashed_css|g" "$html_file"
    done
done

echo "Готово! Все файлы обработаны и находятся в директории $DEST_DIR"
