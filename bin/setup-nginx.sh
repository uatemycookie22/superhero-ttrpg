#!/bin/bash
# Setup nginx on Lightsail instance

set -e

echo "Setting up nginx for Superhero TTRPG..."

# Install nginx if not present
if ! command -v nginx &> /dev/null; then
    echo "Installing nginx..."
    sudo apt-get update
    sudo apt-get install -y nginx
fi

# Copy nginx configuration
sudo cp nginx/nginx.conf /etc/nginx/sites-available/superhero-ttrpg

# Enable site
sudo ln -sf /etc/nginx/sites-available/superhero-ttrpg /etc/nginx/sites-enabled/

# Remove default site
sudo rm -f /etc/nginx/sites-enabled/default

# Test configuration
echo "Testing nginx configuration..."
sudo nginx -t

# Reload nginx
echo "Reloading nginx..."
sudo systemctl reload nginx

echo "✅ nginx configured successfully!"
echo ""
echo "Next steps:"
echo "1. Update server_name in /etc/nginx/sites-available/superhero-ttrpg"
echo "2. Install SSL with: sudo certbot --nginx -d yourdomain.com"
echo "3. Test: curl http://localhost/api/health"