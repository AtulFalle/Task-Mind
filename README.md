# TaskMindAI

TaskMindAI is a collaborative AI teaching and specialization platform. The MVP starts with Document Studio: workspaces, document upload, parsed text, annotations, operational rules, human corrections, and teaching memory.

## Workspace

- `apps/web`: Angular frontend.
- `apps/api`: future NestJS REST API.
- `apps/ai`: future FastAPI AI service.
- `libs/shared`: shared contracts and domain types.
- `libs/ui`: reusable Angular UI.
- `libs/config`: shared configuration helpers.
- `prisma`: Prisma schema, migrations, and seeds.
- `docker`: Docker Compose and container assets.
- `docs`: product and architecture notes.

## Nx Commands

Use Nx for project tasks:

```sh
node node_modules/nx/dist/bin/nx.js show projects
node node_modules/nx/dist/bin/nx.js serve web
node node_modules/nx/dist/bin/nx.js build web
node node_modules/nx/dist/bin/nx.js test web
node node_modules/nx/dist/bin/nx.js lint web
node node_modules/nx/dist/bin/nx.js serve api
node node_modules/nx/dist/bin/nx.js build api
node node_modules/nx/dist/bin/nx.js test api
node node_modules/nx/dist/bin/nx.js lint api
```

`npm exec nx ...` is preferred when the local npm shim is working.
