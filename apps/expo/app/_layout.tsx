import React from 'react'
import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native'
import {
  Provider as ProviderUniversalUI,
  ProviderMagicWallet,
  ProviderPolybase,
} from 'app/provider'
import { getWalletClient } from 'app/helpers'
import { magic } from '../config'
import { useFonts } from 'expo-font'
import { usePathname, Tabs } from 'expo-router'
import { useColorScheme } from 'react-native'
import { SafeAreaProvider } from 'react-native-safe-area-context'
import { POLYBASE_DEFAULT_NAMESPACE, defaultPolybaseDb } from '../config/polybase'
import RootLevelNavigator from '../navigation/RootLevelNavigator'

const walletClient = getWalletClient(magic)

export default function HomeLayout() {
  const pathname = usePathname()
  const [loaded] = useFonts({
    Inter: require('@tamagui/font-inter/otf/Inter-Medium.otf'),
    InterBold: require('@tamagui/font-inter/otf/Inter-Bold.otf'),
  })
  const scheme = useColorScheme()
  if (!loaded) {
    return null
  }
  return (
    <ProviderUniversalUI>
      <ThemeProvider value={scheme === 'dark' ? DarkTheme : DefaultTheme}>
        <ProviderPolybase defaultNamespace={POLYBASE_DEFAULT_NAMESPACE} db={defaultPolybaseDb}>
          <SafeAreaProvider>
            <magic.Relayer />
            {/** @ts-ignore */}
            <ProviderMagicWallet
              redirectURI="hearthsidehangouts://home"
              walletClient={walletClient}
              magic={magic}
            >
              <RootLevelNavigator />
            </ProviderMagicWallet>
          </SafeAreaProvider>
        </ProviderPolybase>
      </ThemeProvider>
    </ProviderUniversalUI>
  )
}
