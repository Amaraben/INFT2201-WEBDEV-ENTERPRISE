#!/bin/bash

# Automatically run composer install if vendor/ folder is missing
if [ ! -d "/var/www/vendor" ]; then
  echo "==> vendor/ not found, running composer install..."
  cd /var/www
  composer install
else
  echo "==> vendor/ already exists, skipping composer install."
fi

# Launch Apache in foreground
exec apache2-foreground
