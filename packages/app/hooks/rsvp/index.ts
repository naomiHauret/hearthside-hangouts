import type { Polybase } from '@polybase/client'
import type { providers } from 'ethers'
import { useQueryClient } from '@tanstack/react-query'
import { useMutation, useQuery } from '@tanstack/react-query'
import { signMessage } from 'app/helpers'
import { useMagicWallet } from 'app/provider'
import { usePolybase } from '../../provider/polybase'
import useCurrentUser from '../current-user'
import { isAddress } from 'ethers/lib/utils'

export function useRSVP(args: { shouldFetchRSVPs?: boolean; idMilestone?: string }) {
  const queryClient = useQueryClient()
  const polybaseDb = usePolybase((s) => s.db) as Polybase
  const walletClient = useMagicWallet((s) => s.walletClient)
  const { userInfo } = useCurrentUser()

  const queryCurrentUserRSVPs = useQuery({
    queryKey: ['rsvps-user', userInfo?.publicAddress],
    queryFn: async () => {
      const currentUserEthAddress = userInfo?.publicAddress as string
      // Grab the signer
      const signer = (await walletClient?.getSigner(
        currentUserEthAddress
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
      const collectionReference = polybaseDb.collection('RSVP')
      const records = await collectionReference
        .where(
          'profile',
          '==',
          polybaseDb.collection('UserProfile').record(userInfo?.publicAddress as string)
        )
        .get()
      return records
    },
    enabled:
      !isAddress(`${userInfo?.publicAddress}`) || !polybaseDb || args?.shouldFetchRSVPs !== true
        ? false
        : true,
  })

  const queryDidUserRSVPToMilestone = useQuery({
    queryKey: ['rsvp', args?.idMilestone, userInfo?.publicAddress],
    queryFn: async () => {
      const currentUserEthAddress = userInfo?.publicAddress as string
      // Grab the signer
      const signer = (await walletClient?.getSigner(
        currentUserEthAddress
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
      const collectionReference = polybaseDb.collection('RSVP')
      const record = await collectionReference
        .record(`${args?.idMilestone}/${userInfo?.publicAddress}`)
        .get()
      return record
    },
    enabled:
      !isAddress(`${userInfo?.publicAddress}`) ||
      !args?.idMilestone ||
      !polybaseDb ||
      args?.shouldFetchRSVPs !== true
        ? false
        : true,
  })
  /**
   * Mutation ; save the user's RSVP to Polybase
   */
  const mutationCreateRSVP = useMutation(
    async (values: { idMilestone: string; idEvent: string }) => {
      const currentUserEthAddress = userInfo?.publicAddress as string
      // Grab the signer
      const signer = (await walletClient?.getSigner(
        currentUserEthAddress
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

      const collectionReference = polybaseDb.collection('RSVP')
      // constructor (id: string, idEvent: string, profile: UserProfile)
      const id = `${values.idMilestone}/${currentUserEthAddress}`
      return await collectionReference.create([
        id,
        values.idEvent,
        polybaseDb.collection('UserProfile').record(currentUserEthAddress),
      ])
    },
    {
      onSuccess(data, variables) {
        queryClient.invalidateQueries(['rsvp', args?.idMilestone, userInfo?.publicAddress])
        queryClient.invalidateQueries(['rsvps-user', userInfo?.publicAddress])
      },
    }
  )

  /**
   * Mutation ; delete the user's RSVP from Polybase
   */
  const mutationDeleteRSVP = useMutation(
    async (values: { idRSVP: string }) => {
      const currentUserEthAddress = userInfo?.publicAddress as string
      // Grab the signer
      const signer = (await walletClient?.getSigner(
        currentUserEthAddress
      )) as providers.JsonRpcSigner

      // Delete it from our polybase instance
      // tried to assign in to the polybase instance in the sign in hook but it looks like we have to add it everywhere we need a signature
      // Not very elegant but we have to !
      polybaseDb.signer(async (data: string) => {
        const sig = await signMessage({
          signer,
          message: data,
        })
        return { h: 'eth-personal-sign', sig: sig.signature }
      })

      const collectionReference = polybaseDb.collection('RSVP')
      return await collectionReference.record(values?.idRSVP).call('del', [])
    },
    {
      onSuccess(data, variables) {
        queryClient.invalidateQueries(['rsvp', variables.idRSVP])
        queryClient.invalidateQueries(['rsvps-user', userInfo?.publicAddress])
      },
    }
  )

  return {
    mutationCreateRSVP,
    mutationDeleteRSVP,
    queryCurrentUserRSVPs,
    queryDidUserRSVPToMilestone,
  }
}
