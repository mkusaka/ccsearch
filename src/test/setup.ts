import '@testing-library/jest-dom'
import { afterAll, afterEach, beforeAll } from 'vitest'
import { setupServer } from 'msw/node'
import i18n from 'i18next'
import { initReactI18next } from 'react-i18next'

// MSW server setup
export const server = setupServer()

// i18n setup for tests
i18n.use(initReactI18next).init({
  lng: 'en',
  fallbackLng: 'en',
  resources: {
    en: {
      translation: {
        'session.types.conversation': 'Conversation',
        'session.types.codeGeneration': 'Code Generation',
        'session.types.debugging': 'Debugging',
        'session.types.questionAnswering': 'Q&A',
        'session.types.dataAnalysis': 'Data Analysis',
        'session.messages': 'messages',
        'session.duration': 'Duration',
      },
    },
  },
  interpolation: {
    escapeValue: false,
  },
})

beforeAll(() => {
  server.listen({ onUnhandledRequest: 'error' })
})

afterEach(() => {
  server.resetHandlers()
})

afterAll(() => {
  server.close()
})