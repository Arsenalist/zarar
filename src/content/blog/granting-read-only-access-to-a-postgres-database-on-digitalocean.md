---
title: "Granting read only access to a Postgres database on DigitalOcean"
date: 2025-11-24T21:02Z
---

The [docs may say this](https://docs.digitalocean.com/products/databases/postgresql/how-to/modify-user-privileges/):

```
REVOKE ALL ON DATABASE example_database FROM example_user;
GRANT CONNECT ON DATABASE example_database TO example_user;
GRANT SELECT ON ALL TABLES IN SCHEMA public TO example_user;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT SELECT ON TABLES TO example_user;
```

But the docs miss this:

```
GRANT USAGE ON SCHEMA public TO example_user;
```

They're assuming the default `USAGE` on public is still in place. In PostgreSQL 14 and earlier, the public schema had different defaults but in PostgreSQL 15 they tightened it and didn't update the docs (at the time of this post).
