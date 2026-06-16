Mahseri — product photos & CSV template
=======================================

CSV template (all columns):
  assets/products/mahseri-products-template.csv
  Or admin → Bulk import → Download CSV template

Two ways to set the photo
-------------------------

A) Original template — fill the image column:

  name,...,image,...
  Example Ring,...,assets/products/rings/Example Ring.jpg,...

  Old paths still work too, e.g. assets/Pictures/my-photo.jpeg

B) Auto-match — leave image empty, name the file like the product:

  name:     Gold Lira Bracelet
  file:     assets/products/bracelets/Gold Lira Bracelet.jpg

Category folders
----------------
  Bracelets          assets/products/bracelets/
  Rings              assets/products/rings/
  Necklaces          assets/products/necklaces/
  Earrings           assets/products/earrings/
  Brooches           assets/products/brooches/
  Nose Jewellery     assets/products/nose-jewellery/
  Anklets            assets/products/anklets/
  Leg Chains         assets/products/leg-chains/
  Navel Rings        assets/products/navel-rings/
  Full Set           assets/products/full-set/
  Half Set           assets/products/half-set/
  3 Piece Set        assets/products/3-piece-set/
  Gems (Ruby, etc.)   assets/products/gems/
  Other              assets/products/misc/

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
- Delete the two example rows in the template before importing your real products.
- Match spelling exactly between CSV name and filename when using auto-match.
