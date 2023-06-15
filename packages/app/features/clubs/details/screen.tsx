import type { Polybase } from '@polybase/client'

import {
  Avatar,
  Button,
  Circle,
  H1,
  H2,
  H3,
  Header,
  Image,
  Paragraph,
  SizableText,
  Spinner,
  VisuallyHidden,
  XStack,
  YStack,
  ZStack,
} from '@my/ui'
import { BookTemplate, BookUp, Edit2, Users } from '@tamagui/lucide-icons'
import { useQuery } from '@tanstack/react-query'
import { uriToUrl } from 'app/helpers'
import {
  useClubMaterial,
  useClubs,
  useCurrentUser,
  useSourceMaterial,
  useUserProfile,
} from 'app/hooks'
import { usePolybase } from 'app/provider'
import React, { useEffect, useState } from 'react'
import { createParam } from 'solito'
import { LinearGradient } from 'tamagui/linear-gradient'
import { isAddress } from 'ethers/lib/utils'
import SheetUpdateDetails from './SheetUpdateDetails'
import FormClub from '../Form'
import SelectMaterial from './SelectMaterial'

const { useParam } = createParam<{ id: string }>()

/**
 * Universal screen that displays a club details, allows the moderator to update its details, set its materials, and allow other users to join/leave it.
 * @returns Club details page
 */
export function ClubDetailScreen() {
  const [id] = useParam('id')
  const { userInfo } = useCurrentUser()
  const {
    queryClub,
    queryClubMembers,
    mutationUpdateClub,
    mutationJoinClub,
    mutationDestroyMembership,
  } = useClubs(id)

  const polybaseDb = usePolybase((s) => s.db) as Polybase
  const [isUpdateDetailsOpen, setIsUpdateDetailsOpen] = useState(false)
  const [isUpdateClubMaterialOpen, setIsUpdateClubMaterialOpen] = useState(false)
  const { queryClubMaterialDetails } = useClubMaterial({
    shouldFetchClubMaterial: true,
    idClubMaterial: queryClub?.data?.currentClubMaterial as string,
  })

  const { querySourceMaterial } = useSourceMaterial({
    id: queryClubMaterialDetails?.data?.material?.id as string,
    shouldFetchMaterial: true,
  })

  useEffect(() => {
    if (isUpdateDetailsOpen === false) mutationUpdateClub.reset()
  }, [isUpdateDetailsOpen])
  useEffect(() => {
    if (mutationUpdateClub?.isSuccess) setIsUpdateDetailsOpen(false)
  }, [mutationUpdateClub?.isSuccess])

  /**
   * Query ; checks if a given UserProfile<ethereumAddress> is a member of a Club <idClub>
   *
   */
  const queryIsCurrentUserMember = useQuery({
    queryKey: ['membership', `${userInfo?.publicAddress}/${id}`],
    queryFn: async () => {
      const collectionReference = polybaseDb.collection('ClubMembership')
      const record = await collectionReference
        .record(`${userInfo?.publicAddress}/${id}` as string)
        .get()
      return record
    },

    enabled:
      !isAddress(`${userInfo?.publicAddress}`) || !id || id === null || !polybaseDb ? false : true,
  })

  const moderator = useUserProfile({
    userEthereumAddress: queryClub?.data?.creator?.id,
    shouldFetchMemberships: false,
    shouldFetchProfile: true,
  })

  return (
    <>
      <YStack>
        <Header space="$6">
          <ZStack f={1} flexGrow={1} maxWidth={980} aspectRatio={1.25 / 1} bg="$color8">
            <XStack fullscreen f={1} flexGrow={1} bg="$green7">
              {queryClub?.data?.coverURI && queryClub?.data?.coverURI !== '' && (
                <Image
                  width="100%"
                  aspectRatio={1.25 / 1}
                  height={250}
                  source={{ uri: uriToUrl(queryClub?.data?.coverURI) }}
                />
              )}
            </XStack>
            <LinearGradient
              f={1}
              flexGrow={1}
              colors={['$backgroundPress', 'transparent']}
              start={[0, 1.008]}
              end={[0, 0]}
            />
            {moderator?.queryUserProfile?.data?.id &&
              userInfo?.publicAddress === moderator?.queryUserProfile?.data?.id && (
                <Button
                  onPress={() => setIsUpdateDetailsOpen(true)}
                  themeInverse
                  marginTop="auto"
                  marginBottom="$-2"
                  elevation="$2"
                  marginStart="auto"
                  marginEnd="$3"
                  icon={Edit2}
                  circular
                >
                  <VisuallyHidden>
                    <Button.Text>Update club info</Button.Text>
                  </VisuallyHidden>
                </Button>
              )}
          </ZStack>
          <YStack mt="$-2" px="$3">
            <H1 fontFamily="$heading">{queryClub?.data?.name}</H1>
          </YStack>
        </Header>
        <YStack pt="$3" px="$3">
          <Paragraph pb="$4" theme="alt1">
            {queryClub?.data?.description}
          </Paragraph>

          <XStack jc="space-between" ai="flex-end">
            <YStack>
              <XStack ai="center">
                <Users color="$color9" size="$1" />
                <Paragraph color="$color9" size="$1" paddingStart="$2">
                  {queryClubMembers?.data?.count} member
                  {(queryClubMembers?.data?.count ?? 1) > 1 && 's'}
                </Paragraph>
              </XStack>

              <XStack pt="$2" paddingEnd="$4" ai="center" space="$3">
                <SizableText size="$1" theme="alt2">
                  Ran by
                </SizableText>
                <XStack
                  py="$1.5"
                  paddingStart="$1.5"
                  paddingEnd="$3"
                  borderRadius="$12"
                  bg="$backgroundStrong"
                  space="$2"
                >
                  {moderator?.queryUserProfile?.data?.avatarURI &&
                  moderator?.queryUserProfile?.data?.avatarURI !== '' ? (
                    <Avatar circular size="$2">
                      <Avatar.Image src={uriToUrl(moderator?.queryUserProfile?.data?.avatarURI)} />
                      <Avatar.Fallback bc="$gray6" />
                    </Avatar>
                  ) : (
                    <Circle bc="$gray6" size="$2" />
                  )}
                  <SizableText color="$color12" size="$2" fontWeight="bold">
                    {moderator?.queryUserProfile?.data?.displayName}
                  </SizableText>
                </XStack>
              </XStack>
            </YStack>
            {userInfo?.publicAddress &&
              moderator?.queryUserProfile?.data?.id &&
              moderator?.queryUserProfile?.data?.id !== userInfo?.publicAddress && (
                <Button
                  disabled={[
                    queryIsCurrentUserMember.isLoading,
                    mutationDestroyMembership.isLoading,
                    mutationJoinClub.isLoading,
                  ].includes(true)}
                  themeInverse
                >
                  <Button.Text
                    onPress={async () => {
                      if (queryIsCurrentUserMember?.data?.data?.id) {
                        await mutationDestroyMembership.mutateAsync({
                          idClub: queryIsCurrentUserMember?.data?.data?.id,
                        })
                      } else {
                        await mutationJoinClub.mutateAsync({ idClub: id as string })
                      }
                    }}
                    fontWeight="bold"
                  >
                    {queryIsCurrentUserMember?.data?.data?.id ? (
                      <>{mutationDestroyMembership.isLoading ? 'Leaving...' : 'Leave'}</>
                    ) : (
                      <>{mutationJoinClub.isLoading ? 'Joining...' : 'Join'}</>
                    )}
                  </Button.Text>
                  {[
                    queryIsCurrentUserMember?.isLoading,
                    mutationDestroyMembership.isLoading,
                    mutationJoinClub.isLoading,
                  ].includes(true) && <Spinner />}
                </Button>
              )}
          </XStack>
          <YStack
            borderRadius="$3"
            theme="Card"
            bg="$backgroundStrong"
            pt="$4"
            pb="$6"
            px="$4"
            mt="$4"
          >
            <XStack ai="center" pb="$4">
              <H2 fontFamily="$body" fontWeight="bold" color="$color12" size="$5">
                Current read
              </H2>
              {queryClub?.data?.currentClubMaterial &&
                queryClub?.data?.currentClubMaterial !== '' &&
                moderator?.queryUserProfile?.data?.id &&
                userInfo?.publicAddress === moderator?.queryUserProfile?.data?.id && (
                  <Button
                    marginStart="auto"
                    onPress={() => setIsUpdateClubMaterialOpen(true)}
                    ai="center"
                    jc="center"
                    flexDirection="row"
                    unstyled
                  >
                    <Button.Text fontWeight="bold" color="$color11" py="$2">
                      Change
                    </Button.Text>
                  </Button>
                )}
            </XStack>
            {!queryClub?.data?.currentClubMaterial ||
            queryClub?.data?.currentClubMaterial === '' ? (
              <>
                {moderator?.queryUserProfile?.data?.id &&
                userInfo?.publicAddress === moderator?.queryUserProfile?.data?.id ? (
                  <YStack
                    py="$6"
                    px="$4"
                    ai="center"
                    jc="center"
                    borderStyle="dashed"
                    borderWidth="$1"
                    borderColor="$color6"
                    theme="alt1"
                  >
                    <Paragraph pb="$6" ta="center" fontStyle="italic">
                      You didn't select any read for your club yet.
                    </Paragraph>
                    <Button
                      onPress={() => setIsUpdateClubMaterialOpen(true)}
                      ai="center"
                      jc="center"
                      flexDirection="column"
                      unstyled
                    >
                      <BookUp size="$6" />
                      <Button.Text fontWeight="bold" color="$color11" py="$2">
                        Pick a read
                      </Button.Text>
                    </Button>
                  </YStack>
                ) : (
                  <>
                    <BookTemplate />
                  </>
                )}
              </>
            ) : (
              <XStack gap="$3">
                <YStack overflow="hidden" borderRadius="$2" bg="$color6" width={100}>
                  <Image
                    source={{
                      uri: querySourceMaterial?.data?.thumbnailURI,
                      width: 100,
                      height: 150,
                    }}
                    minWidth="100%"
                  />
                </YStack>
                <YStack>
                  <Paragraph fontFamily="$body" size="$4">
                    {querySourceMaterial?.data?.title}
                  </Paragraph>
                  <Paragraph theme="alt1" fontFamily="$body" size="$1">
                    {querySourceMaterial?.data?.authors.toString()}
                  </Paragraph>
                  <Paragraph theme="alt2" fontFamily="$body" size="$1">
                    {querySourceMaterial?.data?.yearPublished}
                  </Paragraph>
                  <Paragraph theme="alt2" mt="auto" fontFamily="$body" size="$1">
                    {querySourceMaterial?.data?.genres.toString()}
                  </Paragraph>
                </YStack>
              </XStack>
            )}
          </YStack>
        </YStack>
      </YStack>

      {userInfo?.publicAddress === moderator?.queryUserProfile?.data?.id &&
        queryClub?.data?.creator && (
          <>
            <SheetUpdateDetails open={isUpdateDetailsOpen} setOpen={setIsUpdateDetailsOpen}>
              <H3>Edit club details</H3>
              <FormClub
                onSubmit={async (values) => {
                  const idClub = id
                  await mutationUpdateClub.mutateAsync({
                    ...values,
                    idClub,
                    coverURI: queryClub?.data?.coverURI as string,
                  })
                }}
                statusOnSubmit={mutationUpdateClub.status}
                defaultValues={{
                  name: queryClub?.data?.name,
                  description: queryClub?.data?.description,
                  genres: queryClub?.data?.genres,
                  coverURI: uriToUrl(queryClub?.data?.coverURI),
                  openToNewMembers: queryClub?.data?.openToNewMembers,
                }}
                labelTrigger={mutationUpdateClub?.isLoading ? 'Updating...' : 'Update club details'}
              />
            </SheetUpdateDetails>
            <SheetUpdateDetails
              open={isUpdateClubMaterialOpen}
              setOpen={setIsUpdateClubMaterialOpen}
            >
              <H3>Change current club read</H3>
              <SelectMaterial
                setIsUpdateClubMaterialOpen={setIsUpdateClubMaterialOpen}
                defaultValues={{
                  idClub: id as string,
                }}
              />
            </SheetUpdateDetails>
          </>
        )}
    </>
  )
}
