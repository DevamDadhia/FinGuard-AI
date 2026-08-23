# FinGuard AI Frontend

Production-ready frontend for the FinGuard AI financial fraud detection and prevention system.

## Run locally

```bash
npm install
npm run dev
```

Create an optimized build with `npm run build` and preview it with `npm run preview`.

## Backend integration

All temporary display data is isolated in `src/mockData.ts`. Replace the placeholder implementations in `src/api.ts` with your FastAPI requests; page and component code does not need to change. The service exports `getAnalytics`, `getTransactions`, `getTransaction`, `getAlerts`, `predictTransaction`, and `sendAssistantMessage`.
