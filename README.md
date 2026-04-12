## Nova-Glider Website v2

A merge of all website repo's based of the dashboards development nextjs base.

#### TODO
- [x] Add more charts
- [ ] Add timestamps to hover cards

> [!WARNING]  
> If you are still using the v1 branch as main, i recommend you remove your local repo and reclone it.

```bash
git clone https://github.com/nova-glider/website

cd website

mkdir db
sudo chown -R 1001:1001 ./db
sudo chmod 775 ./db

docker compose up --build -d

# localhost:3000

```

if you really need to you can quickly edit ./data and/or ./public to change contact details and profile pictures