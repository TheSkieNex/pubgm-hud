#!/bin/bash

# Docker Installation Script for Ubuntu
# This script installs Docker CE (Community Edition) on Ubuntu systems

set -e  # Exit on any error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
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

# Function to check if running as root
check_root() {
    if [[ $EUID -eq 0 ]]; then
        print_error "This script should not be run as root. Please run as a regular user with sudo privileges."
        exit 1
    fi
}

# Function to check if Docker is already installed
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

# Function to update package list
update_packages() {
    print_status "Updating package list..."
    sudo apt-get update
    print_success "Package list updated successfully"
}

# Function to install required packages
install_prerequisites() {
    print_status "Installing prerequisites..."
    sudo apt-get install -y \
        apt-transport-https \
        ca-certificates \
        curl \
        gnupg \
        lsb-release
    print_success "Prerequisites installed successfully"
}

# Function to add Docker's official GPG key
add_docker_gpg_key() {
    print_status "Adding Docker's official GPG key..."
    
    # Remove any existing Docker GPG keys
    sudo rm -f /etc/apt/keyrings/docker.gpg
    
    # Create directory for GPG keys if it doesn't exist
    sudo mkdir -p /etc/apt/keyrings
    
    # Add Docker's official GPG key
    curl -fsSL https://download.docker.com/linux/ubuntu/gpg | sudo gpg --dearmor -o /etc/apt/keyrings/docker.gpg
    
    # Set correct permissions
    sudo chmod a+r /etc/apt/keyrings/docker.gpg
    
    print_success "Docker GPG key added successfully"
}

# Function to add Docker repository
add_docker_repository() {
    print_status "Adding Docker repository..."
    
    # Get the Ubuntu codename
    UBUNTU_CODENAME=$(lsb_release -cs)
    
    # Add the repository to sources list
    echo \
        "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.gpg] https://download.docker.com/linux/ubuntu \
        $UBUNTU_CODENAME stable" | sudo tee /etc/apt/sources.list.d/docker.list > /dev/null
    
    print_success "Docker repository added successfully"
}

# Function to install Docker
install_docker() {
    print_status "Installing Docker CE and Docker Compose..."
    sudo apt-get update
    sudo apt-get install -y docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin
    print_success "Docker CE and Docker Compose plugin installed successfully"
}

# Function to install standalone Docker Compose (if needed)
install_standalone_compose() {
    print_status "Installing standalone Docker Compose..."
    
    # Download the latest version of Docker Compose
    COMPOSE_VERSION=$(curl -s https://api.github.com/repos/docker/compose/releases/latest | grep 'tag_name' | cut -d\" -f4)
    
    # Download and install Docker Compose
    sudo curl -L "https://github.com/docker/compose/releases/download/${COMPOSE_VERSION}/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
    
    # Make it executable
    sudo chmod +x /usr/local/bin/docker-compose
    
    # Create a symbolic link
    sudo ln -sf /usr/local/bin/docker-compose /usr/bin/docker-compose
    
    print_success "Standalone Docker Compose ${COMPOSE_VERSION} installed successfully"
}

# Function to add user to docker group
add_user_to_docker_group() {
    print_status "Adding current user to docker group..."
    sudo usermod -aG docker $USER
    print_success "User added to docker group successfully"
    print_warning "You will need to log out and log back in for the group changes to take effect."
}

# Function to start and enable Docker service
start_docker_service() {
    print_status "Starting Docker service..."
    sudo systemctl start docker
    sudo systemctl enable docker
    print_success "Docker service started and enabled"
}

# Function to verify Docker installation
verify_installation() {
    print_status "Verifying Docker installation..."
    
    # Test Docker with sudo (since user might not have logged out yet)
    if sudo docker run hello-world &> /dev/null; then
        print_success "Docker installation verified successfully!"
        print_status "Docker version:"
        sudo docker --version
        print_status "Docker Compose plugin version:"
        sudo docker compose version
        print_status "Standalone Docker Compose version:"
        sudo docker-compose --version
    else
        print_error "Docker installation verification failed!"
        exit 1
    fi
}

# Function to show post-installation instructions
show_post_install_instructions() {
    echo
    print_success "Docker installation completed successfully!"
    echo
    print_status "Post-installation steps:"
    echo "1. Log out and log back in to your user session"
    echo "2. Verify Docker works without sudo: docker run hello-world"
    echo "3. If you want to use Docker without sudo permanently, the user has been added to the docker group"
    echo
    print_status "Useful Docker commands:"
    echo "  docker --version          # Check Docker version"
    echo "  docker ps                 # List running containers"
    echo "  docker images             # List images"
    echo "  docker system prune       # Clean up unused resources"
    echo
    print_status "Useful Docker Compose commands:"
    echo "  docker compose up         # Start services with docker-compose (plugin)"
    echo "  docker-compose up         # Start services with docker-compose (standalone)"
    echo "  docker compose down       # Stop and remove containers"
    echo "  docker compose ps         # List running services"
    echo "  docker compose logs       # View service logs"
    echo "  docker compose build      # Build service images"
    echo
    print_status "Docker Compose versions installed:"
    echo "  - Docker Compose Plugin (docker compose) - integrated with Docker CLI"
    echo "  - Standalone Docker Compose (docker-compose) - traditional version"
    echo
}

# Main installation function
main() {
    echo "=========================================="
    echo "    Docker Installation Script for Ubuntu"
    echo "=========================================="
    echo
    
    # Check if running as root
    check_root
    
    # Check if Docker is already installed
    check_docker_installed
    
    # Confirm installation
    print_status "This script will install Docker CE on your Ubuntu system."
    read -p "Do you want to continue? (y/N): " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        print_status "Installation cancelled."
        exit 0
    fi
    
    # Installation steps
    update_packages
    install_prerequisites
    add_docker_gpg_key
    add_docker_repository
    install_docker
    install_standalone_compose
    start_docker_service
    add_user_to_docker_group
    verify_installation
    show_post_install_instructions
}

# Run main function
main "$@"
