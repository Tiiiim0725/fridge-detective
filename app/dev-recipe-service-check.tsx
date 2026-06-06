// app/dev-recipe-service-check.tsx
// Dev-only page for Recipe / Ingredient Foundation v0.1 service verification.

import React, { useState } from 'react'
import { Button, ScrollView, StyleSheet, Text, View } from 'react-native'
import {
  getIngredientDictionary,
  normalizeIngredientName,
  normalizeRecognizedIngredients,
} from '@/services/ingredientService'
import {
  getActiveRecipes,
  getRecommendationCandidates,
  getRecipeDetail,
} from '@/services/recipeService'

type CheckStatus = 'idle' | 'running' | 'success' | 'error'

export default function DevRecipeServiceCheck() {
  const [status, setStatus] = useState<CheckStatus>('idle')
  const [result, setResult] = useState<unknown | null>(null)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  const runRecipeServiceCheck = async () => {
    setStatus('running')
    setResult(null)
    setErrorMessage(null)

    try {
      const [
        ingredientDictionary,
        normalizedTomato,
        normalizedRecognizedIngredients,
        activeRecipes,
        recommendationCandidates,
        tomatoEggDetail,
      ] = await Promise.all([
        getIngredientDictionary(),
        normalizeIngredientName('西红柿'),
        normalizeRecognizedIngredients([
          '西红柿',
          'egg',
          '剩米饭',
          {
            name: 'salmon',
            quantityText: '1 piece',
            confidence: 0.92,
          },
          'unknown test item',
        ]),
        getActiveRecipes(),
        getRecommendationCandidates(),
        getRecipeDetail('tomato_egg_stir_fry'),
      ])

      setResult({
        ingredientCount: ingredientDictionary.length,
        normalizedTomato,
        normalizedRecognizedIngredients,
        activeRecipeKeys: activeRecipes.map((recipe) => recipe.recipeKey),
        candidateSummaries: recommendationCandidates.map((candidate) => ({
          recipeKey: candidate.recipe.recipeKey,
          ingredientCount: candidate.ingredients.length,
          toolCount: candidate.tools.length,
          substitutionCount: candidate.substitutions.length,
        })),
        tomatoEggDetail: {
          recipeKey: tomatoEggDetail.recipe.recipeKey,
          ingredientKeys: tomatoEggDetail.ingredients.map((item) => item.ingredientKey),
          toolKeys: tomatoEggDetail.tools.map((tool) => tool.equipmentKey),
          stepCount: tomatoEggDetail.steps.length,
        },
      })
      setStatus('success')
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : 'Unknown recipe service error')
      setStatus('error')
    }
  }

  return (
    <ScrollView style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>Recipe Service Dev Check</Text>
        <Text style={styles.description}>
          Verifies ingredient dictionary, alias normalization, recommendation candidates, and recipe detail.
        </Text>

        <View style={styles.buttonContainer}>
          <Button
            title="Run Recipe Service Check"
            onPress={runRecipeServiceCheck}
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
    maxHeight: 520,
  },
  resultJson: {
    color: '#dddddd',
    fontFamily: 'monospace',
    fontSize: 12,
    lineHeight: 18,
  },
})
