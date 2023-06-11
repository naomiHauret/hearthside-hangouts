import type { SetStateAction } from 'react'
import { useState } from 'react'
import { Sheet, Button, YStack } from '@my/ui'
import { X as Close } from '@tamagui/lucide-icons'

interface SheetClub {
  open: boolean
  setOpen: (value: SetStateAction<boolean>) => void
  children: React.ReactNode
}
export const SheetClub = (props: SheetClub) => {
  const { open, setOpen, children } = props
  const [position, setPosition] = useState(0)
  return (
    <>
      <Sheet
        forceRemoveScrollEnabled={open}
        modal={true}
        open={open}
        onOpenChange={setOpen}
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
          <YStack flex={1}>
            <YStack>
              <Button
                chromeless
                marginStart="auto"
                size="$4"
                circular
                icon={Close}
                onPress={() => setOpen(false)}
              />
            </YStack>
            <Sheet.ScrollView space>{children}</Sheet.ScrollView>
          </YStack>
        </Sheet.Frame>
      </Sheet>
    </>
  )
}

export default SheetClub
