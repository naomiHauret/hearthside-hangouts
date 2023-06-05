
import { Magic } from '@magic-sdk/react-native-expo';
import Constants from 'expo-constants';

export const magic = new Magic(`${Constants?.expoConfig?.extra?.magicKey}`);
