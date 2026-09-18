import { useWindowDimensions, Platform } from 'react-native';

export function useResponsive() {
  const { width, height } = useWindowDimensions();
  const isSmallPhone = width < 350;
  const isPhone = width < 600;
  const isTablet = width >= 600 && width < 900;
  const isLargeTablet = width >= 900;

  const isLandscape = width > height;
  const horizontalPadding = isSmallPhone ? 12 : isPhone ? 16 : isTablet ? 32 : 48;
  const verticalPadding = isSmallPhone ? 12 : isPhone ? 16 : isTablet ? 24 : 32;
  const topPadding = isSmallPhone ? 36 : isPhone ? 44 : isTablet ? 56 : 64;
  const cardPadding = isSmallPhone ? 14 : isPhone ? 16 : isTablet ? 24 : 32;
  const iconSize = isSmallPhone ? 20 : isPhone ? 22 : isTablet ? 28 : 32;
  const titleSize = isSmallPhone ? 20 : isPhone ? 22 : isTablet ? 26 : 28;
  const sectionHeaderSize = isSmallPhone ? 16 : isPhone ? 17 : isTablet ? 20 : 22;
  const bodySize = isSmallPhone ? 13 : isPhone ? 14 : isTablet ? 16 : 17;
  const buttonPaddingVertical = isSmallPhone ? 12 : isPhone ? 14 : isTablet ? 16 : 18;
  const buttonPaddingHorizontal = isSmallPhone ? 16 : isPhone ? 20 : isTablet ? 28 : 36;
  const buttonRadius = 12;
  const cardRadius = isTablet ? 20 : 16;
  const inputPadding = isSmallPhone ? 12 : isPhone ? 14 : isTablet ? 16 : 18;
  const chipRadius = 20;
  const maxContentWidth = isTablet ? 720 : isLargeTablet ? 960 : width;

  return {
    width,
    height,
    isSmallPhone,
    isPhone,
    isTablet,
    isLargeTablet,
    isLandscape,
    horizontalPadding,
    verticalPadding,
    topPadding,
    cardPadding,
    iconSize,
    titleSize,
    sectionHeaderSize,
    bodySize,
    buttonPaddingVertical,
    buttonPaddingHorizontal,
    buttonRadius,
    cardRadius,
    inputPadding,
    chipRadius,
    maxContentWidth,
  };
}
