# Deployment Guide for X-Booster

This guide covers how to deploy the X-Booster application to a production environment.

## Prerequisites

- A server (VPS) running Ubuntu 20.04/22.04 OR a Vercel/Netlify account.
- Node.js v18+ installed.
- A domain name (optional but recommended).

---

## Option 1: Deploying to Vercel (Recommended for Frontend)

Since this is a React + Vite application, Vercel is the easiest way to deploy.

1.  **Push your code to GitHub/GitLab.**
2.  **Log in to Vercel** and click "Add New Project".
3.  **Import your repository.**
4.  **Configure Build Settings:**
    -   **Framework Preset:** Vite
    -   **Root Directory:** `./`
    -   **Build Command:** `npm run build`
    -   **Output Directory:** `dist`
5.  **Environment Variables:**
    -   Add any variables from your `.env` file (e.g., `VITE_FIREBASE_API_KEY`, etc.).
6.  **Click Deploy.**

---

## Option 2: Deploying to a VPS (Ubuntu + Nginx)

If you prefer to host it yourself or need a custom backend later.

### 1. Prepare the Server

Update your system and install Node.js, Nginx, and Git.

```bash
sudo apt update && sudo apt upgrade -y
sudo apt install nginx git curl -y

# Install Node.js (using NVM is recommended, but direct install works too)
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt install -y nodejs
```

### 2. Clone and Build

```bash
git clone <your-repo-url>
cd <your-repo-folder>
npm install
npm run build
```

This will create a `dist` folder containing your static site.

### 3. Configure Nginx

Create a new Nginx configuration file.

```bash
sudo nano /etc/nginx/sites-available/xbooster
```

Paste the following configuration:

```nginx
server {
    listen 80;
    server_name yourdomain.com www.yourdomain.com;

    root /path/to/your/project/dist;
    index index.html;

    location / {
        try_files $uri $uri/ /index.html;
    }
}
```

Enable the site and restart Nginx:

```bash
sudo ln -s /etc/nginx/sites-available/xbooster /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
```

### 4. SSL Certificate (HTTPS)

Secure your site with Certbot (Let's Encrypt).

```bash
sudo apt install certbot python3-certbot-nginx
sudo certbot --nginx -d yourdomain.com -d www.yourdomain.com
```

---

## Option 3: Docker Deployment

If you prefer containerization.

1.  **Create a `Dockerfile`:**

```dockerfile
# Build Stage
FROM node:18-alpine as build
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build

# Production Stage
FROM nginx:alpine
COPY --from=build /app/dist /usr/share/nginx/html
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
```

2.  **Build and Run:**

```bash
docker build -t xbooster .
docker run -d -p 80:80 xbooster
```

---

## Important Notes

-   **Firebase:** Ensure your Firebase project settings allow the domain you are deploying to (Authentication -> Settings -> Authorized Domains).
-   **Environment Variables:** Never commit `.env` files. Set them in your CI/CD pipeline or server environment.
