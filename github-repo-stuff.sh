#!/bin/bash
# Script: create_github_repo.sh
# This script automates the process of creating a GitHub repository using the GitHub CLI (gh).
# It initializes a git repo (if not already), adds all files, commits them,
# and then creates the GitHub repo and pushes your code.

# Check if GitHub CLI (gh) is installed.
if ! command -v gh >/dev/null 2>&1; then
    echo "Error: GitHub CLI (gh) is not installed. Please install it from https://cli.github.com/ and try again."
    exit 1
fi

# Check if git is installed.
if ! command -v git >/dev/null 2>&1; then
    echo "Error: git is not installed. Please install git and try again."
    exit 1
fi

# Prompt the user for repository details.
read -p "Enter the repository name: " repo_name
read -p "Enter a repository description (optional): " repo_desc
read -p "Do you want the repository to be public? (y/n): " repo_visibility_choice

if [[ "$repo_visibility_choice" =~ ^[Yy]$ ]]; then
    visibility="--public"
else
    visibility="--private"
fi

# Initialize git repository if not already initialized.
if [ ! -d ".git" ]; then
    echo "Initializing new Git repository..."
    git init
fi

# Stage all files and commit.
git add .
if git commit -m "Initial commit"; then
    echo "Files committed."
else
    echo "No new changes to commit or commit failed."
fi

# Create the GitHub repository using the GitHub CLI and push the changes.
echo "Creating repository on GitHub..."
gh repo create "$repo_name" $visibility --description "$repo_desc" --source=. --remote=origin --push

echo "Repository '$repo_name' created and pushed to GitHub successfully!"

