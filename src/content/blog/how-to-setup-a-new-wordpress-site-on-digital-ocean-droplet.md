---
title: "How to Setup a New WordPress Site on Digital Ocean Droplet"
date: 2026-01-04T18:14Z
---

I had setup a Wordpress site a while back on Digital Ocean using their [One-Click Installer](https://www.digitalocean.com/community/tutorials/how-to-use-the-wordpress-one-click-install). That installer sets it up for exactly one site with no direction on how to add additional sites. Months later I had to setup another one, and after some fiddling around, figured out all the steps. So here they are (more or my reference than anything).

This guide assumes you setup the site with the One-Click WordPress droplet and want to add additional WordPress sites to it.

## Prerequisites

-   Digital Ocean droplet with WordPress One-Click already installed
-   SSH access to your server
-   A domain name pointed to your droplet's IP address

## 1\. Create the Virtual Host Configuration

Create a new Apache config file for your site:

```
sudo nano /etc/apache2/sites-available/yoursite.conf
```

Add the following configuration (replace `yourdomain.com` and `yoursite` with your actual values):

```
<VirtualHost *:80>
    ServerName yourdomain.com
    ServerAlias www.yourdomain.com
    DocumentRoot /var/www/yoursite

    <Directory /var/www/yoursite>
        AllowOverride All
        Require all granted
    </Directory>

    ErrorLog ${APACHE_LOG_DIR}/yoursite_error.log
    CustomLog ${APACHE_LOG_DIR}/yoursite_access.log combined
</VirtualHost>
```

## 2\. Create the Document Root Directory

```
sudo mkdir /var/www/yoursite
sudo chown -R www-data:www-data /var/www/yoursite
```

## 3\. Enable the Site

```
sudo a2ensite yoursite.conf
sudo apache2ctl configtest
sudo systemctl reload apache2
```

## 4\. Setup HTTPS with Certbot

Certbot is preinstalled on the droplet. Run:

```
sudo certbot --apache -d yourdomain.com -d www.yourdomain.com
```

Follow the prompts to enter your email and agree to terms. Certbot will automatically configure SSL and set up auto-renewal.

Verify auto-renewal works:

```
sudo certbot renew --dry-run
```

## 5\. Create MySQL Database and User

Get the MySQL root password:

```
cat /root/.digitalocean_password
```

Log into MySQL:

```
mysql -u root -p
```

Create the database and user:

```
CREATE DATABASE yoursite;
CREATE USER 'yoursite_user'@'localhost' IDENTIFIED BY 'your_strong_password_here';
GRANT ALL PRIVILEGES ON yoursite.* TO 'yoursite_user'@'localhost';
FLUSH PRIVILEGES;
EXIT;
```

## 6\. Download and Install WordPress

```
cd /var/www/yoursite
sudo wget https://wordpress.org/latest.tar.gz
sudo tar -xzf latest.tar.gz --strip-components=1
sudo rm latest.tar.gz
sudo chown -R www-data:www-data .
```

Visit your domain in a browser to complete the WordPress installation. You'll need:

-   Database Name: `yoursite`
-   Username: `yoursite_user`
-   Password: (the password you set)
-   Database Host: `localhost`
-   Table Prefix: `wp_` (or customize for security)

## Importing an Existing Database (Optional)

If you have a mysqldump file to import:

```
mysql -u yoursite_user -p yoursite < /path/to/your-database.sql
```

For gzipped files:

```
gunzip < your-database.sql.gz | mysql -u yoursite_user -p yoursite
```

## Troubleshooting

### Viewing Apache Error Logs

```
tail -f /var/log/apache2/yoursite_error.log
```

### Enabling WordPress Debug Mode

Edit `wp-config.php`:

```
nano /var/www/yoursite/wp-config.php
```

Add or modify these lines:

```
define('WP_DEBUG', true);
define('WP_DEBUG_LOG', true);
define('WP_DEBUG_DISPLAY', false);
```

Then view the debug log:

```
tail -f /var/www/yoursite/wp-content/debug.log
```

### PHP Not Working

PHP 8.0 is enabled globally on the droplet, so it should work automatically. Test with:

```
echo "<?php phpinfo(); ?>" | sudo tee /var/www/yoursite/test.php
sudo chown www-data:www-data /var/www/yoursite/test.php
```

Visit `https://yourdomain.com/test.php` — then delete the file after testing:

```
sudo rm /var/www/yoursite/test.php
```

## Notes

-   The default web root for the original site is `/var/www/html`
-   MySQL credentials are stored in `/root/.digitalocean_password`
-   XML-RPC is blocked by default; enable with `a2disconf block-xmlrpc` if needed
-   Apache config files are in `/etc/apache2/sites-available/`
-   Enabled sites are symlinked in `/etc/apache2/sites-enabled/`
