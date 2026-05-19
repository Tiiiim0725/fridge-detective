-- User Profile / Onboarding Foundation v0.1
-- Migration: 001_user_profile_module.sql

-- 1. Enable pgcrypto extension
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- 2. Create or replace updated_at trigger function
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 3. Create profiles table
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  display_name TEXT NULL,
  avatar_url TEXT NULL,
  onboarding_status TEXT NOT NULL DEFAULT 'not_started',
  onboarding_completed_at TIMESTAMPTZ NULL,
  is_anonymous_snapshot BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  CONSTRAINT profiles_onboarding_status_check
    CHECK (onboarding_status IN ('not_started', 'in_progress', 'completed'))
);

-- 4. Create user_preferences table
CREATE TABLE public.user_preferences (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  portion_size TEXT NULL,
  spice_level TEXT NULL,
  saltiness TEXT NULL,
  cuisine_preferences TEXT[] NOT NULL DEFAULT '{}',
  meal_style_preferences TEXT[] NOT NULL DEFAULT '{}',
  diet_tags TEXT[] NOT NULL DEFAULT '{}',
  disliked_ingredient_keys TEXT[] NOT NULL DEFAULT '{}',
  allergen_keys TEXT[] NOT NULL DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  CONSTRAINT user_preferences_user_id_unique UNIQUE (user_id),
  CONSTRAINT user_preferences_portion_size_check
    CHECK (portion_size IS NULL OR portion_size IN ('small', 'normal', 'large')),
  CONSTRAINT user_preferences_spice_level_check
    CHECK (spice_level IS NULL OR spice_level IN ('none', 'mild', 'medium', 'hot')),
  CONSTRAINT user_preferences_saltiness_check
    CHECK (saltiness IS NULL OR saltiness IN ('light', 'normal', 'salty')),
  CONSTRAINT user_preferences_cuisine_preferences_check
    CHECK (
      cuisine_preferences <@ ARRAY[
        'chinese', 'western', 'korean', 'japanese', 'italian', 'mexican', 'southeast_asian', 'no_preference'
      ]::TEXT[]
      AND NOT (
        'no_preference' = ANY(cuisine_preferences)
        AND array_length(cuisine_preferences, 1) > 1
      )
    ),
  CONSTRAINT user_preferences_meal_style_preferences_check
    CHECK (meal_style_preferences <@ ARRAY[
      'quick_easy', 'budget', 'healthy_light', 'high_protein', 'one_pot', 'low_cleanup', 'comfort_food', 'meal_prep'
    ]::TEXT[]),
  CONSTRAINT user_preferences_diet_tags_check
    CHECK (diet_tags <@ ARRAY[
      'vegetarian', 'vegan', 'no_pork', 'no_beef', 'no_lamb', 'no_seafood', 'no_alcohol'
    ]::TEXT[]),
  CONSTRAINT user_preferences_disliked_ingredient_keys_check
    CHECK (disliked_ingredient_keys <@ ARRAY[
      'cilantro', 'green_onion', 'garlic', 'onion', 'ginger', 'mushroom', 'eggplant', 'tomato', 'egg', 'tofu', 'cheese', 'seafood', 'spicy_food'
    ]::TEXT[]),
  CONSTRAINT user_preferences_allergen_keys_check
    CHECK (allergen_keys <@ ARRAY[
      'peanut', 'tree_nut', 'shellfish', 'fish', 'egg', 'milk', 'soy', 'wheat', 'sesame'
    ]::TEXT[]),
  CONSTRAINT user_preferences_cuisine_preferences_length_check
    CHECK (array_length(cuisine_preferences, 1) IS NULL OR array_length(cuisine_preferences, 1) <= 10),
  CONSTRAINT user_preferences_meal_style_preferences_length_check
    CHECK (array_length(meal_style_preferences, 1) IS NULL OR array_length(meal_style_preferences, 1) <= 10),
  CONSTRAINT user_preferences_diet_tags_length_check
    CHECK (array_length(diet_tags, 1) IS NULL OR array_length(diet_tags, 1) <= 10),
  CONSTRAINT user_preferences_disliked_ingredient_keys_length_check
    CHECK (array_length(disliked_ingredient_keys, 1) IS NULL OR array_length(disliked_ingredient_keys, 1) <= 20),
  CONSTRAINT user_preferences_allergen_keys_length_check
    CHECK (array_length(allergen_keys, 1) IS NULL OR array_length(allergen_keys, 1) <= 15)
);

-- 5. Create kitchen_equipment table
CREATE TABLE public.kitchen_equipment (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  equipment_key TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  CONSTRAINT kitchen_equipment_user_id_equipment_key_unique UNIQUE (user_id, equipment_key),
  CONSTRAINT kitchen_equipment_equipment_key_check
    CHECK (equipment_key IN (
      'pot', 'pan', 'wok', 'saucepan', 'baking_tray', 'rice_cooker', 'air_fryer', 'oven', 'microwave', 'blender', 'toaster', 'knife', 'cutting_board', 'spatula', 'ladle', 'tongs', 'mixing_bowl', 'peeler', 'measuring_cup'
    ))
);

-- 6. Create pantry_items table
CREATE TABLE public.pantry_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  pantry_item_key TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  CONSTRAINT pantry_items_user_id_pantry_item_key_unique UNIQUE (user_id, pantry_item_key),
  CONSTRAINT pantry_items_pantry_item_key_check
    CHECK (pantry_item_key IN (
      'cooking_oil', 'olive_oil', 'sesame_oil', 'butter', 'salt', 'sugar', 'black_pepper', 'white_pepper', 'soy_sauce', 'dark_soy_sauce', 'vinegar', 'oyster_sauce', 'ketchup', 'mayonnaise', 'mustard', 'hot_sauce', 'chili_flakes', 'chili_oil', 'cumin', 'curry_powder', 'garlic_powder', 'paprika', 'doubanjiang', 'gochujang', 'miso', 'chili_crisp', 'rice', 'pasta', 'noodles', 'instant_noodles', 'flour', 'cornstarch', 'breadcrumbs', 'canned_tuna', 'canned_corn', 'canned_tomato', 'frozen_vegetables', 'frozen_dumplings'
    ))
);

-- 7. Indexes
CREATE INDEX IF NOT EXISTS idx_profiles_created_at ON public.profiles(created_at);
CREATE INDEX IF NOT EXISTS idx_user_preferences_user_id ON public.user_preferences(user_id);
CREATE INDEX IF NOT EXISTS idx_kitchen_equipment_user_id ON public.kitchen_equipment(user_id);
CREATE INDEX IF NOT EXISTS idx_pantry_items_user_id ON public.pantry_items(user_id);

-- 8. Add updated_at triggers
CREATE TRIGGER trigger_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.set_updated_at();

CREATE TRIGGER trigger_user_preferences_updated_at
  BEFORE UPDATE ON public.user_preferences
  FOR EACH ROW
  EXECUTE FUNCTION public.set_updated_at();

CREATE TRIGGER trigger_kitchen_equipment_updated_at
  BEFORE UPDATE ON public.kitchen_equipment
  FOR EACH ROW
  EXECUTE FUNCTION public.set_updated_at();

CREATE TRIGGER trigger_pantry_items_updated_at
  BEFORE UPDATE ON public.pantry_items
  FOR EACH ROW
  EXECUTE FUNCTION public.set_updated_at();

-- 9. Enable RLS
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_preferences ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.kitchen_equipment ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pantry_items ENABLE ROW LEVEL SECURITY;

-- 10. RLS Policies for profiles
CREATE POLICY profiles_select_policy ON public.profiles
  FOR SELECT TO authenticated
  USING ((SELECT auth.uid()) = id);

CREATE POLICY profiles_insert_policy ON public.profiles
  FOR INSERT TO authenticated
  WITH CHECK ((SELECT auth.uid()) = id);

CREATE POLICY profiles_update_policy ON public.profiles
  FOR UPDATE TO authenticated
  USING ((SELECT auth.uid()) = id)
  WITH CHECK ((SELECT auth.uid()) = id);

CREATE POLICY profiles_delete_policy ON public.profiles
  FOR DELETE TO authenticated
  USING ((SELECT auth.uid()) = id);

-- 11. RLS Policies for user_preferences
CREATE POLICY user_preferences_select_policy ON public.user_preferences
  FOR SELECT TO authenticated
  USING ((SELECT auth.uid()) = user_id);

CREATE POLICY user_preferences_insert_policy ON public.user_preferences
  FOR INSERT TO authenticated
  WITH CHECK ((SELECT auth.uid()) = user_id);

CREATE POLICY user_preferences_update_policy ON public.user_preferences
  FOR UPDATE TO authenticated
  USING ((SELECT auth.uid()) = user_id)
  WITH CHECK ((SELECT auth.uid()) = user_id);

CREATE POLICY user_preferences_delete_policy ON public.user_preferences
  FOR DELETE TO authenticated
  USING ((SELECT auth.uid()) = user_id);

-- 12. RLS Policies for kitchen_equipment
CREATE POLICY kitchen_equipment_select_policy ON public.kitchen_equipment
  FOR SELECT TO authenticated
  USING ((SELECT auth.uid()) = user_id);

CREATE POLICY kitchen_equipment_insert_policy ON public.kitchen_equipment
  FOR INSERT TO authenticated
  WITH CHECK ((SELECT auth.uid()) = user_id);

CREATE POLICY kitchen_equipment_update_policy ON public.kitchen_equipment
  FOR UPDATE TO authenticated
  USING ((SELECT auth.uid()) = user_id)
  WITH CHECK ((SELECT auth.uid()) = user_id);

CREATE POLICY kitchen_equipment_delete_policy ON public.kitchen_equipment
  FOR DELETE TO authenticated
  USING ((SELECT auth.uid()) = user_id);

-- 13. RLS Policies for pantry_items
CREATE POLICY pantry_items_select_policy ON public.pantry_items
  FOR SELECT TO authenticated
  USING ((SELECT auth.uid()) = user_id);

CREATE POLICY pantry_items_insert_policy ON public.pantry_items
  FOR INSERT TO authenticated
  WITH CHECK ((SELECT auth.uid()) = user_id);

CREATE POLICY pantry_items_update_policy ON public.pantry_items
  FOR UPDATE TO authenticated
  USING ((SELECT auth.uid()) = user_id)
  WITH CHECK ((SELECT auth.uid()) = user_id);

CREATE POLICY pantry_items_delete_policy ON public.pantry_items
  FOR DELETE TO authenticated
  USING ((SELECT auth.uid()) = user_id);
