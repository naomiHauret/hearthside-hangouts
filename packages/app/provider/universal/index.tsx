import { CustomToast, TamaguiProvider, TamaguiProviderProps, ToastProvider } from '@my/ui'
import { QueryClientProvider } from '@tanstack/react-query'
import { useColorScheme } from 'react-native'
import { ToastViewport } from './ToastViewport'
import config from '../../tamagui.config'
import { client as queryClient } from '../../helpers'

export function Provider({ children, ...rest }: Omit<TamaguiProviderProps, 'config'>) {
  const scheme = useColorScheme()
  return (
    <QueryClientProvider client={queryClient}>
      <TamaguiProvider
        config={config}
        disableInjectCSS
        defaultTheme={scheme === 'dark' ? 'dark' : 'light'}
        {...rest}
      >
        <ToastProvider
          swipeDirection="horizontal"
          duration={6000}
          native={
            [
              /* uncomment the next line to do native toasts on mobile. NOTE: it'll require you making a dev build and won't work with Expo Go */
              // 'mobile'
            ]
          }
        >
          {children}

          <CustomToast />
          <ToastViewport />
        </ToastProvider>
      </TamaguiProvider>
    </QueryClientProvider>
  )
}
