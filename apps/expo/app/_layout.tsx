import React from 'react'
import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native'
import { Provider as ProviderUniversalUI, ProviderMagicWallet, ProviderPolybase} from 'app/provider'
import { getWalletClient } from 'app/helpers'
import { magic } from '../config'
import { useFonts } from 'expo-font'
import { Stack } from 'expo-router'
import { useColorScheme } from 'react-native'
import { SafeAreaProvider } from 'react-native-safe-area-context'
import { POLYBASE_DEFAULT_NAMESPACE, defaultPolybaseDb } from '../config/polybase'

const walletClient = getWalletClient(magic)

export default function HomeLayout() {
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
          {/* Render the Magic iframe! */}
          <magic.Relayer />    
          <ProviderMagicWallet walletClient={walletClient} magic={magic}>
            <Stack />
          </ProviderMagicWallet>
          </SafeAreaProvider>
          </ProviderPolybase>
        </ThemeProvider>
    </ProviderUniversalUI>
  )
}
