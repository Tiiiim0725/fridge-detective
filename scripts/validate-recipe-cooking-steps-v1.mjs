import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const repoRoot = path.resolve(__dirname, '..')

const imageManifestPath = path.join(repoRoot, 'docs/content/recipe_image_manifest_v0.1.csv')
const recipeContentPath = path.join(repoRoot, 'docs/content/recipe_content_v0.2.md')
const samplePath = path.join(repoRoot, 'docs/content/recipe_cooking_steps_samples_v1.json')
const outputManifestPath = path.join(repoRoot, 'docs/content/recipe_cooking_steps_manifest_v1.csv')

const bannedTerms = [
  '绝对安全',
  '一定熟了',
  '一定可食用',
  '一定不能吃',
  '变质',
  '建议丢弃',
]

const recommendedActionKeys = [
  'prep_ingredients',
  'wash_ingredients',
  'slice_vegetables',
  'cut_meat',
  'mix_sauce',
  'marinate',
  'beat_eggs',
  'boil_water',
  'cook_rice',
  'heat_pan',
  'add_oil',
  'saute_aromatics',
  'stir_fry',
  'pan_fry',
  'sear_meat',
  'scramble_eggs',
  'simmer',
  'boil_noodles',
  'steam',
  'microwave',
  'air_fry',
  'bake',
  'combine_ingredients',
  'toss_salad',
  'season',
  'plate_dish',
  'check_doneness',
  'rest_food',
]

function readText(filePath) {
  return fs.readFileSync(filePath, 'utf8').replace(/^\uFEFF/, '')
}

function parseCsvLine(line) {
  const cells = []
  let value = ''
  let inQuotes = false

  for (let index = 0; index < line.length; index += 1) {
    const char = line[index]
    const nextChar = line[index + 1]

    if (char === '"' && nextChar === '"') {
      value += '"'
      index += 1
      continue
    }

    if (char === '"') {
      inQuotes = !inQuotes
      continue
    }

    if (char === ',' && !inQuotes) {
      cells.push(value)
      value = ''
      continue
    }

    value += char
  }

  cells.push(value)
  return cells
}

function readImageManifest() {
  const lines = readText(imageManifestPath).trim().split(/\r?\n/)
  const headers = parseCsvLine(lines[0])

  return lines.slice(1).map((line) => {
    const cells = parseCsvLine(line)
    return Object.fromEntries(headers.map((header, index) => [header, cells[index] ?? '']))
  })
}

function readRecipeContentIndex() {
  const markdown = readText(recipeContentPath)
  const rows = new Map()

  for (const line of markdown.split(/\r?\n/)) {
    if (!line.startsWith('| ')) continue
    if (!line.includes('`')) continue

    const cells = line
      .split('|')
      .slice(1, -1)
      .map((cell) => cell.trim())

    if (cells.length < 8 || cells[0] === '#') continue

    const recipeKey = cells[1].replace(/`/g, '')
    rows.set(recipeKey, {
      sortOrder: cells[0],
      recipeKey,
      zhName: cells[2],
      cuisineKey: cells[3],
      mealType: cells[4],
      difficulty: cells[5],
      totalMinutes: cells[6],
      minimumRequiredIngredients: cells[7].replace(/`/g, ''),
    })
  }

  return rows
}

function csvEscape(value) {
  const text = String(value ?? '')
  return `"${text.replace(/"/g, '""')}"`
}

function targetStepRange(recipe) {
  const mealType = recipe.mealType
  const minutes = Number(recipe.totalMinutes)

  if (recipe.difficulty === 'confident' || minutes >= 35) return '12-18'
  if (['side', 'salad_light', 'sandwich_wrap', 'microwave', 'blender_breakfast'].includes(mealType)) return '4-6'
  if (recipe.difficulty === 'beginner' && mealType === 'stir_fry' && minutes <= 15) return '4-6'
  if (recipe.difficulty === 'beginner' && ['breakfast', 'air_fryer'].includes(mealType) && minutes <= 20) return '4-6'
  if (['stir_fry', 'fried_rice', 'rice_bowl', 'noodle', 'pasta', 'rice_cooker'].includes(mealType)) return '8-14'
  if (['soup_stew'].includes(mealType)) return '8-14'
  return '4-6'
}

function writeWorkingManifest() {
  const imageRows = readImageManifest()
  const recipeRows = readRecipeContentIndex()
  const outputRows = imageRows.map((imageRow) => {
    const recipe = recipeRows.get(imageRow.recipe_key)

    return {
      sort_order: imageRow.sort_order,
      recipe_key: imageRow.recipe_key,
      zh_name: imageRow.zh_name,
      en_name: imageRow.en_name,
      cuisine_key: recipe?.cuisineKey ?? '',
      meal_type: recipe?.mealType ?? '',
      difficulty: recipe?.difficulty ?? '',
      total_minutes: recipe?.totalMinutes ?? '',
      minimum_required_ingredients: recipe?.minimumRequiredIngredients ?? '',
      target_tutorial_step_range: recipe ? targetStepRange(recipe) : '',
      recipe_steps_status: 'todo',
      tutorial_steps_status: 'todo',
      needs_review: recipe ? 'false' : 'true',
      notes: recipe ? '' : 'missing in recipe_content_v0.2.md',
    }
  })

  const headers = [
    'sort_order',
    'recipe_key',
    'zh_name',
    'en_name',
    'cuisine_key',
    'meal_type',
    'difficulty',
    'total_minutes',
    'minimum_required_ingredients',
    'target_tutorial_step_range',
    'recipe_steps_status',
    'tutorial_steps_status',
    'needs_review',
    'notes',
  ]
  const csv = [
    headers.map(csvEscape).join(','),
    ...outputRows.map((row) => headers.map((header) => csvEscape(row[header])).join(',')),
  ].join('\n')

  fs.writeFileSync(outputManifestPath, `${csv}\n`)
  console.log(`Wrote ${outputRows.length} recipe rows to ${path.relative(repoRoot, outputManifestPath)}`)
}

function assert(condition, message, errors) {
  if (!condition) errors.push(message)
}

function charLength(text) {
  return Array.from(text ?? '').length
}

function checkText(text, context, errors) {
  for (const term of bannedTerms) {
    assert(!String(text).includes(term), `${context} contains banned term: ${term}`, errors)
  }
}

function validateStepSequence(steps, context, errors) {
  steps.forEach((step, index) => {
    assert(step.stepNumber === index + 1, `${context} has non-consecutive stepNumber at index ${index}`, errors)
  })
}

function validateSamples() {
  const samples = JSON.parse(readText(samplePath))
  const imageRecipeKeys = new Set(readImageManifest().map((row) => row.recipe_key))
  const actionKeys = samples.actionKeyPool.map((item) => item.actionKey)
  const actionKeySet = new Set(actionKeys)
  const errors = []
  const warnings = []

  assert(actionKeys.length >= 25 && actionKeys.length <= 40, `actionKeyPool has ${actionKeys.length} keys; expected 25-40`, errors)
  assert(actionKeySet.size === actionKeys.length, 'actionKeyPool has duplicate action keys', errors)

  for (const key of recommendedActionKeys) {
    assert(actionKeySet.has(key), `actionKeyPool missing recommended key: ${key}`, errors)
  }

  for (const recipe of samples.recipes ?? []) {
    const recipeContext = `recipe ${recipe.recipeKey}`
    assert(imageRecipeKeys.has(recipe.recipeKey), `${recipeContext} is not in the 200-recipe image manifest`, errors)
    assert(typeof recipe.needsReview === 'boolean', `${recipeContext} needsReview must be boolean`, errors)
    assert((recipe.tutorialSteps ?? []).length <= 18, `${recipeContext} has more than 18 tutorial steps`, errors)
    validateStepSequence(recipe.recipeSteps ?? [], `${recipeContext} recipeSteps`, errors)
    validateStepSequence(recipe.tutorialSteps ?? [], `${recipeContext} tutorialSteps`, errors)

    for (const [kind, steps] of [['recipeSteps', recipe.recipeSteps ?? []], ['tutorialSteps', recipe.tutorialSteps ?? []]]) {
      for (const step of steps) {
        const context = `${recipeContext} ${kind} step ${step.stepNumber}`
        const titleLength = charLength(step.title)
        const bodyLength = charLength(step.body)
        assert(titleLength >= 4 && titleLength <= 10, `${context} title length ${titleLength} outside 4-10`, errors)
        assert(bodyLength > 0, `${context} body is empty`, errors)
        assert(bodyLength <= 90, `${context} body length ${bodyLength} exceeds 90`, errors)
        if (bodyLength < 35 || bodyLength > 70) {
          warnings.push(`${context} body length ${bodyLength} outside recommended 35-70`)
        }
        checkText(step.title, `${context} title`, errors)
        checkText(step.body, `${context} body`, errors)

        if (kind === 'tutorialSteps') {
          assert(actionKeySet.has(step.actionKey), `${context} actionKey not in pool: ${step.actionKey}`, errors)
          checkText(step.assistantContext ?? '', `${context} assistantContext`, errors)
        }
      }
    }
  }

  if (warnings.length > 0) {
    console.warn(`Warnings (${warnings.length}):`)
    warnings.forEach((warning) => console.warn(`- ${warning}`))
  }

  if (errors.length > 0) {
    console.error(`Errors (${errors.length}):`)
    errors.forEach((error) => console.error(`- ${error}`))
    process.exitCode = 1
    return
  }

  console.log(`Validated ${samples.recipes.length} sample recipes and ${actionKeys.length} action keys.`)
}

if (process.argv.includes('--write-manifest')) {
  writeWorkingManifest()
}

validateSamples()
