import Constants from 'expo-constants'

export const GOOGLE_BOOKS_API_TOKEN = `${Constants?.expoConfig?.extra?.googleBooksKey}`

/**
 * Get Google Books API key
 * @returns a string that represents our Google Books API key
 */
export function getGoogleBooksKey(): string {
  return GOOGLE_BOOKS_API_TOKEN
}
