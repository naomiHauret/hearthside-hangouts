import { useEffect, useState } from 'react'
import { Button, Form, Label, Separator, Sheet, TextArea, XStack, YStack, ZStack } from '@my/ui'
import { X as Close } from '@tamagui/lucide-icons'
import { useStoreClubPosts } from 'app/provider'
import ChannelScreen from './[id]'
import { useClubPosts } from 'app/hooks'
import React from 'react'

interface SheetChannelProps {
  club: Club
}

export const SheetChannel = (props: SheetChannelProps) => {
  const { club } = props
  const [position, setPosition] = useState(0)
  const [content, setContent] = useState('')
  const selectedChannel = useStoreClubPosts((s) => s.selectedChannel)
  const isSheetOpen = useStoreClubPosts((s) => s.isSheetOpen)
  const closeChannelSheet = useStoreClubPosts((s) => s.closeChannelSheet)
  const setIsSheetOpen = useStoreClubPosts((s) => s.setIsSheetOpen)
  const { queryPostsByChannel, mutationCreatePost } = useClubPosts({
    idChannel: selectedChannel?.id as string,
  })

  useEffect(() => {
    if (isSheetOpen === false && content !== '') setContent('')
  }, [isSheetOpen])

  return (
    <>
      <Sheet
        forceRemoveScrollEnabled={isSheetOpen}
        modal={true}
        open={isSheetOpen}
        onOpenChange={(open) => setIsSheetOpen(open)}
        snapPoints={[85, 50, 25]}
        dismissOnSnapToBottom
        position={position}
        onPositionChange={setPosition}
        zIndex={100_000}
        animation="bouncy"
      >
        <Sheet.Overlay />
        <Sheet.Handle />

        <Sheet.Frame flex={1} space="$5">
          <YStack flex={1} p="$3">
            <YStack>
              <Button
                chromeless
                marginStart="auto"
                size="$4"
                circular
                icon={Close}
                onPress={() => closeChannelSheet()}
              />
            </YStack>

            <ZStack flex={1}>
              <Sheet.ScrollView pb="$10" maxHeight="65%" space>
                <ChannelScreen posts={queryPostsByChannel?.data?.data} />
              </Sheet.ScrollView>
              <YStack
                bg="$background"
                borderTopWidth="$0.25"
                mx="$-3"
                px="$3"
                pt="$4"
                borderTopColor="$color8"
                borderStyle="solid"
                mt="auto"
              >
                <XStack>
                  <Form
                    onSubmit={() =>
                      mutationCreatePost.mutateAsync(
                        {
                          idChannel: selectedChannel?.id as string,
                          content,
                          idClub: club.id,
                        },
                        {
                          onSuccess() {
                            setContent('')
                          },
                        }
                      )
                    }
                    f={1}
                  >
                    <Label theme="alt2" size="$2">
                      Your message
                    </Label>
                    <TextArea value={content} onChangeText={setContent} />
                    <Form.Trigger mt="$3" asChild>
                      <Button themeInverse mx="auto">
                        <Button.Text fontWeight="bold">
                          {mutationCreatePost.isLoading ? 'Posting...' : 'Post'}
                        </Button.Text>
                      </Button>
                    </Form.Trigger>
                  </Form>
                </XStack>
              </YStack>
            </ZStack>
          </YStack>
        </Sheet.Frame>
      </Sheet>
    </>
  )
}

export default SheetChannel
