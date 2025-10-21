# Deployment guide

How to actually deploy for 'production' (theres only a development command but thats good enough for now)

### Docker (homepage only)

Make sure you have git+docker installed

```bash
git clone https://github.com/nova-glider/website
cd website
mv docker-compose-example.yml compose.yml
docker compose up -d
```
- Homepage: `http://localhost:3000`

---

### Manual (homepage + backend)
> [!WARNING]  
> You need to manually set the ports for homepage and backend to be different.

Homepage
```bash
git clone https://github.com/nova-glider/website
cd website
cd homepage
pnpm install
pnpm dev # This also builds the css and fixes formatting issues
```

Backend
```bash
git clone https://github.com/nova-glider/backend
cd backend
pnpm install
pnpm dev
```
