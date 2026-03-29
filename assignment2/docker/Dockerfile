# server
FROM php:8.2-apache
WORKDIR /var/www

COPY my-apache-site.conf /etc/apache2/sites-available/my-apache-site.conf

RUN echo "ServerName localhost" >> /etc/apache2/apache2.conf && \
    a2enmod rewrite && \
    a2enmod proxy_http && \
    a2dissite 000-default && \
    a2ensite my-apache-site && \
    service apache2 restart

RUN apt-get update && \
    apt-get upgrade -y && \
    apt-get install -y git zip unzip libpq-dev wget sudo && \
    docker-php-ext-configure pgsql -with-pgsql=/usr/local/pgsql && \
    docker-php-ext-install pdo pdo_pgsql pgsql && \
    wget -O phpunit.phar https://phar.phpunit.de/phpunit-10.phar && \
    chmod +x phpunit.phar && \
    sudo mv phpunit.phar /usr/local/bin/phpunit

RUN curl -sS https://getcomposer.org/installer | php -- --install-dir=/usr/local/bin --filename=composer

COPY entrypoint.sh /usr/local/bin/entrypoint.sh
RUN chmod +x /usr/local/bin/entrypoint.sh
ENTRYPOINT ["/usr/local/bin/entrypoint.sh"]
