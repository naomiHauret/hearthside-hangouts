import React from 'react'
import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native'
import {
  Provider as ProviderUniversalUI,
  ProviderMagicWallet,
  ProviderPolybase,
  ProviderIPFS,
} from 'app/provider'
import { getWalletClient } from 'app/helpers'
import { useFonts } from 'expo-font'
import { usePathname, Tabs } from 'expo-router'
import { useColorScheme } from 'react-native'
import { SafeAreaProvider } from 'react-native-safe-area-context'
import { POLYBASE_DEFAULT_NAMESPACE, defaultPolybaseDb, magic, getIpfsClient } from '../config'
import RootLevelNavigator from '../navigation/RootLevelNavigator'

//@ts-ignore
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
        <ProviderIPFS web3StorageAccessToken={getIpfsClient()}>
          <ProviderPolybase defaultNamespace={POLYBASE_DEFAULT_NAMESPACE} db={defaultPolybaseDb}>
            <SafeAreaProvider>
              <magic.Relayer />
              {/** @ts-ignore */}
              <ProviderMagicWallet
                redirectURI="hearthsidehangouts://home"
                walletClient={walletClient}
                // @ts-ignore
                magic={magic}
              >
                <RootLevelNavigator />
              </ProviderMagicWallet>
            </SafeAreaProvider>
          </ProviderPolybase>
        </ProviderIPFS>
      </ThemeProvider>
    </ProviderUniversalUI>
  )
}
