import Constants from 'expo-constants'

export const WEB3STORAGE_ACCESS_TOKEN = `${Constants?.expoConfig?.extra?.web3StorageKey}`
export function getIpfsClient(): string {
  return WEB3STORAGE_ACCESS_TOKEN
}
