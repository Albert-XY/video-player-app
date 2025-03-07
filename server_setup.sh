#!/bin/bash

# Update system
sudo yum update -y

# Install Docker
sudo yum install -y yum-utils
sudo yum-config-manager --add-repo https://download.docker.com/linux/centos/docker-ce.repo
sudo yum install -y docker-ce docker-ce-cli containerd.io
sudo systemctl start docker
sudo systemctl enable docker

# Install Docker Compose
sudo curl -L "https://github.com/docker/compose/releases/download/1.29.2/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose

# Configure firewall
sudo firewall-cmd --permanent --add-port=22/tcp
sudo firewall-cmd --permanent --add-port=80/tcp
sudo firewall-cmd --permanent --add-port=443/tcp
sudo firewall-cmd --permanent --add-port=8080/tcp
sudo firewall-cmd --reload

# Create project directory
mkdir -p /path/to/your/project
cd /path/to/your/project

# Clone your repository (replace with your actual repository URL)
git clone https://github.com/your-username/your-repo.git .

# Set up environment variables (replace with your actual values)
echo "SPRING_DATASOURCE_URL=jdbc:postgresql://db:5432/videoeeg" >> .env
echo "SPRING_DATASOURCE_USERNAME=admin" >> .env
echo "SPRING_DATASOURCE_PASSWORD=password" >> .env

# Add current user to docker group to run docker without sudo
sudo usermod -aG docker $USER

echo "Server setup complete. Please log out and log back in for group changes to take effect."

