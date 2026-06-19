// app/dev-recommendation-service-check.tsx
// Dev-only page for Recipe Recommendation v0.2 service verification.

import React, { useState } from 'react'
import { Button, ScrollView, StyleSheet, Text, View } from 'react-native'
import {
  getPersonalizedRecipeRecommendations,
  rankRecipeRecommendations,
} from '@/services/recommendationService'
import { getRecommendationCandidates } from '@/services/recipeService'
import type { KitchenEquipmentKey, PantryItemKey } from '@/types/profile'
import type {
  RecipeRecommendationPreferences,
  RecipeRecommendationRunResult,
} from '@/types/recommendation'

type CheckStatus = 'idle' | 'running' | 'success' | 'error'

interface ScenarioInput {
  label: string
  preferences: RecipeRecommendationPreferences
  equipmentKeys: KitchenEquipmentKey[]
  pantryItemKeys: PantryItemKey[]
  fridgeIngredientKeys: string[]
}

const COMMON_EQUIPMENT_KEYS: KitchenEquipmentKey[] = [
  'stove_or_hotplate',
  'frying_pan_or_wok',
  'pot',
  'rice_cooker',
  'microwave',
]

const COMMON_PANTRY_KEYS: PantryItemKey[] = [
  'salt',
  'sugar',
  'cooking_oil',
  'soy_sauce',
  'light_soy_sauce',
  'black_vinegar',
]

const SCENARIOS: ScenarioInput[] = [
  {
    label: 'Beginner / under 30 / Chinese home',
    preferences: {
      dietaryRules: ['none'],
      avoidIngredientKeys: [],
      cuisinePreferences: ['chinese_home'],
      cookTimePreferenceKey: 'under_30',
      cookingSkill: 'beginner',
    },
    equipmentKeys: COMMON_EQUIPMENT_KEYS,
    pantryItemKeys: COMMON_PANTRY_KEYS,
    fridgeIngredientKeys: ['tomato', 'egg', 'broccoli', 'garlic', 'rice', 'scallion'],
  },
  {
    label: 'Vegan / basic equipment',
    preferences: {
      dietaryRules: ['vegan'],
      avoidIngredientKeys: [],
      cuisinePreferences: ['chinese_home', 'western_simple'],
      cookTimePreferenceKey: 'under_45',
      cookingSkill: 'beginner',
    },
    equipmentKeys: ['stove_or_hotplate', 'frying_pan_or_wok', 'pot'],
    pantryItemKeys: ['salt', 'sugar', 'cooking_oil', 'soy_sauce', 'black_vinegar'],
    fridgeIngredientKeys: ['tofu', 'broccoli', 'cabbage', 'mushroom', 'rice', 'garlic'],
  },
  {
    label: 'Avoid egg/tomato / sparse fridge',
    preferences: {
      dietaryRules: ['none'],
      avoidIngredientKeys: ['egg', 'tomato'],
      cuisinePreferences: ['chinese_home', 'sichuan'],
      cookTimePreferenceKey: 'under_30',
      cookingSkill: 'normal',
    },
    equipmentKeys: COMMON_EQUIPMENT_KEYS,
    pantryItemKeys: ['salt', 'sugar', 'cooking_oil', 'soy_sauce', 'black_vinegar'],
    fridgeIngredientKeys: ['tofu', 'cabbage', 'rice', 'garlic', 'scallion'],
  },
]

function summarizeRun(run: RecipeRecommendationRunResult) {
  return {
    totalCandidates: run.totalCandidates,
    eligibleCandidates: run.eligibleCandidates,
    filteredCandidates: run.filteredCandidates,
    warnings: run.warnings,
    recommendations: run.recommendations.map((item) => ({
      recipeKey: item.recipe.recipeKey,
      zhName: item.recipe.zhName,
      score: item.score,
      cuisineKey: item.recipe.cuisineKey,
      difficultyKey: item.recipe.difficultyKey,
      totalTimeMinutes: item.recipe.totalTimeMinutes,
      matchedCoreIngredients: item.matchedCoreIngredients,
      missingCoreIngredients: item.missingCoreIngredients,
      matchedPantryItems: item.matchedPantryItems,
      softConflicts: item.softConflicts,
      reasons: item.reasons,
      warnings: item.warnings,
    })),
  }
}

export default function DevRecommendationServiceCheck() {
  const [status, setStatus] = useState<CheckStatus>('idle')
  const [result, setResult] = useState<unknown | null>(null)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  const runRecommendationCheck = async () => {
    setStatus('running')
    setResult(null)
    setErrorMessage(null)

    try {
      const [candidates, personalizedRun] = await Promise.all([
        getRecommendationCandidates(),
        getPersonalizedRecipeRecommendations(8),
      ])
      const metadataReadyCount = candidates.filter((candidate) =>
        Boolean(candidate.recipe.recommendationMetadata?.preference_match)
      ).length
      const scenarioRuns = SCENARIOS.map((scenario) => ({
        label: scenario.label,
        ...summarizeRun(rankRecipeRecommendations({
          candidates,
          preferences: scenario.preferences,
          equipmentKeys: scenario.equipmentKeys,
          pantryItemKeys: scenario.pantryItemKeys,
          fridgeIngredientKeys: scenario.fridgeIngredientKeys,
          limit: 8,
        })),
      }))

      setResult({
        contentReadiness: {
          candidateCount: candidates.length,
          metadataReadyCount,
          expectedRecipeCount: 200,
          hasAllMetadata: candidates.length === metadataReadyCount,
        },
        personalizedRun: summarizeRun(personalizedRun),
        scenarioRuns,
      })
      setStatus('success')
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : 'Unknown recommendation service error')
      setStatus('error')
    }
  }

  return (
    <ScrollView style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>Recommendation Service Dev Check</Text>
        <Text style={styles.description}>
          Verifies Recipe Recommendation v0.2 with live candidates, current user data, and three mock scenarios.
        </Text>

        <View style={styles.buttonContainer}>
          <Button
            title="Run Recommendation Check"
            onPress={runRecommendationCheck}
            disabled={status === 'running'}
          />
        </View>

        <View style={styles.statusContainer}>
          <Text style={styles.statusLabel}>Status: </Text>
          <Text
            style={[
              styles.statusValue,
              status === 'idle' && styles.statusIdle,
              status === 'running' && styles.statusRunning,
              status === 'success' && styles.statusSuccess,
              status === 'error' && styles.statusError,
            ]}
          >
            {status}
          </Text>
        </View>

        {errorMessage && (
          <View style={styles.errorContainer}>
            <Text style={styles.errorTitle}>Error:</Text>
            <Text style={styles.errorMessage}>{errorMessage}</Text>
          </View>
        )}

        {result !== null && (
          <View style={styles.resultContainer}>
            <Text style={styles.resultTitle}>Result:</Text>
            <ScrollView horizontal style={styles.resultScroll}>
              <Text style={styles.resultJson}>{JSON.stringify(result, null, 2)}</Text>
            </ScrollView>
          </View>
        )}
      </View>
    </ScrollView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#141414',
  },
  content: {
    padding: 16,
  },
  title: {
    color: '#ffffff',
    fontSize: 24,
    fontWeight: '700',
    marginBottom: 8,
  },
  description: {
    color: '#cccccc',
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 20,
  },
  buttonContainer: {
    marginBottom: 16,
  },
  statusContainer: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  statusLabel: {
    color: '#ffffff',
    fontSize: 16,
  },
  statusValue: {
    fontSize: 16,
    fontWeight: '600',
  },
  statusIdle: {
    color: '#888888',
  },
  statusRunning: {
    color: '#ffaa00',
  },
  statusSuccess: {
    color: '#00cc66',
  },
  statusError: {
    color: '#ff4444',
  },
  errorContainer: {
    backgroundColor: 'rgba(255, 68, 68, 0.1)',
    borderColor: '#ff4444',
    borderRadius: 8,
    borderWidth: 1,
    marginBottom: 16,
    padding: 12,
  },
  errorTitle: {
    color: '#ff6666',
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 8,
  },
  errorMessage: {
    color: '#ffaaaa',
    fontSize: 14,
  },
  resultContainer: {
    backgroundColor: '#222222',
    borderRadius: 8,
    padding: 12,
  },
  resultTitle: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 8,
  },
  resultScroll: {
    maxHeight: 620,
  },
  resultJson: {
    color: '#dddddd',
    fontFamily: 'monospace',
    fontSize: 12,
    lineHeight: 18,
  },
})
