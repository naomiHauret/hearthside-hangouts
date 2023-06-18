import type { providers } from 'ethers'
import type { Polybase } from '@polybase/client'
import { useQueryClient } from '@tanstack/react-query'
import { useMutation, useQuery } from '@tanstack/react-query'
import { useMagicWallet, usePolybase } from 'app/provider'
import useCurrentUser from '../current-user'
import { signMessage } from 'app/helpers'

export function useClubPosts(args: { idChannel: string }) {
  const queryClient = useQueryClient()
  const polybaseDb = usePolybase((s) => s.db) as Polybase
  const walletClient = useMagicWallet((s) => s.walletClient)
  const { userInfo } = useCurrentUser()

  /**
   * Query ; fetches posts based on channel id
   */
  const queryPostsByChannel = useQuery({
    queryKey: ['posts-channel', args?.idChannel],
    queryFn: async () => {
      const collectionReference = polybaseDb.collection('ClubPost')
      const records = await collectionReference.where('idChannel', '==', args?.idChannel).get()

      return records
    },
  })

  /**
   * Mutation ; create post
   */
  const mutationCreatePost = useMutation(
    async (values: {
      idChannel: string
      idClub: string
      content: string
      idParentPost?: string
    }) => {
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

      const collectionReference = polybaseDb.collection('ClubPost')
      // string, idChannel: string, club: Club, creator: UserProfile, content: string, createdAt: number, proofOfMembership: ClubMembership,  parentPost?: ClubPost
      const currenTimestamp = Date.now()
      const baseId = `${values.idClub}/${values.idChannel}`
      let id = values?.idParentPost
        ? `${baseId}/${values?.idParentPost}/${currentUserEthAddress}/${currenTimestamp}`
        : `${baseId}/${currentUserEthAddress}/${currenTimestamp}`
      const parametersNewMessage = [
        id,
        values.idChannel,
        polybaseDb.collection('Club').record(values.idClub),
        polybaseDb.collection('UserProfile').record(currentUserEthAddress),
        values.content,
        currenTimestamp,
      ]
      const hasMembership = await polybaseDb
        .collection('ClubMembership')
        .record(`${currentUserEthAddress}/${values.idClub}`)
        .get()
      if (hasMembership?.data?.id)
        parametersNewMessage.push(
          polybaseDb
            .collection('ClubMembership')
            .record(`${currentUserEthAddress}/${values.idClub}`)
        )
      if (values?.idParentPost)
        parametersNewMessage.push(polybaseDb.collection('ClubPost').record(values?.idParentPost))
      return await collectionReference.create(parametersNewMessage)
    },
    {
      onSuccess(data, variables) {
        queryClient.invalidateQueries(['posts-channel', variables?.idChannel])
      },
    }
  )

  return {
    queryPostsByChannel,
    mutationCreatePost,
  }
}

export default useClubPosts
