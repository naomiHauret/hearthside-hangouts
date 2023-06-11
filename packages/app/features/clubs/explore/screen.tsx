import { useClubs } from '../../../hooks'
import { Paragraph } from '@my/ui'
import CardClub from './Card'

export function ExploreClubsScreen() {
  const { queryClubs } = useClubs()

  return (
    <>
      <Paragraph>All clubs</Paragraph>
      {queryClubs.data?.data.map((clubRawData) => {
        const club = clubRawData.data
        return <CardClub key={`explore-${club.id}`} club={club} />
      })}
    </>
  )
}

export default ExploreClubsScreen
