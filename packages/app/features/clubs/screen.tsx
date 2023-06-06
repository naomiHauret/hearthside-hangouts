import { Paragraph, YStack } from '@my/ui'

/**
 * Universal screen with a tabs navigator. Allows the user to see their clubs and explore other clubs.
 * @returns Clubs page
 */
export function ClubsScreen() {
  return (
    <YStack f={1} flexGrow={1} jc="center" ai="center" p="$4" space>
      <Paragraph>Clubs screen</Paragraph>
    </YStack>
  )
}
