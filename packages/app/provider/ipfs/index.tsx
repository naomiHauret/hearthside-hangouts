import { createContext, useContext, useRef } from 'react'
import { createStore, useStore } from 'zustand'

interface IPFSProps {
  web3StorageAccessToken?: string
}
interface IPFSState extends IPFSProps {}

type IPFSStore = ReturnType<typeof createIPFSStore>
type IPFSProviderProps = React.PropsWithChildren<IPFSProps>

/**
  Creates a zustand store
  @param {Partial<IPFSProps>} [initProps] - The initial props for the store.
  @returns {IPFSState} - The created store.
*/
const createIPFSStore = (initProps?: Partial<IPFSProps>) => {
  const DEFAULT_PROPS: IPFSProps = {
    web3StorageAccessToken: undefined,
  }
  return createStore<IPFSState>()((set) => ({
    ...DEFAULT_PROPS,
    ...initProps,
  }))
}

/**
 * React context for a IPFS Web3.storage instance
 * @type {React.Context<null | IPFSStore>}
 */
const IPFSContext = createContext<null | IPFSStore>(null)

/**
 * Provider to access our IPFS Client (web3 storage)
 * @param {IPFSProviderProps} props - The component props.
 * @returns {React.ReactNode} - The rendered component
 */
export const ProviderIPFS = ({ children, ...props }: IPFSProviderProps) => {
  const storeRef = useRef<IPFSStore>()
  if (!storeRef.current) {
    storeRef.current = createIPFSStore(props)
  }

  return (
    <IPFSContext.Provider
      value={{
        ...storeRef.current,
      }}
    >
      {children}
    </IPFSContext.Provider>
  )
}

/**
 * Hook to access the IPFS store.
 * @template T
 * @param {(state: IPFSState) => T} selector - Selector function to extract the desired value from the store
 * @param {(left: T, right: T) => boolean} [equalityFn] - Optional equality function for comparing the selected value
 * @returns {T} - The selected value from the store
 * @throws {Error} - Throws an error if IPFSContext.Provider is missing in the component tree
 */

export function useIPFS<T>(
  selector: (state: IPFSState) => T,
  equalityFn?: (left: T, right: T) => boolean
): T {
  const store = useContext(IPFSContext)
  if (!store) throw new Error('Missing IPFSContext.Provider in the tree')
  return useStore(store, selector, equalityFn)
}
