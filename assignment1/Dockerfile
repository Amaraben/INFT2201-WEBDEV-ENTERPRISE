FROM php:8.2-apache
RUN echo "ServerName localhost" >> /etc/apache2/apache2.conf

RUN apt-get update \
    && apt-get install -y unzip git zip libpq-dev \
    && docker-php-ext-install pdo pdo_pgsql \
    && a2enmod rewrite


COPY ./docker/000-default.conf /etc/apache2/sites-available/000-default.conf

WORKDIR /var/www/html