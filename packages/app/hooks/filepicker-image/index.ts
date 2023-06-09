import type { ImagePickerAsset } from "expo-image-picker";
import type { FileToUpload } from "../upload-file";
import { useState } from "react";
import * as ImagePicker from 'expo-image-picker';

export function useFilepickerImage(args: {defaultImageSrc?: string, aspect: [number, number]}): {
  pickImage: () => Promise<void>
  imageUri: string | undefined
  imageFile: undefined | FileToUpload | null

} {
  const { defaultImageSrc, aspect } = args
  const [imageUri, setImageUri] = useState(defaultImageSrc && defaultImageSrc !== '' ? defaultImageSrc : defaultImageSrc);
  const [imageFile, setImageFile] = useState<FileToUpload | null | undefined >(null);
  
  /**
   * Image picker that leverages Expo's library `ImagePicker` (`expo-image-picker`) ; sets the image URI and image file in a local state
   */
  async function pickImage() {
    // No permissions request is necessary for launching the image library
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.All,
      allowsEditing: true,
      aspect: aspect ?? [1 , 1],
      quality: 0.7,
      base64: true,
      
    });
    if (!result.canceled) {
      const raw = result?.assets[0] as ImagePickerAsset
      const imagePath = raw.uri
      const imageExt = raw.uri.split('.').pop();
      const imageMime = `image/${imageExt}`;
      setImageFile({
        uri: imagePath,
        mimeType: imageMime,
        name: `pfp.${imageExt}`
      })
      setImageUri(result?.assets[0]?.uri);
    }
  };

  return {
    pickImage,
    imageUri,
    imageFile,
  }
} 