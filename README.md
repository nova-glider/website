## Nova-Glider Website v2

A merge of all website repo's based of the dashboards development nextjs base.

```bash
git clone --branch v2-dev https://github.com/nova-glider/website

cd website

mkdir db
sudo chown -R 1001:1001 ./db
sudo chmod 775 ./db

docker compose up --build -d

# localhost:3000

```