import { createContext, useContext, useRef } from 'react'
import { createStore, useStore } from 'zustand'

interface BooksApiProps {
  googleBooksApiAccessToken?: string
}
interface BooksApiState extends BooksApiProps {}

type BooksApiStore = ReturnType<typeof createBooksApiStore>
type BooksApiProviderProps = React.PropsWithChildren<BooksApiProps>

/**
  Creates a zustand store
  @param {Partial<BooksApiProps>} [initProps] - The initial props for the store.
  @returns {BooksApiState} - The created store.
*/
const createBooksApiStore = (initProps?: Partial<BooksApiProps>) => {
  const DEFAULT_PROPS: BooksApiProps = {
    googleBooksApiAccessToken: undefined,
  }
  return createStore<BooksApiState>()((set) => ({
    ...DEFAULT_PROPS,
    ...initProps,
  }))
}

/**
 * React context for the Google Books API
 * @type {React.Context<null | BooksApiStore>}
 */
const BooksApiContext = createContext<null | BooksApiStore>(null)

/**
 * Provider to access our Google Books API key
 * @param {BooksApiProviderProps} props - The component props.
 * @returns {React.ReactNode} - The rendered component
 */
export const ProviderBooksApi = ({ children, ...props }: BooksApiProviderProps) => {
  const storeRef = useRef<BooksApiStore>()
  if (!storeRef.current) {
    storeRef.current = createBooksApiStore(props)
  }

  return (
    <BooksApiContext.Provider
      value={{
        ...storeRef.current,
      }}
    >
      {children}
    </BooksApiContext.Provider>
  )
}

/**
 * Hook to access the Books API store.
 * @template T
 * @param {(state: BooksApiState) => T} selector - Selector function to extract the desired value from the store
 * @param {(left: T, right: T) => boolean} [equalityFn] - Optional equality function for comparing the selected value
 * @returns {T} - The selected value from the store
 * @throws {Error} - Throws an error if BooksApiContext.Provider is missing in the component tree
 */

export function useBooksApi<T>(
  selector: (state: BooksApiState) => T,
  equalityFn?: (left: T, right: T) => boolean
): T {
  const store = useContext(BooksApiContext)
  if (!store) throw new Error('Missing BooksApiContext.Provider in the tree')
  return useStore(store, selector, equalityFn)
}
