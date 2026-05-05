# Use the official Node image as the base
FROM mcr.microsoft.com/devcontainers/javascript-node:20

RUN apt-get update && apt-get install -y sudo \
    && echo "node ALL=(ALL) NOPASSWD:ALL" >> /etc/sudoers

# Install PostgreSQL
RUN apt-get update && apt-get install -y postgresql postgresql-contrib

# Install Gemini CLI globally so it's available in your terminal
# This also installs common dev utilities like git and curl
RUN npm install -g @google/gemini-cli

# Install Vercel CLI for deployment
RUN npm install -g vercel

# Set the working directory
WORKDIR /workspaces/mise-en-place