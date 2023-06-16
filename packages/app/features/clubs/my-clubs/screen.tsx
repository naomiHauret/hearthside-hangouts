import { Club, useUserProfile } from '../../../hooks'
import { useCurrentUser } from '../../../hooks'
import { usePolybase } from '../../../provider'
import { H1, Spinner, XStack, YStack } from '@my/ui'
import type {
  Polybase,
  CollectionList,
  CollectionRecord,
  QueryWhereOperator,
} from '@polybase/client'
import { useQuery } from '@tanstack/react-query'
import CardClubModerator from './CardClubModerator'
import CardClubMembership from './CardClubMembership'

function useFilteredClubs(args: {
  field: string
  op: QueryWhereOperator
  value: string | CollectionRecord<any>
}) {
  /**
   * Query ; fetches clubs by creator address from Polybase
   */
  const polybaseDb = usePolybase((s) => s.db) as Polybase
  const queryFilteredClubs = useQuery({
    queryKey: ['clubs-filtered', args?.field, args.op, args?.value],
    queryFn: async (): Promise<CollectionList<Club>> => {
      const collectionReference = polybaseDb.collection('Club')
      const records = await collectionReference.where(args?.field, args.op, args?.value).get()
      return records
    },
    enabled: args?.value && args?.value !== null && args?.value !== '' ? true : false,
  })

  return queryFilteredClubs
}

/**
 * Universal screen that displays a user's clubs (memberships + clubs they run)
 * @returns Clubs page
 */

export function MyClubsScreen() {
  const polybaseDb = usePolybase((s) => s.db) as Polybase
  const { userInfo } = useCurrentUser()
  const { queryUserClubMemberships } = useUserProfile({
    userEthereumAddress: userInfo?.publicAddress,
    shouldFetchProfile: false,
    shouldFetchMemberships: true,
  })
  const queryClubsModeratedByCurrentUser = useFilteredClubs({
    field: 'creator',
    op: '==',
    value: polybaseDb.collection('UserProfile').record(userInfo?.publicAddress as string),
  })

  return (
    <YStack space="$4">
      <XStack space="$2">
        {(queryClubsModeratedByCurrentUser?.isLoading || queryUserClubMemberships?.isLoading) && (
          <Spinner />
        )}
        <H1 color="$color11" fontWeight="bold" size="$4">
          {(queryClubsModeratedByCurrentUser?.data?.data?.length ?? 0) +
            (queryUserClubMemberships?.data?.data?.length ?? 0)}{' '}
          Club
          {(queryClubsModeratedByCurrentUser?.data?.data?.length ?? 0) +
            (queryUserClubMemberships?.data?.data?.length ?? 0) >
            1 && 's'}
        </H1>
      </XStack>
      <YStack space="$4">
        {queryClubsModeratedByCurrentUser.data?.data.map((clubRawData) => {
          const club = clubRawData.data
          return <CardClubModerator key={`moderatedbyme-${club.id}`} club={club} />
        })}
        {queryUserClubMemberships.data?.data.map((membershipRawData) => {
          const club = membershipRawData.data.club
          return <CardClubMembership key={`memberof-${club.id}`} idClub={club.id} />
        })}
      </YStack>
    </YStack>
  )
}

export default MyClubsScreen
