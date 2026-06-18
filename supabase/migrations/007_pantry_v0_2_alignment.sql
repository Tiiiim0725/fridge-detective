-- Pantry v0.2 alignment
-- Keep pantry_items as user-owned pantry availability, while aligning allowed keys
-- with Content v0.2 profile options.

alter table public.pantry_items
  drop constraint if exists pantry_items_pantry_item_key_check;

alter table public.pantry_items
  add constraint pantry_items_pantry_item_key_check
    check (pantry_item_key in (
      'cooking_oil',
      'olive_oil',
      'sesame_oil',
      'butter',
      'salt',
      'sugar',
      'black_pepper',
      'white_pepper',
      'soy_sauce',
      'dark_soy_sauce',
      'vinegar',
      'oyster_sauce',
      'cooking_wine',
      'ketchup',
      'mayonnaise',
      'mustard',
      'hot_sauce',
      'chili_flakes',
      'chili_oil',
      'cumin',
      'curry_powder',
      'garlic_powder',
      'paprika',
      'doubanjiang',
      'gochujang',
      'miso',
      'chili_crisp',
      'pasta_sauce',
      'curry_blocks',
      'rice',
      'pasta',
      'noodles',
      'instant_noodles',
      'flour',
      'cornstarch',
      'breadcrumbs',
      'canned_tuna',
      'canned_corn',
      'canned_tomato',
      'frozen_vegetables',
      'frozen_dumplings'
    ));
