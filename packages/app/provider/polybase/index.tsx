import { Polybase } from '@polybase/client'
import { createContext, useContext, useRef } from 'react'
import { createStore, useStore } from 'zustand'

interface PolybaseProps {
  defaultNamespace: string
  db?: Polybase
}
interface PolybaseState extends PolybaseProps {
  setDb: (newInstance: Polybase | undefined) => void
}

type PolybaseStore = ReturnType<typeof createPolybaseStore>
type PolybaseProviderProps = React.PropsWithChildren<PolybaseProps>

/**
  Creates a zustand store for our Polybase db
  @param {Partial<PolybaseProps>} [initProps] - The initial props for the store.
  @returns {PolybaseState} - The created store.
*/
const createPolybaseStore = (initProps?: Partial<PolybaseProps>) => {
  const DEFAULT_PROPS: PolybaseProps = {
    defaultNamespace: '',
    db: undefined,
  }
  return createStore<PolybaseState>()((set) => ({
    ...DEFAULT_PROPS,
    ...initProps,
    setDb: (newInstance: Polybase) => ({
      db: newInstance,
    }),
  }))
}

/**
 * React context for a Polybase database instance
 * @type {React.Context<null | PolybaseStore>}
 */
const PolybaseContext = createContext<null | PolybaseStore>(null)

/**
 * Provider to access our Polybase database instance
 * @param {PolybaseProviderProps} props - The component props.
 * @returns {React.ReactNode} - The rendered component
 */
export const ProviderPolybase = ({ children, ...props }: PolybaseProviderProps) => {
  const storeRef = useRef<PolybaseStore>()
  if (!storeRef.current) {
    storeRef.current = createPolybaseStore(props)
  }

  return (
    <PolybaseContext.Provider
      value={{
        ...storeRef.current,
      }}
    >
      {children}
    </PolybaseContext.Provider>
  )
}

/**
 * Hook to access the Polybase store.
 * @template T
 * @param {(state: PolybaseState) => T} selector - Selector function to extract the desired value from the store
 * @param {(left: T, right: T) => boolean} [equalityFn] - Optional equality function for comparing the selected value
 * @returns {T} - The selected value from the store
 * @throws {Error} - Throws an error if PolybaseContext.Provider is missing in the component tree
 */

export function usePolybase<T>(
  selector: (state: PolybaseState) => T,
  equalityFn?: (left: T, right: T) => boolean
): T {
  const store = useContext(PolybaseContext)
  if (!store) throw new Error('Missing PolybaseContext.Provider in the tree')
  return useStore(store, selector, equalityFn)
}
