# Video Player App

This is a Next.js application that allows users to register, login, and watch videos. The app uses PostgreSQL for data storage and includes features like random video selection, SAM scale rating, and tracking of video start and end times.

## Getting Started

1. Clone the repository
2. Install dependencies: `npm install`
3. Set up your PostgreSQL database and update the `.env.local` and `.env.production` files with your database URL
4. Run the development server: `npm run dev`

## Deployment

This project is set up for deployment using Docker and GitHub Actions.

### Prerequisites

- Docker and Docker Compose installed on your server
- A DockerHub account
- A server with SSH access

### Setup

1. Fork this repository to your GitHub account.

2. In your GitHub repository settings, add the following secrets:
   - `DOCKERHUB_USERNAME`: Your DockerHub username
   - `DOCKERHUB_TOKEN`: Your DockerHub access token
   - `SERVER_HOST`: Your server's IP address or domain name
   - `SERVER_USERNAME`: The username to SSH into your server
   - `SERVER_SSH_KEY`: The private SSH key to access your server

3. On your server, create a directory for the project and copy the `docker-compose.yml` file into it.

4. Create a `.env` file in the same directory with the following variables:

