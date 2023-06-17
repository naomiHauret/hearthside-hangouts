import { addHours, fromUnixTime } from 'date-fns'
import type { Milestone, RatedSourceMaterial, Club } from '../../../../hooks'
import { Button, Spinner, YStack } from '@my/ui'
import useCalendar from '@atiladev/usecalendar'
import { useMutation } from '@tanstack/react-query'
import * as Calendar from 'expo-calendar'
import { CalendarCheck } from '@tamagui/lucide-icons'
import { useRSVP } from 'app/hooks/rsvp'

interface RSVPButtonProps {
  milestone: Milestone
  material: RatedSourceMaterial
  club: Club
}
export const RSVPButton = (props: RSVPButtonProps) => {
  const { milestone, material, club } = props
  const { createCalendar, getCalendarId, getPermission, openSettings } = useCalendar(
    'Hearthside Hangouts',
    '#F8A964',
    `${club?.name}`
  )
  const { mutationCreateRSVP, mutationDeleteRSVP, queryDidUserRSVPToMilestone } = useRSVP({
    idMilestone: milestone?.id,
    shouldFetchRSVPs: true,
  })
  const mutationAddToCalendar = useMutation(
    async () => {
      const granted = await getPermission()

      if (granted) {
        let idCalendar = await getCalendarId()
        if (!idCalendar) {
          await createCalendar()
          idCalendar = await getCalendarId()
        }
        const eventIdInCalendar = await Calendar.createEventAsync(idCalendar as string, {
          title: `${milestone?.title}`,
          startDate: fromUnixTime(milestone?.startAt),
          endDate: addHours(fromUnixTime(milestone?.startAt), 2),
          notes: `${milestone?.notes} 
        This ${club?.name} event will take place on the Huddle01 platform. The link to join the call is attached in the invite.`,
          location: `https://app.huddle01.com/${milestone?.id}`,
        })

        return eventIdInCalendar
      } else {
        openSettings()
      }
    },
    {
      async onSuccess(data, variables, context) {
        await mutationCreateRSVP.mutateAsync({
          idMilestone: milestone?.id,
          idEvent: data as string,
        })
      },
    }
  )

  return (
    <YStack pt="$4">
      <Button
        size="$3"
        disabled={
          mutationAddToCalendar.isLoading ||
          mutationDeleteRSVP.isLoading ||
          mutationCreateRSVP.isLoading ||
          queryDidUserRSVPToMilestone.isLoading
        }
        chromeless
        onPress={async () => {
          if (queryDidUserRSVPToMilestone?.data?.data === null) {
            await mutationAddToCalendar.mutateAsync()
          } else {
            await mutationDeleteRSVP.mutateAsync({
              idRSVP: queryDidUserRSVPToMilestone?.data?.data?.id,
            })
          }
        }}
      >
        <Button.Text fontWeight="bold">
          {mutationAddToCalendar.isLoading
            ? 'Adding...'
            : mutationDeleteRSVP.isLoading
            ? 'unRSVPing...'
            : queryDidUserRSVPToMilestone?.isLoading
            ? 'Checking your RSVPs...'
            : queryDidUserRSVPToMilestone?.data?.data !== null
            ? 'unRSVP'
            : 'RSVP'}
        </Button.Text>
        {(mutationAddToCalendar.isLoading ||
          mutationDeleteRSVP.isLoading ||
          mutationCreateRSVP.isLoading ||
          queryDidUserRSVPToMilestone.isLoading) && <Spinner />}
      </Button>
    </YStack>
  )
}

export default RSVPButton
