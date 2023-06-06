import { Magic } from '@magic-sdk/react-native-expo'
import { OAuthExtension } from '@magic-ext/react-native-expo-oauth'
// import { AuthExtension } from '@magic-ext/auth'; // using this package leads to an error
// @todo: upgrade `@magic-ext/auth` whenever a fix is available

import Constants from 'expo-constants'

export const magic = new Magic(`${Constants?.expoConfig?.extra?.magicKey}`, {
  extensions: [
    // new AuthExtension(),
    new OAuthExtension(),
  ],
})
