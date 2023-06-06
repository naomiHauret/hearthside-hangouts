import { getDefaultDb } from 'app/helpers'
import Constants from 'expo-constants'

export const POLYBASE_DEFAULT_NAMESPACE = `${Constants?.expoConfig?.extra?.polybaseDb}`
export const defaultPolybaseDb = getDefaultDb(POLYBASE_DEFAULT_NAMESPACE)
