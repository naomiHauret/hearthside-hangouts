import type { providers } from 'ethers'
import { useCurrentUser } from '../../hooks'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import Constants from 'expo-constants'
import { createContext, useContext, useRef } from 'react'
import { createStore, useStore } from 'zustand'

export const HUDDLE01_APIKEY = `${Constants?.expoConfig?.extra?.huddle01Key}`

/**
 * This provider is NOT universal
 */
interface AudioRoomProps {}
interface AudioRoomState extends AudioRoomProps {}

type AudioRoomStore = ReturnType<typeof createAudioRoomStore>
type AudioRoomProviderProps = React.PropsWithChildren<AudioRoomProps>

/**
  Creates a zustand store
  @param {Partial<AudioRoomProps>} [initProps] - The initial props for the store.
  @returns {AudioRoomState} - The created store.
*/
const createAudioRoomStore = (initProps?: Partial<AudioRoomProps>) => {
  const DEFAULT_PROPS: AudioRoomProps = {}
  return createStore<AudioRoomState>()((set, get) => ({
    ...DEFAULT_PROPS,
    ...initProps,
  }))
}

/**
 * React context that will allow us to edit the schedule of the current club read
 * @type {React.Context<null | AudioRoomStore>}
 */
const AudioRoomContext = createContext<null | AudioRoomStore>(null)

/**
 * Provider that will allow us to edit the schedule of the current club read
 * @param {AudioRoomProviderProps} props - The component props.
 * @returns {React.ReactNode} - The rendered component
 */
export const ProviderAudioRoom = ({ children, ...props }: AudioRoomProviderProps) => {
  const storeRef = useRef<AudioRoomStore>()
  if (!storeRef.current) {
    storeRef.current = createAudioRoomStore(props)
  }

  return (
    <AudioRoomContext.Provider
      value={{
        ...storeRef.current,
      }}
    >
      {children}
    </AudioRoomContext.Provider>
  )
}

/**
 * Hook to access the audioroom store.
 * @template T
 * @param {(state: AudioRoomState) => T} selector - Selector function to extract the desired value from the store
 * @param {(left: T, right: T) => boolean} [equalityFn] - Optional equality function for comparing the selected value
 * @returns {T} - The selected value from the store
 * @throws {Error} - Throws an error if AudioRoomContext.Provider is missing in the component tree
 */

export function useStoreSchedule<T>(
  selector: (state: AudioRoomState) => T,
  equalityFn?: (left: T, right: T) => boolean
): T {
  const store = useContext(AudioRoomContext)
  if (!store) throw new Error('Missing AudioRoomContext.Provider in the tree')
  return useStore(store, selector, equalityFn)
}

/**
 * Hook to handle audio room UI
 */
export function useAudioRoom() {
  return {}
}
