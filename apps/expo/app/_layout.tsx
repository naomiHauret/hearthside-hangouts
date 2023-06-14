import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native'
import {
  Provider as ProviderUniversalUI,
  ProviderMagicWallet,
  ProviderPolybase,
  ProviderIPFS,
} from 'app/provider'
import { ProviderBooksApi } from 'app/provider/books/index'
import { getWalletClient } from 'app/helpers'
import { useFonts } from 'expo-font'
import { useColorScheme } from 'react-native'
import { SafeAreaProvider } from 'react-native-safe-area-context'
import {
  POLYBASE_DEFAULT_NAMESPACE,
  defaultPolybaseDb,
  magic,
  getGoogleBooksKey,
  getIpfsClient,
} from '../config'
import RootLevelNavigator from '../navigation/RootLevelNavigator'

//@ts-ignore
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
    <ProviderBooksApi googleBooksApiAccessToken={getGoogleBooksKey()}>
      <ProviderIPFS web3StorageAccessToken={getIpfsClient()}>
        <ProviderPolybase defaultNamespace={POLYBASE_DEFAULT_NAMESPACE} db={defaultPolybaseDb}>
          <SafeAreaProvider>
            <magic.Relayer />
            {/** @ts-ignore */}
            <ProviderMagicWallet
              redirectURI="exp://qyaqb1c.naomihauret.19000.exp.direct"
              walletClient={walletClient}
              // @ts-ignore
              magic={magic}
            >
              <ProviderUniversalUI>
                <ThemeProvider value={scheme === 'dark' ? DarkTheme : DefaultTheme}>
                  <RootLevelNavigator />
                </ThemeProvider>
              </ProviderUniversalUI>
            </ProviderMagicWallet>
          </SafeAreaProvider>
        </ProviderPolybase>
      </ProviderIPFS>
    </ProviderBooksApi>
  )
}
