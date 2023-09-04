#!/bin/sh

echo "Creating log directory and file for livereload..."
sudo mkdir -p /app/whg/logs/
sudo touch /app/whg/logs/debug.log
sudo chmod 777 /app/whg/logs/debug.log
echo "Log directory and file created for livereload."

python manage.py livereload --host=livereload --port=35729 --ignore-template-dirs --ignore-static-dirs /app/whg/static/css/ /app/whg/static/js/ /app/whg/static/webpack/ /app/datasets/templates/datasets/
