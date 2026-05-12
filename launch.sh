#!/bin/bash
# Запуск интерактивной системы обучения «Информатика»
# Открывает index.html в браузере по умолчанию

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"

if command -v xdg-open &> /dev/null; then
    xdg-open "$SCRIPT_DIR/index.html"
elif command -v open &> /dev/null; then
    open "$SCRIPT_DIR/index.html"
elif command -v sensible-browser &> /dev/null; then
    sensible-browser "$SCRIPT_DIR/index.html"
else
    echo "Откройте файл вручную: $SCRIPT_DIR/index.html"
fi
