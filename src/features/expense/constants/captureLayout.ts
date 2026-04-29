import { Dimensions } from 'react-native';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

export const CARD_MARGIN = 6;
export const CARD_WIDTH = SCREEN_WIDTH - CARD_MARGIN * 2;
export const CARD_HEIGHT = CARD_WIDTH * 1.33;
export const CARD_RADIUS = 26;
