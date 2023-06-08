import type { CollectionRecordResponse, Polybase } from '@polybase/client'
import type { providers } from 'ethers'
import { UseMutationResult, UseQueryResult, useQueryClient } from '@tanstack/react-query'
import { useMutation, useQuery } from '@tanstack/react-query'
import { usePolybase } from '../../provider/polybase'
import { isAddress } from 'ethers/lib/utils'
import { useMagicWallet } from 'app/provider'
import { signMessage } from 'app/helpers'

/**
 * Represents the base data of a user profile
 */
export interface UserProfileBaseData {
  avatarURI: string,
  bio: string,
  displayName: string,
  id: string // this is actually the ethereum address of the user
  publicAddress: string, // NOT THE ETHEREUM ADDRESS ! this is the public key but as a string
}


/**
 * User profile as returned from Polybase (includes the creator public key)
 */
export interface UserProfile extends UserProfileBaseData {
  publicKey: Object
}

/**
 * Custom hook for creating, updating and reading user profiles data stored on Polybase.
 *
 * @param {string|null} userEthereumAddress - The Ethereum address to get profile data for.
 */
export function useUserProfile(userEthereumAddress?: string | null): {
    queryUserProfile: UseQueryResult<UserProfile | undefined, unknown>
    mutationCreateUserProfile: UseMutationResult<CollectionRecordResponse<any, any>, unknown, {
        publicEthAddress: string;
        displayName: string;
        bio: string;
        avatarURI: string;
    }, unknown>
    mutationUpdateUserProfile: UseMutationResult<CollectionRecordResponse<any, any>, unknown, {
        publicEthAddress: string;
        displayName: string;
        bio: string;
        avatarURI: string;
    }, unknown>
        
} {
    const queryClient = useQueryClient()
    const polybaseDb = usePolybase((s) => s.db) as Polybase
    const walletClient = useMagicWallet((s) => s.walletClient)

    /**
     * Query ; fetches a user profile data from Polybase for a given <id> (our id here is a ethereum address)
     */
    const queryUserProfile = useQuery({
        queryKey: ['profile', userEthereumAddress],
        queryFn: async () => {
            const collectionReference = polybaseDb.collection("UserProfile");
            const record = await collectionReference.record(`${userEthereumAddress}`).get();
            return record
        },
        select(data): undefined | UserProfile {
          if(data?.data !== null) {
            return data?.data
          }  
        },
       enabled: !isAddress(`${userEthereumAddress}`) || !polybaseDb ? false : true
    })

    /**
     * Mutation ; creates a user profile on Polybase
     */
    const mutationCreateUserProfile = useMutation(async function(values: {
        publicEthAddress: string,
        displayName: string,
        bio: string, 
        avatarURI: string
    }): Promise<CollectionRecordResponse<any, UserProfile>> {

        // Grab the signer
        const signer = (await walletClient?.getSigner(
            values.publicEthAddress
          ))  as providers.JsonRpcSigner
    
        // Add it to our polybase instance
        // tried to assign in to the polybase instance in the sign in hook but it looks like we have to add it everywhere we need a signature
        // Not very elegant but we have to !
        polybaseDb.signer(async (data: string) => {
            const sig = await signMessage({
              signer,
              message: data,
            })
            return { h: 'eth-personal-sign', sig: sig.signature }
          })
        const collectionReference = polybaseDb.collection("UserProfile");
        // Constructor: publicEthAddress: string, displayName: string, bio: string, avatarURI: string
        return await collectionReference.create([
            values.publicEthAddress, 
            values.displayName,
            values.bio, 
            values.avatarURI,
         ]);
    }, {
        onSuccess(data, variables, context) {
            queryClient.setQueryData(['profile', variables.publicEthAddress], () => ({
                ...data.data
            }))
        },
    })

    /**
     * Mutation ; updates a user profile on Polybase fetches for a given <id> (our id here is a ethereum address)
    */
    const mutationUpdateUserProfile = useMutation(async function(values: {
        publicEthAddress: string,
        displayName: string,
        bio: string, 
        avatarURI: string
    }) {
        // Grab the signer
        const signer = (await walletClient?.getSigner(
            values.publicEthAddress
          ))  as providers.JsonRpcSigner
    
        // Add it to our polybase instance
        // tried to assign in to the polybase instance in the sign in hook but it looks like we have to add it everywhere we need a signature
        // Not very elegant but we have to !
        polybaseDb.signer(async (data: string) => {
            const sig = await signMessage({
              signer,
              message: data,
            })
            return { h: 'eth-personal-sign', sig: sig.signature }
          })
        const collectionReference = polybaseDb.collection("UserProfile");
        // updateProfile(displayName: string, bio: string, avatarURI: string)
        return await collectionReference
        .record(values.publicEthAddress)
        .call("updateProfile", [values.displayName, values.bio, values.avatarURI]);
    
    }, {
        onSuccess(data, variables, context) {
            queryClient.setQueryData(['profile', variables.publicEthAddress], (oldData: any) => ({
                ...oldData,
                displayName: variables.displayName,
                bio: variables.bio, 
                avatarURI: variables.avatarURI
        
            }))
        },
    })
    return {
        queryUserProfile,
        mutationCreateUserProfile,
        mutationUpdateUserProfile,
    }
}

export default useUserProfile