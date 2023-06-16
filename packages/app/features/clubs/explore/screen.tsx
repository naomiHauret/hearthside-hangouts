import { useClubs } from '../../../hooks'
import { H1, Spinner, XStack, YStack } from '@my/ui'
import CardClub from './Card'

/**
 * Universal screen that displays all clubs.
 * @returns Clubs page
 */
export function ExploreClubsScreen() {
  const { queryClubs } = useClubs()

  return (
    <>
      <YStack space="$4">
        <XStack space="$2">
          {queryClubs?.isLoading && <Spinner />}
          <H1 color="$color11" fontWeight="bold" size="$4">
            {queryClubs?.isSuccess && queryClubs?.data?.data?.length} Club
            {(queryClubs?.data?.data?.length as number) > 1 && 's'}
          </H1>
        </XStack>
        <YStack space="$4">
          {queryClubs.data?.data.map((clubRawData) => {
            const club = clubRawData.data
            return <CardClub key={`moderatedbyme-${club.id}`} club={club} />
          })}
        </YStack>
      </YStack>
    </>
  )
}

export default ExploreClubsScreen
