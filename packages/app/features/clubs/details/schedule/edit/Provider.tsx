import type { Polybase } from '@polybase/client'
import type { providers } from 'ethers'
import type { UseMutationResult } from '@tanstack/react-query'
import type { Milestone } from '../../../../../hooks'
import { signMessage } from '../../../../../helpers'
import { useCurrentUser } from '../../../../../hooks'
import { usePolybase, useMagicWallet } from '../../../../../provider'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import Constants from 'expo-constants'
import { createContext, useContext, useRef } from 'react'
import { createStore, useStore } from 'zustand'

export const HUDDLE01_APIKEY = `${Constants?.expoConfig?.extra?.huddle01Key}`

/**
 * This provider is NOT universal
 */
interface EditScheduleProps {
  milestones: Array<Milestone>
}
interface EditScheduleState extends EditScheduleProps {
  newMilestone: (
    title: string,
    notes: string,
    startAt: number,
    hostWallets: Array<string>
  ) => Promise<Milestone[]>
  updateMilestone: (id: string, title: string, notes: string, startAt: number) => Milestone[]
  deleteMilestone: (indexMilestoneToRemove: string) => Milestone[]
}

type EditScheduleStore = ReturnType<typeof createEditScheduleStore>
type EditScheduleProviderProps = React.PropsWithChildren<EditScheduleProps>

/**
  Creates a zustand store
  @param {Partial<EditScheduleProps>} [initProps] - The initial props for the store.
  @returns {EditScheduleState} - The created store.
*/
const createEditScheduleStore = (initProps?: Partial<EditScheduleProps>) => {
  const DEFAULT_PROPS: EditScheduleProps = {
    milestones: [],
  }
  return createStore<EditScheduleState>()((set, get) => ({
    ...DEFAULT_PROPS,
    ...initProps,
    newMilestone: async (
      title: string,
      notes: string,
      startAt: number,
      hostWallets: Array<string>
    ) => {
      // first, we create the id of the milestone, which will be the id of the audio room to simplify things
      const response = await fetch('https://api.huddle01.com/api/v1/create-room', {
        method: 'POST',
        body: JSON.stringify({
          title, // The title of the room. This will be displayed in the room list.
          description: notes?.trim() === '' ? 'no description provided' : notes, // The description of the room. This will be displayed in the room list.
          roomLocked: false, // The start time of the room. This will be displayed in the room list.
          muteOnEntry: true, // Every new peer who joins must be muted
          videoOnEntry: true, // Every new peer who joins must have their video turned off
          hostWallets, // The host wallets how who will have admin access to the room.
        }),
        headers: {
          'Content-type': 'application/json',
          'x-api-key': HUDDLE01_APIKEY,
        },
      })
      const result: {
        message: string
        data: {
          roomId: string
          meetingLink: string
        }
      } = await response.json()
      console.log(result)
      const milestone: Milestone = {
        id: result.data.roomId,
        title: title ?? '',
        notes: notes ?? '',
        startAt: `${startAt}` ?? '',
      }
      milestone.id = result?.data?.roomId
      const previousMilestones = get().milestones
      const milestones = [...previousMilestones, milestone]
      set({ milestones })
      return milestones
    },

    updateMilestone: (id: string, title: string, notes: string, startAt: number) => {
      let milestoneToUpdate = get().milestones.filter(
        (milestone) => milestone.id === id
      )[0] as Milestone
      let filtered = get().milestones.filter((milestone) => milestone.id !== id)

      milestoneToUpdate = {
        id: milestoneToUpdate?.id as string,
        title,
        notes,
        startAt: `${startAt}`,
      }
      const milestones = [...filtered, milestoneToUpdate]

      set({ milestones })
      return milestones
    },
    deleteMilestone: (indexMilestoneToRemove: string) => {
      const previousMilestones = get().milestones
      const milestones = previousMilestones.filter(
        (milestone) => milestone.id !== indexMilestoneToRemove
      )
      set({ milestones })
      return milestones
    },
  }))
}

/**
 * React context that will allow us to edit the schedule of the current club read
 * @type {React.Context<null | EditScheduleStore>}
 */
const EditScheduleContext = createContext<null | EditScheduleStore>(null)

/**
 * Provider that will allow us to edit the schedule of the current club read
 * @param {EditScheduleProviderProps} props - The component props.
 * @returns {React.ReactNode} - The rendered component
 */
export const ProviderEditSchedule = ({ children, ...props }: EditScheduleProviderProps) => {
  const storeRef = useRef<EditScheduleStore>()
  if (!storeRef.current) {
    storeRef.current = createEditScheduleStore(props)
  }

  return (
    <EditScheduleContext.Provider
      value={{
        ...storeRef.current,
      }}
    >
      {children}
    </EditScheduleContext.Provider>
  )
}

/**
 * Hook to access the schedule editor store.
 * @template T
 * @param {(state: EditScheduleState) => T} selector - Selector function to extract the desired value from the store
 * @param {(left: T, right: T) => boolean} [equalityFn] - Optional equality function for comparing the selected value
 * @returns {T} - The selected value from the store
 * @throws {Error} - Throws an error if EditScheduleContext.Provider is missing in the component tree
 */

export function useStoreSchedule<T>(
  selector: (state: EditScheduleState) => T,
  equalityFn?: (left: T, right: T) => boolean
): T {
  const store = useContext(EditScheduleContext)
  if (!store) throw new Error('Missing EditScheduleContext.Provider in the tree')
  return useStore(store, selector, equalityFn)
}

/**
 * Hook to edit the schedule of a club read ; edit in both the local zustand store and polybase db
 */
export function useEditSchedule(idClubMaterial: string) {
  const queryClient = useQueryClient()
  const polybaseDb = usePolybase((s) => s.db) as Polybase
  const walletClient = useMagicWallet((s) => s.walletClient)
  const { userInfo } = useCurrentUser()
  const milestones = useStoreSchedule((s) => s.milestones)
  const addNewMilestone = useStoreSchedule((s) => s.newMilestone)
  const deleteMilestone = useStoreSchedule((s) => s.deleteMilestone)
  const updateMilestone = useStoreSchedule((s) => s.updateMilestone)

  /**
   * Edit the milestones of a club reading on Polybasr
   * @returns
   */
  async function editMilestones(updatedMilestones: Array<Milestone>) {
    // Grab the signer
    const signer = (await walletClient?.getSigner(
      userInfo?.publicAddress as string
    )) as providers.JsonRpcSigner
    // Add it to our polybase instance
    // tried to assign in to the polybase instance in the sign in hook but it looks like we have to add it everywhere we need a signature
    // Not very elegant but we have to !
    polybaseDb.signer(async (data: string) => {
      const sig = await signMessage({
        signer,
        message: data,
      })
      return { h: 'eth-personal-sign', sig: sig.signature }
    })

    const collectionReference = polybaseDb.collection('ClubMaterial')
    // First we need to transform our array of milestones object from the zustand store to an array of string
    const stringifiedMilestones = updatedMilestones.map((milestone) => JSON.stringify(milestone))
    // function setMilestones(milestones: string[])
    return await collectionReference
      .record(idClubMaterial as string)
      .call('setMilestones', [stringifiedMilestones])
  }
  const mutationAddNewMilestone = useMutation(
    async (values: { title: string; notes: string; startAt: number }) => {
      const updated = await addNewMilestone(values.title, values.notes, values.startAt, [
        userInfo?.publicAddress as string,
      ])
      return await editMilestones(updated)
    },
    {
      onSuccess() {
        queryClient.invalidateQueries(['club-material', idClubMaterial])
      },
    }
  )
  const mutationUpdateMilestone = useMutation(
    async (values: { id: string; title: string; notes: string; startAt: number }) => {
      const updated = await updateMilestone(values.id, values.title, values.notes, values.startAt)
      return await editMilestones(updated)
    },
    {
      onSuccess() {
        queryClient.invalidateQueries(['club-material', idClubMaterial])
      },
    }
  )
  const mutationDeleteMilestone = useMutation(
    async (values: { id: string }) => {
      const updated = await deleteMilestone(values.id)
      return await editMilestones(updated)
    },
    {
      onSuccess() {
        queryClient.invalidateQueries(['club-material', idClubMaterial])
      },
    }
  )

  return {
    milestones,
    mutationAddNewMilestone,
    mutationUpdateMilestone,
    mutationDeleteMilestone,
  }
}
