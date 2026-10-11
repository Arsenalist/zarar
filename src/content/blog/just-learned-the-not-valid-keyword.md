---
title: "Just learned the NOT VALID keyword"
date: 2026-09-24T11:34Z
---

After decades of working with databases I didn't know that `NOT VALID` was a thing:

```
ALTER TABLE line_item  
ADD CONSTRAINT line_item_variant_price_id_fkey  
FOREIGN KEY (variant_price_id) 
REFERENCES variant_prices(id) NOT VALID
```

This is for cases when you want to add a foreign key to an existing column except that column contains data that would violate a foreign key constraint (e.g., an invalid deleted ID).

I used to rely on nulling this out, but when working with Claude today, it proposed this solution which I found kind of nice. Not that I will make use of those invalid `variant_price_id` values since the associated record is gone, but at least I can tell which old line items used to have a price.
