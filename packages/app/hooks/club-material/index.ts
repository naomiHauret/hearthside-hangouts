import type { Polybase } from '@polybase/client'
import type { providers } from 'ethers'
import { useQueryClient } from '@tanstack/react-query'
import { useMutation, useQuery } from '@tanstack/react-query'
import { signMessage } from 'app/helpers'
import { useMagicWallet } from 'app/provider'
import { usePolybase } from '../../provider/polybase'
import useCurrentUser from '../current-user'

export interface ClubMaterial {
  club: {
    collectionId: string
    id: string
  }
  createdAt: number
  creatorPublicKey: Object
  id: string
  material: {
    collectionId: string
    id: string
  }
  milestones: Array<Milestone>
}

export interface Milestone {
  id: string
  title: string
  notes: string
  startAt: number
}

export function useClubMaterial(args: {
  idClubMaterial?: string
  idClub?: string
  shouldFetchClubMaterial?: boolean
}) {
  const queryClient = useQueryClient()
  const polybaseDb = usePolybase((s) => s.db) as Polybase
  const walletClient = useMagicWallet((s) => s.walletClient)
  const { userInfo } = useCurrentUser()

  /**
   * Query ; get a ClubMaterial entity details, given an id
   */
  const queryClubMaterialDetails = useQuery({
    queryKey: ['club-material', args?.idClubMaterial],
    queryFn: async () => {
      const collectionReference = polybaseDb.collection('ClubMaterial')
      const record = await collectionReference.record(`${args?.idClubMaterial}`).get()
      return record
    },
    select(data) {
      if (data?.data !== null) {
        const milestones = data.data.milestones.map((stringifiedMilestone) => {
          const milestone = JSON.parse(stringifiedMilestone)
          return {
            ...milestone,
            startAt: parseInt(milestone.startAt),
          }
        })
        return {
          ...data?.data,
          milestones,
        } as ClubMaterial
      }
    },
    enabled:
      !args?.idClubMaterial ||
      args?.shouldFetchClubMaterial !== true ||
      args?.idClubMaterial === null ||
      !polybaseDb
        ? false
        : true,
  })

  /**
   * Mutation ; creates a new instance of ClubMaterial (middle entity between SourceMaterial and Club)
   */
  const mutationCreateClubMaterial = useMutation(
    async (values: { idClub: string; idSourceMaterial: string }) => {
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

      const collectionReference = polybaseDb.collection('ClubMaterial')
      // constructor (id: string, material: SourceMaterial, club: Club, createdAt: number)
      const id = `${values.idClub}/${values.idSourceMaterial}`
      return await collectionReference.create([
        id,
        polybaseDb.collection('SourceMaterial').record(values.idSourceMaterial),
        polybaseDb.collection('Club').record(values.idClub),
        Date.now(),
      ])
    }
  )

  /**
   * Mutation ; update milestones for a given ClubMaterial
   */
  const mutationUpdateMilestones = useMutation(
    async (values: { idClubMaterial: string; milestones: Array<any> }) => {
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

      const collectionReference = polybaseDb.collection('ClubMaterial')
      // setMilestones(milestones: Milestone[])
      await collectionReference
        .record(values?.idClubMaterial as string)
        .call('setMilestones', [values.milestones])
    }
  )

  return {
    queryClubMaterialDetails,
    mutationUpdateMilestones,
    mutationCreateClubMaterial,
  }
}
