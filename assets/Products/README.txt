Mahseri — product photos & CSV template
=======================================

CSV template:
  assets/Products/mahseri-products-template.csv
  Or admin → Bulk import → Download CSV template

Photo folders
-------------
Gold and silver — one folder per category inside each type:

  assets/Products/gold/bracelets/
  assets/Products/gold/necklaces/
  assets/Products/gold/rings/
  assets/Products/gold/earrings/
  assets/Products/gold/brooches/
  assets/Products/gold/nose-jewellery/
  assets/Products/gold/anklets/
  assets/Products/gold/leg-chains/
  assets/Products/gold/navel-rings/
  assets/Products/gold/full-set/
  assets/Products/gold/half-set/
  assets/Products/gold/3-piece-set/

  (same folders under assets/Products/silver/)

Gems — flat folder only:

  assets/Products/gems/

Drop a photo in the matching type + category folder. In admin, set
collection to gold, silver, or gems — the image path auto-matches.

Two ways to set the photo
-------------------------

A) Fill the image column in CSV:

  name,...,image,...
  Example Ring,...,assets/Products/gold/rings/Example Ring.jpg,...

B) Auto-match — leave image empty, name the file like the product:

  name:     Gold Lira Bracelet
  file:     assets/Products/gold/bracelets/Gold Lira Bracelet.jpg

Template columns
----------------
  name, name_ar, description, description_ar, weight, collection,
  category, material, gender, image, making_fee, badge, in_stock

  weight = grams (required for pricing)
  collection = gold | silver | gems
  in_stock = true | false

Tips
----
- Open the CSV in Excel, edit, save as CSV UTF-8, then Import in admin.
- Match spelling exactly between CSV name and filename when using auto-match.
- After adding photos, edit names, weights and prices in admin → Download data.js.
