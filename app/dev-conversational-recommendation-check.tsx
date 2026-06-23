// app/dev-conversational-recommendation-check.tsx
// Dev-only page for conversational recommendation backend/service verification.

import React, { useState } from 'react'
import {
  Button,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native'

import { getConversationalRecipeRecommendations } from '@/services/conversationalRecommendationService'
import type { ConversationalRecipeRecommendationResult } from '@/types/conversationalRecommendation'

type CheckStatus = 'idle' | 'running' | 'success' | 'error'

function summarizeResult(result: ConversationalRecipeRecommendationResult) {
  return {
    fallbackUsed: result.fallbackUsed,
    errorCode: result.errorCode,
    warningMessage: result.warningMessage,
    intentSummary: result.intentSummary,
    parsedIntent: result.parsedIntent,
    conversationId: result.conversationId,
    recommendations: result.recommendations.map((item) => ({
      recipeKey: item.recipe.recipeKey,
      zhName: item.recipe.zhName,
      score: item.score,
      aiReason: item.aiReason,
      totalTimeMinutes: item.recipe.totalTimeMinutes,
      matchedCoreIngredients: item.matchedCoreIngredients,
      missingCoreIngredients: item.missingCoreIngredients,
    })),
  }
}

export default function DevConversationalRecommendationCheck() {
  const [message, setMessage] = useState('今天不想吃鸡蛋，想要半小时内的清淡晚饭')
  const [status, setStatus] = useState<CheckStatus>('idle')
  const [result, setResult] = useState<unknown | null>(null)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  async function runCheck() {
    setStatus('running')
    setResult(null)
    setErrorMessage(null)

    try {
      const response = await getConversationalRecipeRecommendations({
        message,
        conversationId: 'dev-check',
        limit: 5,
      })

      setResult(summarizeResult(response))
      setStatus('success')
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : String(error))
      setStatus('error')
    }
  }

  return (
    <ScrollView style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>Conversational Recommendation Dev Check</Text>
        <Text style={styles.description}>
          Dev-only service check. This page does not represent the production recommendation UI.
        </Text>

        <TextInput
          value={message}
          onChangeText={setMessage}
          multiline
          placeholder="描述你现在想吃什么"
          placeholderTextColor="#888"
          style={styles.input}
        />

        <View style={styles.buttonContainer}>
          <Button
            title="Run Conversational Recommendation"
            onPress={runCheck}
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

        {errorMessage ? (
          <View style={styles.errorContainer}>
            <Text style={styles.errorTitle}>Error:</Text>
            <Text style={styles.errorMessage}>{errorMessage}</Text>
          </View>
        ) : null}

        {result !== null ? (
          <View style={styles.resultContainer}>
            <Text style={styles.resultTitle}>Result:</Text>
            <ScrollView horizontal style={styles.resultScroll}>
              <Text style={styles.resultJson}>{JSON.stringify(result, null, 2)}</Text>
            </ScrollView>
          </View>
        ) : null}
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
    color: '#c9c9c9',
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 16,
  },
  input: {
    backgroundColor: '#222',
    borderColor: '#444',
    borderRadius: 8,
    borderWidth: 1,
    color: '#fff',
    minHeight: 92,
    padding: 12,
    textAlignVertical: 'top',
  },
  buttonContainer: {
    marginTop: 16,
  },
  statusContainer: {
    flexDirection: 'row',
    marginTop: 16,
  },
  statusLabel: {
    color: '#ffffff',
    fontWeight: '700',
  },
  statusValue: {
    fontWeight: '700',
  },
  statusIdle: {
    color: '#a8a8a8',
  },
  statusRunning: {
    color: '#f5c542',
  },
  statusSuccess: {
    color: '#5cd85c',
  },
  statusError: {
    color: '#ff6b6b',
  },
  errorContainer: {
    backgroundColor: '#3a1f1f',
    borderRadius: 8,
    marginTop: 16,
    padding: 12,
  },
  errorTitle: {
    color: '#ff9b9b',
    fontWeight: '700',
    marginBottom: 4,
  },
  errorMessage: {
    color: '#ffd1d1',
  },
  resultContainer: {
    marginTop: 16,
  },
  resultTitle: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 8,
  },
  resultScroll: {
    backgroundColor: '#1f1f1f',
    borderRadius: 8,
    padding: 12,
  },
  resultJson: {
    color: '#d8d8d8',
    fontFamily: 'monospace',
    fontSize: 12,
  },
})
