#!/usr/bin/env node

const fs = require('fs')
const path = require('path')
const { createClient } = require('@supabase/supabase-js')

const DEFAULT_SEED_PATH = path.join('supabase', 'seeds', 'recipe_seed_v0.2.sql')
const DEFAULT_BUCKET = 'recipe-images'
const DEFAULT_PREFIX = 'cards'

function readArg(name, fallback = null) {
  const index = process.argv.indexOf(name)
  if (index >= 0 && process.argv[index + 1]) {
    return process.argv[index + 1]
  }
  return fallback
}

function requireArg(name) {
  const value = readArg(name)
  if (!value) {
    throw new Error(`Missing required argument: ${name}`)
  }
  return value
}

function parseEnvFile(envPath) {
  if (!fs.existsSync(envPath)) {
    return {}
  }

  const env = {}
  const lines = fs.readFileSync(envPath, 'utf8').split(/\r?\n/)
  for (const line of lines) {
    const trimmed = line.trim()
    if (!trimmed || trimmed.startsWith('#')) {
      continue
    }
    const equalsIndex = trimmed.indexOf('=')
    if (equalsIndex <= 0) {
      continue
    }
    env[trimmed.slice(0, equalsIndex)] = trimmed.slice(equalsIndex + 1)
  }
  return env
}

function parseRecipes(seedPath) {
  const sql = fs.readFileSync(seedPath, 'utf8')
  const start = sql.indexOf('insert into public.recipes')
  const end = sql.indexOf('on conflict (recipe_key)', start)

  if (start < 0 || end < 0) {
    throw new Error(`Could not find public.recipes insert block in ${seedPath}`)
  }

  const block = sql.slice(start, end)
  const recipes = []
  const linePattern = /^\s*\('([^']+)'\s*,\s*'([^']+)'\s*,/gm
  let match = linePattern.exec(block)

  while (match) {
    recipes.push({
      recipeKey: match[1],
      zhName: match[2],
    })
    match = linePattern.exec(block)
  }

  return recipes
}

function normalizeImageName(fileName) {
  return path.basename(fileName, path.extname(fileName)).trim()
}

function publicObjectUrl(supabaseUrl, bucket, objectPath) {
  return `${supabaseUrl.replace(/\/$/, '')}/storage/v1/object/public/${bucket}/${objectPath}`
}

async function main() {
  const sourceDir = requireArg('--source')
  const seedPath = readArg('--seed', DEFAULT_SEED_PATH)
  const bucket = readArg('--bucket', DEFAULT_BUCKET)
  const prefix = readArg('--prefix', DEFAULT_PREFIX).replace(/^\/+|\/+$/g, '')
  const dryRun = process.argv.includes('--dry-run')
  const env = parseEnvFile('.env')
  const supabaseUrl = readArg('--supabase-url', process.env.EXPO_PUBLIC_SUPABASE_URL ?? env.EXPO_PUBLIC_SUPABASE_URL)
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY

  if (!supabaseUrl) {
    throw new Error('Missing Supabase URL. Pass --supabase-url or set EXPO_PUBLIC_SUPABASE_URL in .env.')
  }

  if (!dryRun && !serviceRoleKey) {
    throw new Error('Missing SUPABASE_SERVICE_ROLE_KEY. Set it only as a temporary local environment variable, never in .env.')
  }

  if (!fs.existsSync(sourceDir)) {
    throw new Error(`Source directory does not exist: ${sourceDir}`)
  }

  const recipes = parseRecipes(seedPath)
  const recipeByZhName = new Map(recipes.map((recipe) => [recipe.zhName, recipe]))
  const files = fs.readdirSync(sourceDir)
    .filter((fileName) => fileName.toLowerCase().endsWith('.png'))
    .sort((a, b) => a.localeCompare(b, 'zh-Hans-CN'))

  const matched = []
  const unmatchedFiles = []

  for (const fileName of files) {
    const imageName = normalizeImageName(fileName)
    const recipe = recipeByZhName.get(imageName)

    if (!recipe) {
      unmatchedFiles.push(fileName)
      continue
    }

    const objectPath = `${prefix}/${recipe.recipeKey}.png`
    matched.push({
      ...recipe,
      fileName,
      localPath: path.resolve(sourceDir, fileName),
      objectPath,
      imageUrl: publicObjectUrl(supabaseUrl, bucket, objectPath),
    })
  }

  if (unmatchedFiles.length > 0) {
    throw new Error(`Unmatched image files:\n${unmatchedFiles.join('\n')}`)
  }

  console.log(JSON.stringify({
    dryRun,
    sourceDir,
    totalRecipes: recipes.length,
    imageFiles: files.length,
    matched: matched.length,
    missingRecipeCount: recipes.length - matched.length,
  }, null, 2))

  if (dryRun) {
    return
  }

  const supabase = createClient(supabaseUrl, serviceRoleKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  })

  let index = 0
  for (const item of matched) {
    index += 1
    const body = fs.readFileSync(item.localPath)

    const { error: uploadError } = await supabase.storage
      .from(bucket)
      .upload(item.objectPath, body, {
        cacheControl: '31536000',
        contentType: 'image/png',
        upsert: true,
      })

    if (uploadError) {
      throw new Error(`Upload failed for ${item.fileName}: ${uploadError.message}`)
    }

    console.log(`${index}/${matched.length} ${item.zhName} -> ${item.objectPath}`)
  }

  console.log('Upload finished. Run supabase db query --linked -f supabase/.temp/recipe-image-import/update-recipe-image-urls.sql to update recipe image URLs.')
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : String(error))
  process.exit(1)
})
