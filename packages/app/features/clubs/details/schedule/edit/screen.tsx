import type { Milestone } from '../../../../../hooks'
import {
  Button,
  H3,
  ListItem,
  YGroup,
  Sheet,
  YStack,
  H4,
  VisuallyHidden,
  SizableText,
  Separator,
} from '@my/ui'
import { X as Close } from '@tamagui/lucide-icons'
import { useState } from 'react'
import { useEditSchedule } from './Provider'
import FormMilestone from './FormMilestone'

interface EditScheduleProps {
  clubMaterialDetails: any
}

export const EditSchedule = (props: EditScheduleProps) => {
  const { clubMaterialDetails } = props
  const [position, setPosition] = useState(0)
  const [openSheetEditSchedule, setOpenSheetEditSchedule] = useState(false)
  const { milestones, mutationAddNewMilestone, mutationDeleteMilestone, mutationUpdateMilestone } =
    useEditSchedule(clubMaterialDetails?.id)

  return (
    <>
      <Button onPress={() => setOpenSheetEditSchedule(true)}>
        <Button.Text fontWeight="bold">Edit schedule</Button.Text>
      </Button>

      <Sheet
        forceRemoveScrollEnabled={openSheetEditSchedule}
        modal={true}
        open={openSheetEditSchedule}
        onOpenChange={setOpenSheetEditSchedule}
        snapPoints={[85, 50, 25]}
        dismissOnSnapToBottom
        position={position}
        onPositionChange={setPosition}
        zIndex={100_000}
        animation="bouncy"
      >
        <Sheet.Overlay />
        <Sheet.Handle />
        <Sheet.Frame flex={1} padding="$2">
          <YStack flex={1} p="$3">
            <YStack>
              <Button
                chromeless
                marginStart="auto"
                size="$4"
                circular
                icon={Close}
                onPress={() => setOpenSheetEditSchedule(false)}
              />
            </YStack>
            <Sheet.ScrollView space>
              <H3>
                Schedule{' '}
                <SizableText size="$2" theme="alt2">
                  ({milestones?.length} milestone{milestones?.length > 1 && 's'})
                </SizableText>
              </H3>

              <YStack
                px="$5"
                py="$4"
                borderColor="$color7"
                borderStyle="solid"
                borderWidth="$0.25"
                borderRadius="$4"
              >
                <VisuallyHidden>
                  <H4>Create new milestone</H4>
                </VisuallyHidden>
                <FormMilestone
                  resetFormOnMutationSuccess={true}
                  mutation={mutationAddNewMilestone}
                  label={mutationAddNewMilestone?.isLoading ? 'Creating...' : 'Create milestone'}
                />
              </YStack>

              <YGroup separator={<Separator />} alignSelf="center" bordered size="$4">
                {milestones?.map((milestone: Milestone) => {
                  return (
                    <YGroup.Item key={milestone.id}>
                      <ListItem
                        hoverTheme
                        pt="$3"
                        title={
                          <VisuallyHidden>
                            <SizableText>{milestone.title}</SizableText>
                          </VisuallyHidden>
                        }
                      >
                        <Button
                          theme="red"
                          position="absolute"
                          top={0}
                          size="$2"
                          end={0}
                          disabled={mutationDeleteMilestone?.isLoading}
                          icon={Close}
                          onPress={() => mutationDeleteMilestone.mutateAsync({ id: milestone.id })}
                        >
                          <Button.Text theme="red" size="$2">
                            Delete this milestone
                          </Button.Text>
                        </Button>
                        <FormMilestone
                          label={mutationUpdateMilestone?.isLoading ? 'Updating...' : 'Update'}
                          resetFormOnMutationSuccess={false}
                          mutation={mutationUpdateMilestone}
                          defaultValues={{
                            title: milestone.title,
                            notes: milestone.notes,
                            startAt: new Date(milestone.startAt),
                            id: milestone.id,
                          }}
                        />
                      </ListItem>
                    </YGroup.Item>
                  )
                })}
              </YGroup>
            </Sheet.ScrollView>
          </YStack>
        </Sheet.Frame>
      </Sheet>
    </>
  )
}

export default EditSchedule
