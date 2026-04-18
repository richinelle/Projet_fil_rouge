FROM php:8.4-fpm

RUN apt-get update && apt-get install -y \
    git curl libpng-dev libonig-dev \
    libxml2-dev zip unzip

#pour lancer les commandes composer dans le container

RUN docker-php-ext-install pdo pdo_mysql mbstring exif pcntl bcmath gd

COPY --from=composer:latest /usr/bin/composer /usr/bin/composer
#pour installer le composer ailleurs et le copier ici /usr/bin/composer /usr/bin/composer

WORKDIR /var/www
#ici on se place dans le dossier de travail du projet, c'est là que composer install va être exécuté et que les fichiers seront copiés

COPY . .

RUN composer install --no-dev --optimize-autoloader

RUN chown -R www-data:www-data /var/www/storage /var/www/bootstrap/cache
#pour lancer l'application en tant que www-data et éviter les problèmes de permissions

EXPOSE 8080

CMD php artisan migrate --force && php artisan serve --host=0.0.0.0 --port=${PORT:-8080}