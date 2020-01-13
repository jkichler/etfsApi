## ETFs API

---

This App reads SPDR ETFs from www.spdrs.com​ and stores them in a Postgres DB

The app is sturctured in a way that most data should only be written once, and then only updated when the data changes. This is to minumize database data being overwritten when not necessay.

Some functions were written to sacrifice speed for low memeory usuage as it is being deployed on a free tier cloud provider.

Features:

- Authentication via /auth route (returns session cookie with 30min timeout)
- get all ETF by ticker via /api route (login session required)
- get ETF data via /api/:ticker route (login session required)

Requires Postgres database named etfapi

Install

```
clone the repository
npm install
npm run setup
npm run updateData
npm run start
```

Deployed API
https://etfsapi.herokuapp.com/api

POSTMAN Documentation Link

https://www.getpostman.com/collections/3535234a25aab0535d77

note: deployed api is slow on initial load due to free tier cloud provider
