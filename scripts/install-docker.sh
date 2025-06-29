#!/bin/bash

set -e

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

check_root() {
    if [[ $EUID -eq 0 ]]; then
        print_error "This script should not be run as root. Please run as a regular user with sudo privileges."
        exit 1
    fi
}

check_docker_installed() {
    if command -v docker &> /dev/null; then
        print_warning "Docker is already installed!"
        docker --version
        read -p "Do you want to continue with the installation anyway? (y/N): " -n 1 -r
        echo
        if [[ ! $REPLY =~ ^[Yy]$ ]]; then
            print_status "Installation cancelled."
            exit 0
        fi
    fi
}

setup_prerequisites() {
    print_status "Updating package list and installing prerequisites..."
    sudo apt-get update
    sudo apt-get install -y ca-certificates curl
    print_success "Prerequisites installed successfully"
}

add_docker_gpg_key() {
    print_status "Adding Docker's official GPG key..."
    sudo install -m 0755 -d /etc/apt/keyrings
    sudo curl -fsSL https://download.docker.com/linux/ubuntu/gpg -o /etc/apt/keyrings/docker.asc
    sudo chmod a+r /etc/apt/keyrings/docker.asc
    print_success "Docker GPG key added successfully"
}

add_docker_repository() {
    print_status "Adding Docker repository..."
    echo \
        "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.asc] https://download.docker.com/linux/ubuntu \
        $(. /etc/os-release && echo "${UBUNTU_CODENAME:-$VERSION_CODENAME}") stable" | \
        sudo tee /etc/apt/sources.list.d/docker.list > /dev/null
    sudo apt-get update
    print_success "Docker repository added successfully"
}

install_docker() {
    print_status "Installing Docker packages..."
    sudo apt-get install -y docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin
    print_success "Docker packages installed successfully"
}

add_user_to_docker_group() {
    print_status "Adding current user to docker group..."
    sudo usermod -aG docker $USER
    print_success "User added to docker group successfully"
    print_warning "You will need to log out and log back in for the group changes to take effect."
}

start_docker_service() {
    print_status "Starting Docker service..."
    sudo systemctl start docker
    sudo systemctl enable docker
    print_success "Docker service started and enabled"
}

verify_installation() {
    print_status "Verifying Docker installation..."
    if sudo docker run hello-world &> /dev/null; then
        print_success "Docker installation verified successfully!"
        print_status "Docker version:"
        sudo docker --version
        print_status "Docker Compose plugin version:"
        sudo docker compose version
    else
        print_error "Docker installation verification failed!"
        exit 1
    fi
}

show_post_install_instructions() {
    echo
    print_success "Docker installation completed successfully!"
    echo
    print_status "Post-installation steps:"
    echo "1. Log out and log back in to your user session"
    echo "2. Verify Docker works without sudo: docker run hello-world"
    echo
    print_status "Useful Docker commands:"
    echo "  docker --version          # Check Docker version"
    echo "  docker ps                 # List running containers"
    echo "  docker images             # List images"
    echo "  docker system prune       # Clean up unused resources"
    echo
    print_status "Useful Docker Compose commands:"
    echo "  docker compose up         # Start services with docker-compose"
    echo "  docker compose down       # Stop and remove containers"
    echo "  docker compose ps         # List running services"
    echo "  docker compose logs       # View service logs"
    echo "  docker compose build      # Build service images"
    echo
}

main() {
    echo "=========================================="
    echo "    Docker Installation Script"
    echo "=========================================="
    echo
    
    check_root
    check_docker_installed
    
    print_status "This script will install Docker CE following the official Docker documentation."
    read -p "Do you want to continue? (y/N): " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        print_status "Installation cancelled."
        exit 0
    fi
    
    setup_prerequisites
    add_docker_gpg_key
    add_docker_repository
    install_docker
    start_docker_service
    add_user_to_docker_group
    verify_installation
    show_post_install_instructions
}

main "$@"
