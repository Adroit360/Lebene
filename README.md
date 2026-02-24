# Restaurant-Webapp

## Backend setup (Sequelize + MySQL)

1. Go to `backend` and install dependencies.
2. Create a `.env` file from `backend/.env.example`.
3. Set DB values:
   - `DB_NAME=databases_lebenenew`
   - `DB_USER=databases_albert`
   - `DB_PASSWORD=stayReady;@12`
   - `DB_HOST=databases.adroit360.com`
   - `DB_SSL=true`
4. Set your Paystack key in `API_KEY`.
5. Sync schema (adds/updates columns and tables):
   - `npm run db:sync`
6. Start backend with `npm start`.

### Import old orders JSON into MySQL

If you exported Firestore orders to a JSON array (sample format with fields like `id`, `orderId`, `foodOrdered`, `numberOfPacks`, etc.), run:

- `npm run db:import-orders -- --file /absolute/path/to/orders.json`

Notes:

- Import uses `orderId` as the upsert key.
- Firestore `id` is stored as `legacyId` in MySQL.
- API response keeps `Id` as the MySQL primary key, and also returns `legacyId`.

## Frontend setup

1. Go to `restaurant-website` and install dependencies.
2. If npm reports peer resolution conflicts, use legacy peer mode:
   - `npm install --legacy-peer-deps`
3. Build with `npm run build`.

## Migration note

Firestore CRUD has been migrated to backend REST APIs backed by Sequelize/MySQL. Firebase Auth remains in place for login/guard flows.
