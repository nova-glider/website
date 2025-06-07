# Deployment guide

How to actually deploy for 'production' (theres only a development command but thats good enough for now)

### Docker (highly recommended)

Make sure you have git+docker installed

```bash
git clone https https://github.com/samvandenabeele/cansat_SBC_2026
cd cansat_SBC_2026
cd website
docker compose up -d
```
- Homepage: `http://localhost:3000`
- Backend (API): `http://localhost:3001`

---

### Manual
Homepage
```bash
git clone https://github.com/samvandenabeele/cansat_SBC_2026
cd cansat_SBC_2026
cd website
cd homepage
pnpm install
pnpm dev # This also builds the css and fixes formatting issues
```

Backend
```bash
git clone https://github.com/samvandenabeele/cansat_SBC_2026
cd cansat_SBC_2026
cd website
cd backend
pnpm install
pnpm dev
```
- Homepage: `http://localhost:3000`
- Backend (API): `http://localhost:3001`
