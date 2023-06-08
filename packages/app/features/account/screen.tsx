import React from 'react'
import { H2,  YStack } from '@my/ui'
import FormProfile from './Form'
import { useCurrentUser, useUserProfile } from 'app/hooks'

/**
 * Universal screen with a tabs navigator. Allows the user to see their profile and edit its info in a modal.
 * @returns Account page
 */
export function AccountScreen() {
  const { userInfo } =  useCurrentUser()
  const { queryUserProfile, mutationCreateUserProfile, mutationUpdateUserProfile} = useUserProfile(userInfo?.publicAddress as string | undefined)

  return (
    <YStack p="$4" jc="center" maxWidth={480} space>
      <H2 pt="$6" pb="$4">{queryUserProfile.isSuccess && !queryUserProfile?.data ? "Create your profile" : "Update your profile"}</H2>
      {queryUserProfile.isSuccess && !queryUserProfile?.data && <>
        <FormProfile
        defaultValues={{
          publicEthAddress: userInfo?.publicAddress as string,
          displayName: '',
          bio: '',
          avatarURI: ''
        }}
        statusOnSubmit={mutationCreateUserProfile.status}
        labelTrigger={mutationCreateUserProfile?.isLoading ? "Creating..." : "Create my profile"}
        onSubmit={async (values:  { publicEthAddress: string; displayName: string; bio: string; avatarURI: string}) => {
          await mutationCreateUserProfile.mutateAsync(values)
        }}  />
      </>}


      {queryUserProfile.isSuccess && queryUserProfile?.data && <>
        <FormProfile 
                defaultValues={{
                  publicEthAddress: userInfo?.publicAddress as string,
                  displayName: queryUserProfile?.data?.displayName as string ?? "" ,
                  bio: queryUserProfile?.data?.bio as string ?? "" ,
                  avatarURI: queryUserProfile?.data?.avatarURI as string ?? "" ,
                }}
        labelTrigger={mutationCreateUserProfile?.isLoading ? "Updating..." : "Update"}
        statusOnSubmit={mutationUpdateUserProfile.status}
        onSubmit={async (values:  { publicEthAddress: string; displayName: string; bio: string; avatarURI: string}) => {
          await mutationUpdateUserProfile.mutateAsync(values)
        }}  />
      </>}

    </YStack>
  )
}
