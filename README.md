# CanSat 2026 Website

this branch is a merge of homepage, backend and dashboard for those who desire a single docker image

---

> [!WARNING]  
> I heavily recommend using different images inside a compose stack as opposed to smashing everything into one.

## How to use
1. Clone this branch and go into the directory
´´´bash
git clone --branch all-in-one https://github.com/nova-glider/website
cd website
´´´
2. Add permissions
´´´bash
chmod +x build-dashboard.sh
chmod +x website/setup.sh
´´´
3. Go into ´website´ and run ´setup.sh´
´´´bash
cd website
./setup.sh
´´´
4. Start the container
´´´bash
docker run --name all-in-one -p 3000:3000 all-in-one
´´´