import { useState } from "react";
import * as ImagePicker from 'expo-image-picker';

export function useFilepickerImage(defaultImageSrc?: string) {
    const [imageUri, setImageUri] = useState(defaultImageSrc && defaultImageSrc !== '' ? defaultImageSrc : defaultImageSrc);

    async function pickImage() {
      // No permissions request is necessary for launching the image library
      let result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.All,
        allowsEditing: true,
        aspect: [4, 3],
        quality: 1,
      });
  
  
      if (!result.canceled) {
        setImageUri(result?.assets[0]?.uri);
      }
    };

    return {
        pickImage,
        imageUri
    }

    
} 