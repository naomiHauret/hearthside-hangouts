import type {
  Polybase,
  CollectionList,
  QueryWhereOperator,
  CollectionRecord,
} from '@polybase/client'
import type { RatedSourceMaterial } from 'app/hooks'
import { Card, Paragraph, ZStack, YStack, XStack, Image } from '@my/ui'
import { usePolybase } from 'app/provider'
import { useQuery } from '@tanstack/react-query'

function useFilteredBooks(args?: {
  field: string
  op: QueryWhereOperator
  value: string | CollectionRecord<any>
  shouldFetch: boolean
}) {
  const polybaseDb = usePolybase((s) => s.db) as Polybase
  const queryBooks = useQuery({
    queryKey: ['source-materials', args?.field, args?.op, args?.value],
    queryFn: async (): Promise<CollectionList<RatedSourceMaterial>> => {
      const collectionReference = polybaseDb.collection('SourceMaterial')
      if (args?.field) {
        const records = await collectionReference.where(args?.field, args.op, args?.value).get()
        return records
      }
      return await collectionReference.get()
    },
  })

  return queryBooks
}

/**
 * Universal screen with a tabs navigator. Allows the user to see their starred books, reviewed books, current reads, and explore other books.
 * @returns Books page
 */
export function BooksScreen() {
  const queryBooks = useFilteredBooks()
  return (
    <YStack px="$3" f={1} flexGrow={1}>
      <Paragraph pt="$6" size="$2" theme="alt1">
        Explore books currently being read by clubs on Hearthside Hangouts.
      </Paragraph>
      <XStack flexWrap="wrap" gap="$4" pt="$6">
        {queryBooks?.data?.data?.map((bookRawData) => {
          const book = bookRawData.data
          return (
            <Card aspectRatio={'1 / 1.5'} flexBasis="33%" flexGrow={1} key={`resource-${book.id}`}>
              <ZStack mx="auto" f={1} flexGrow={1} aspectRatio={1 / 1.5} bg="$color12">
                <XStack fullscreen f={1} flexGrow={1}>
                  {book.thumbnailURI && book.thumbnailURI !== '' && (
                    <Image
                      opacity={0.2}
                      width="100%"
                      aspectRatio={1 / 1.75}
                      source={{ uri: book.thumbnailURI }}
                    />
                  )}
                </XStack>
                <XStack fullscreen f={1} elevation="$8" ai="center" jc="center" flexGrow={1}>
                  {book.thumbnailURI && book.thumbnailURI !== '' && (
                    <Image
                      width="62.5%"
                      aspectRatio={1 / 1.5}
                      source={{ uri: book.thumbnailURI }}
                    />
                  )}
                </XStack>
              </ZStack>
            </Card>
          )
        })}
      </XStack>
    </YStack>
  )
}
