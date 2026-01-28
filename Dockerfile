FROM php:8.3.30-apache

RUN echo "ServerName localhost" >> /etc/apache2/apache2.conf

# Enable useful Apache modules (rewrite later, headers common))
RUN apt-get update && \
    && apt-get install -y --no-install-recommends libpq-dev \
    && docker-php-ext-install pdo pdo_pgsql \
    && rm -rf /var/lib/apt/lists/*

COPY ./docker/vhost.conf /etc/apache2/sites-available/000-default.conf

WORKDIR /var/www/html

