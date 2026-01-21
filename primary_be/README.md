# Contest Platform
A platform where you can create contest which can include DSA questions and multiple choice questions. 
## Clone the repo locally
```bash
cd primary_be
```
---
#### Get a postgres database url

you can get run it locally or via [neon db](https://neon.com/)

Which looks something like this:
```bash
postgresql://username:password@ip:port/dbname
``` 

To run postgres locally

```bash
docker run -d -e POSTGRES_PASSWORD=yourpassword -p 5432:5432 dbname
```

### Copy .env.example to .env

```bash
cp .env.example .env
``` 


## Get judge0 running locally 

 For reference follow this link [ref](https://devsujal.hashnode.dev/create-your-own-leetcode-with-judge)
 
To install dependencies:
```bash
bun install 
```   
Migrate prisma: 
```bash
bunx prisma migrate dev --name migration_name
``` 
Generate prisma client
```bash
bunx prisma generate
```
To run: 
```bash
bun run index.ts
```