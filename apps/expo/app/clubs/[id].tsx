import { ScrollView } from '@my/ui'
import { ClubDetailScreen } from 'app/features/clubs/details/screen'
import { useClubs } from 'app/hooks'
import { Stack, useSearchParams } from 'expo-router'

export default function Screen() {
  const params = useSearchParams()
  const { queryClub } = useClubs(params?.id as string)

  return (
    <ScrollView>
      <Stack.Screen
        options={{
          title: queryClub.isLoading
            ? 'Loading club details...'
            : queryClub?.data?.name
            ? `${queryClub?.data?.name}`
            : 'No club found.',
        }}
      />
      <ClubDetailScreen />
    </ScrollView>
  )
}
