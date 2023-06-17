import { addHours, fromUnixTime } from 'date-fns'
import type { Milestone, RatedSourceMaterial, Club } from '../../../../hooks'
import { Button, YStack } from '@my/ui'
import useCalendar from '@atiladev/usecalendar'
import { useMutation } from '@tanstack/react-query'
import * as Calendar from 'expo-calendar'
import { CalendarCheck } from '@tamagui/lucide-icons'

interface RSVPButtonProps {
  milestone: Milestone
  material: RatedSourceMaterial
  club: Club
}
export const RSVPButton = (props: RSVPButtonProps) => {
  const { milestone, material, club } = props
  const {
    addEventsToCalendar,
    createCalendar,
    deleteCalendar,
    getCalendarId,
    getEvents,
    getPermission,
    isThereEvents,
    openSettings,
  } = useCalendar('Hearthside Hangouts', '#F8A964', `${club.name}`)

  const mutationAddToCalendar = useMutation(async () => {
    const granted = await getPermission()

    if (granted) {
      let idCalendar = await getCalendarId()
      if (!idCalendar) {
        await createCalendar()
        idCalendar = await getCalendarId()
      }
      const eventIdInCalendar = await Calendar.createEventAsync(idCalendar as string, {
        title: `${milestone.title}`,
        startDate: fromUnixTime(milestone.startAt),
        endDate: addHours(fromUnixTime(milestone.startAt), 2),
        notes: `${milestone.notes} 
        This ${club?.name} event will take place on the Huddle01 platform. The link to join the call is attached in the invite.`,
        location: `https://app.huddle01.com/${milestone.id}`,
      })

      return eventIdInCalendar
    } else {
      openSettings()
    }
  })
  return (
    <YStack pt="$4">
      <Button
        size="$3"
        chromeless
        icon={CalendarCheck}
        onPress={async () => await mutationAddToCalendar.mutateAsync()}
      >
        <Button.Text fontWeight="bold">
          {mutationAddToCalendar.isLoading
            ? 'Adding...'
            : mutationAddToCalendar.isSuccess
            ? 'Added !'
            : 'Add to calendar'}
        </Button.Text>
      </Button>
    </YStack>
  )
}

export default RSVPButton
