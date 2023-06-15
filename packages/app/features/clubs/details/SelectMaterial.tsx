import { SourceMaterial, useClubMaterial, useClubs } from '../../../hooks'
import {
  Input,
  Image,
  Paragraph,
  XStack,
  YStack,
  YGroup,
  ListItem,
  Spinner,
  Separator,
  Button,
  H4,
} from '@my/ui'
import { useSearchBooks, useSourceMaterial } from '../../../hooks'
import { Check, Search } from '@tamagui/lucide-icons'
import { Fragment, useState } from 'react'

interface SelectMaterialProps {
  defaultValues: {
    idClub: string
  }
  setIsUpdateClubMaterialOpen: any
}

export const SelectMaterial = (props: SelectMaterialProps) => {
  const {
    defaultValues: { idClub },
    setIsUpdateClubMaterialOpen,
  } = props
  const [selectedMaterial, setSelectedMaterial] = useState<SourceMaterial | undefined>()
  const { inputSearchValue, setInputSearchValue, querySearchBooks } = useSearchBooks()
  const { mutationSetClubMaterial, queryListClubMaterial } = useClubs(idClub)
  const { queryClubMaterialDetails } = useClubMaterial({
    idClub,
    idClubMaterial: `${idClub}/${selectedMaterial?.id}`,
    shouldFetchClubMaterial: selectedMaterial?.id ? true : false,
  })
  const { mutationCreateSourceMaterial, querySourceMaterial } = useSourceMaterial({
    id: selectedMaterial?.id,
    shouldFetchMaterial: selectedMaterial ? true : false,
    onQuerySourceMaterialSuccess: async () => {
      await mutationCreateSourceMaterial.mutateAsync(selectedMaterial as SourceMaterial)
    },
  })
  const { mutationCreateClubMaterial } = useClubMaterial({
    idClubMaterial: `${idClub}/${selectedMaterial?.id}`,
    shouldFetchClubMaterial: selectedMaterial?.id ? true : false,
  })

  return (
    <YStack pb="$3">
      {selectedMaterial?.id ? (
        <YStack px="$3">
          <YStack mx="auto" ai="center" jc="center" px="$3" py="$6">
            <H4>{selectedMaterial?.title}</H4>
            <Paragraph theme="alt2" size="$1" mt="auto">
              {selectedMaterial?.authors?.toString().replace(',', ', ')}
            </Paragraph>
            <Paragraph theme="alt2" pb="$4" size="$1" mt="auto">
              {selectedMaterial?.yearPublished}
            </Paragraph>
            <YStack elevation="$4" overflow="hidden" borderRadius="$2" bg="$color6" width={150}>
              <Image
                source={{
                  uri: selectedMaterial?.thumbnailURI,
                  width: 150,
                  height: 225,
                }}
                minWidth="100%"
              />
            </YStack>

            <Paragraph py="$6" theme="alt1" size="$2">
              {selectedMaterial?.description}
            </Paragraph>
            <Button
              onPress={async () => {
                if (
                  !mutationCreateClubMaterial?.isSuccess ||
                  (!queryClubMaterialDetails?.isSuccess && !queryClubMaterialDetails?.data)
                ) {
                  mutationCreateClubMaterial.mutateAsync(
                    {
                      idClub,
                      idSourceMaterial: selectedMaterial?.id,
                    },
                    {
                      async onSuccess(data) {
                        if (data?.data)
                          await mutationSetClubMaterial?.mutateAsync(
                            {
                              idClub,
                              idClubMaterial: `${idClub}/${selectedMaterial?.id}`,
                            },
                            {
                              onSuccess() {
                                mutationCreateClubMaterial.reset()
                                mutationCreateSourceMaterial.reset()
                                mutationSetClubMaterial.reset()
                                setIsUpdateClubMaterialOpen(false)
                              },
                            }
                          )
                      },
                    }
                  )
                } else {
                  await mutationSetClubMaterial?.mutateAsync(
                    {
                      idClub,
                      idClubMaterial: mutationCreateClubMaterial.data.id,
                    },
                    {
                      onSuccess() {
                        setIsUpdateClubMaterialOpen(false)
                      },
                    }
                  )
                }
              }}
              themeInverse
              disabled={[
                mutationCreateSourceMaterial.isLoading,
                mutationCreateClubMaterial.isLoading,
                mutationSetClubMaterial.isLoading,
              ].includes(true)}
              size="$4"
            >
              {[
                mutationCreateClubMaterial.isLoading,
                mutationCreateSourceMaterial.isLoading,
                mutationSetClubMaterial.isLoading,
              ].includes(true) && <Spinner color="$color" />}
              <Button.Text fontWeight="bold">
                {[mutationCreateClubMaterial.isLoading, mutationSetClubMaterial.isLoading].includes(
                  true
                )
                  ? 'Setting...'
                  : mutationCreateSourceMaterial.isLoading
                  ? 'One moment...'
                  : 'Select'}
              </Button.Text>
            </Button>
            <Paragraph py="$2" mx="auto" theme="alt1" size="$2">
              or
            </Paragraph>
            <Button
              disabled={[
                mutationCreateClubMaterial.isLoading,
                mutationSetClubMaterial.isLoading,
              ].includes(true)}
              onPress={() => setSelectedMaterial(undefined)}
              chromeless
              size="$2"
            >
              <Button.Text fontWeight="bold">Pick another read</Button.Text>
            </Button>
          </YStack>
        </YStack>
      ) : (
        <>
          <XStack pb="$3" gap="$2" ai="center">
            {querySearchBooks?.isLoading && inputSearchValue?.trim()?.length > 0 ? (
              <Spinner theme="gray" size="large" />
            ) : (
              <Search color="gray" />
            )}

            <Input
              value={inputSearchValue}
              flexGrow={1}
              onChangeText={setInputSearchValue}
              placeholder="Search for a book..."
            />
          </XStack>
          {querySearchBooks?.isSuccess && querySearchBooks?.data?.pages && (
            <>
              <YStack pb="$8">
                {(querySearchBooks?.data?.pages?.length ?? 0) > 0 && (
                  <YGroup mx="$-6" px="$3" separator={<Separator />}>
                    {querySearchBooks?.data?.pages?.map((page, index) => (
                      <Fragment key={`page-${index}-${inputSearchValue}`}>
                        {page?.items.map((item) => (
                          <YGroup.Item key={item?.industryIdentifiers?.[0]?.identifier ?? item?.id}>
                            <ListItem
                              onPress={() => {
                                setSelectedMaterial({
                                  id:
                                    item?.industryIdentifiers?.[0]?.identifier ??
                                    (item?.id as string),
                                  title: item?.title,
                                  description: item?.description,
                                  authors: item?.authors,
                                  format: 'text',
                                  type: 'book',
                                  thumbnailURI: item?.imageLinks?.thumbnail as string,
                                  language: item?.language,
                                  genres: item?.categories?.length > 0 ? item?.categories : [],
                                  yearPublished: item?.publishedDate?.split('-')?.[0],
                                  maturityRating: item?.maturityRating,
                                })
                              }}
                              bg="transparent"
                              icon={
                                <YStack
                                  overflow="hidden"
                                  borderRadius="$2"
                                  bg="$color6"
                                  width={100}
                                >
                                  <Image
                                    source={{
                                      uri: item?.imageLinks?.thumbnail,
                                      width: 100,
                                      height: 150,
                                    }}
                                    minWidth="100%"
                                  />
                                </YStack>
                              }
                              title={item?.title}
                              subTitle={
                                <>
                                  <Paragraph theme="alt2" size="$2" mt="auto">
                                    {item?.authors?.toString().replace(',', ', ')}
                                  </Paragraph>
                                  <Paragraph theme="alt2" size="$1">
                                    {item?.publishedDate?.split('-')?.[0]}
                                  </Paragraph>
                                </>
                              }
                            ></ListItem>
                          </YGroup.Item>
                        ))}
                      </Fragment>
                    ))}
                  </YGroup>
                )}
              </YStack>
              {querySearchBooks?.hasNextPage && (
                <Button onPress={async () => await querySearchBooks?.fetchNextPage()}>
                  <Button.Text>Show more</Button.Text>
                </Button>
              )}
            </>
          )}
        </>
      )}
    </YStack>
  )
}

export default SelectMaterial
