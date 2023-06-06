import type { Magic } from '@magic-sdk/react-native-expo'
import { providers } from 'ethers'
import { createContext, useContext, useRef } from 'react'
import { createStore, useStore } from 'zustand'

interface MagicWalletProps {
  magic: undefined | Magic
  walletClient: undefined | providers.Web3Provider
  redirectURI: string
}
interface MagicWalletState extends MagicWalletProps {}

type MagicWalletStore = ReturnType<typeof createMagicWalletStore>
type MagicWalletProviderProps = React.PropsWithChildren<MagicWalletProps>

/**
  Creates a zustand store for magic wallet
  @param {Partial<MagicWalletProps>} [initProps] - The initial props for the store.
  @returns {MagicWalletState} - The created store.
*/
const createMagicWalletStore = (initProps?: Partial<MagicWalletProps>) => {
  const DEFAULT_PROPS: MagicWalletProps = {
    magic: undefined,
    walletClient: undefined,
    redirectURI: '',
  }
  return createStore<MagicWalletState>()((set) => ({
    ...DEFAULT_PROPS,
    ...initProps,
  }))
}

/**
 * React context for magic wallet
 * @type {React.Context<null | MagicWalletStore>}
 */
const MagicWalletContext = createContext<null | MagicWalletStore>(null)

/**
 * Provider to access our `magic` instance
 * @param {MagicWalletProviderProps} props - The component props.
 * @returns {React.ReactNode} - The rendered component
 */
export const ProviderMagicWallet = ({ children, ...props }: MagicWalletProviderProps) => {
  const storeRef = useRef<MagicWalletStore>()
  if (!storeRef.current) {
    storeRef.current = createMagicWalletStore(props)
  }

  return (
    <MagicWalletContext.Provider value={storeRef.current}>{children}</MagicWalletContext.Provider>
  )
}

/**
 * Hook to access the MagicWallet store.
 * @template T
 * @param {(state: MagicWalletState) => T} selector - Selector function to extract the desired value from the store
 * @param {(left: T, right: T) => boolean} [equalityFn] - Optional equality function for comparing the selected value
 * @returns {T} - The selected value from the store
 * @throws {Error} - Throws an error if MagicWalletContext.Provider is missing in the component tree
 */

export function useMagicWallet<T>(
  selector: (state: MagicWalletState) => T,
  equalityFn?: (left: T, right: T) => boolean
): T {
  const store = useContext(MagicWalletContext)
  if (!store) throw new Error('Missing MagicWalletContext.Provider in the tree')
  return useStore(store, selector, equalityFn)
}
