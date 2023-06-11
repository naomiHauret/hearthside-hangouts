import type { Club } from '../../../hooks'
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
import CardClub from './Card'

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
export function MyClubsScreen() {
  const polybaseDb = usePolybase((s) => s.db) as Polybase
  const { userInfo } = useCurrentUser()

  const queryFilteredClubs = useFilteredClubs({
    field: 'creator',
    op: '==',
    value: polybaseDb.collection('UserProfile').record(userInfo?.publicAddress as string),
  })

  return (
    <YStack space="$4">
      <XStack space="$2">
        {queryFilteredClubs?.isLoading && <Spinner />}
        <H1 color="$color11" fontWeight="bold" size="$4">
          {queryFilteredClubs?.data?.data?.length} Club
          {(queryFilteredClubs?.data?.data?.length as number) > 1 && 's'}
        </H1>
      </XStack>
      <YStack space="$4">
        {queryFilteredClubs.data?.data.map((clubRawData) => {
          const club = clubRawData.data
          return <CardClub key={`moderatedbyme-${club.id}`} club={club} />
        })}
      </YStack>
    </YStack>
  )
}

export default MyClubsScreen
