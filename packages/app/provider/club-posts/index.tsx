import { createContext, useContext, useRef } from 'react'
import { createStore, useStore } from 'zustand'

/**
 * Provider to only render a single modal for club posts (we will just render the posts currently selected channel)
 */
interface Channel {
  id: string
  title: string
}
interface ClubPostsProps {
  selectedChannel?: Channel | undefined
  isSheetOpen: boolean
}
interface ClubPostsState extends ClubPostsProps {
  openChannelSheet: (channel: Channel) => void
  closeChannelSheet: () => void
  setIsSheetOpen: (isOpen: boolean) => void
}

type ClubPostsStore = ReturnType<typeof createClubPostsStore>
type ClubPostsProviderProps = React.PropsWithChildren<ClubPostsProps>

/**
  Creates a zustand store
  @param {Partial<ClubPostsProps>} [initProps] - The initial props for the store.
  @returns {ClubPostsState} - The created store.
*/
const createClubPostsStore = (initProps?: Partial<ClubPostsProps>) => {
  const DEFAULT_PROPS: ClubPostsProps = {
    selectedChannel: undefined,
    isSheetOpen: false,
  }
  return createStore<ClubPostsState>()((set) => ({
    ...DEFAULT_PROPS,
    ...initProps,
    openChannelSheet: (channel: Channel) =>
      set(() => ({
        isSheetOpen: true,
        selectedChannel: channel,
      })),
    closeChannelSheet: () =>
      set(() => ({
        isSheetOpen: false,
        selectedChannel: undefined,
      })),
    setIsSheetOpen: (isOpen: boolean) =>
      set(() => ({
        isSheetOpen: isOpen,
      })),
  }))
}

/**
 * React context for the Google Books API
 * @type {React.Context<null | ClubPostsStore>}
 */
const ClubPostsContext = createContext<null | ClubPostsStore>(null)

/**
 * Provider to access our Google Books API key
 * @param {ClubPostsProviderProps} props - The component props.
 * @returns {React.ReactNode} - The rendered component
 */
export const ProviderClubPosts = ({ children, ...props }: ClubPostsProviderProps) => {
  const storeRef = useRef<ClubPostsStore>()
  if (!storeRef.current) {
    storeRef.current = createClubPostsStore(props)
  }

  return (
    <ClubPostsContext.Provider
      value={{
        ...storeRef.current,
      }}
    >
      {children}
    </ClubPostsContext.Provider>
  )
}

/**
 * Hook to access the Books API store.
 * @template T
 * @param {(state: ClubPostsState) => T} selector - Selector function to extract the desired value from the store
 * @param {(left: T, right: T) => boolean} [equalityFn] - Optional equality function for comparing the selected value
 * @returns {T} - The selected value from the store
 * @throws {Error} - Throws an error if ClubPostsContext.Provider is missing in the component tree
 */

export function useStoreClubPosts<T>(
  selector: (state: ClubPostsState) => T,
  equalityFn?: (left: T, right: T) => boolean
): T {
  const store = useContext(ClubPostsContext)
  if (!store) throw new Error('Missing ClubPostsContext.Provider in the tree')
  return useStore(store, selector, equalityFn)
}
