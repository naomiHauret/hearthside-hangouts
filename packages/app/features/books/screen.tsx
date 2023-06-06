import { Paragraph, YStack } from '@my/ui'

/**
 * Universal screen with a tabs navigator. Allows the user to see their starred books, reviewed books, current reads, and explore other books.
 * @returns Books page
 */
export function BooksScreen() {
  return (
    <YStack f={1} flexGrow={1}>
      <Paragraph>Books screen</Paragraph>
    </YStack>
  )
}
