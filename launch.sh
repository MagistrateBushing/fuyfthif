#!/bin/bash
# Запуск интерактивного курса «Информатика»
DIR="$(cd "$(dirname "$0")" && pwd)"
xdg-open "$DIR/index.html" 2>/dev/null || open "$DIR/index.html" 2>/dev/null || echo "Откройте файл index.html в браузере вручную"
