import { Platform } from 'react-native';

/** Padding superior para headers: nativo usa 56px para la status bar, web usa 20px. */
export const HEADER_TOP = Platform.OS === 'web' ? 20 : 56;
