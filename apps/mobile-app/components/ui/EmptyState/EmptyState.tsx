import { Ionicons } from "@expo/vector-icons";
import React from "react";

import { COLORS } from "@/constants";

import Button from "../Button/Button";
import ScreenWithAnimatedHeader from "../ScreenWithAnimatedHeader/ScreenWithAnimatedHeader";
import { VStack } from "../Stack/Stack";
import Text from "../Text/Text";

export interface EmptyStateProps {
  pageTitle: string;
  title?: string;
  subtitle: string;
  buttonText?: string;
  onButtonPress?: () => void;
  secondaryButtonText?: string;
  onSecondaryButtonPress?: () => void;
  icon?: React.ReactNode;
  headerLeft?: React.ReactNode;
  headerRight?: React.ReactNode;
}

const EmptyState: React.FC<EmptyStateProps> = ({
  pageTitle,
  title,
  subtitle,
  buttonText,
  onButtonPress,
  secondaryButtonText,
  onSecondaryButtonPress,
  icon,
  headerLeft,
  headerRight,
}) => {
  const defaultIcon = (
    <Ionicons name="folder-outline" size={64} color={COLORS.muted} />
  );

  return (
    <ScreenWithAnimatedHeader
      title={pageTitle}
      headerLeft={headerLeft}
      headerRight={headerRight}
    >
      <VStack spacing="lg" align="center" justify="center" className="flex-1">
        {icon || defaultIcon}

        <VStack spacing="sm" align="center">
          {title && (
            <Text className="text-center font-app-bold text-xl text-text">
              {title}
            </Text>
          )}
          <Text className="text-center font-app-regular text-[15px] text-muted">
            {subtitle}
          </Text>
        </VStack>

        {buttonText || secondaryButtonText ? (
          <VStack spacing="sm" align="stretch" className="w-full">
            {buttonText ? (
              <Button
                text={buttonText}
                size="lg"
                fullWidth
                onPress={onButtonPress}
              />
            ) : null}
            {secondaryButtonText ? (
              <Button
                text={secondaryButtonText}
                variant="secondary"
                size="lg"
                fullWidth
                onPress={onSecondaryButtonPress}
              />
            ) : null}
          </VStack>
        ) : null}
      </VStack>
    </ScreenWithAnimatedHeader>
  );
};

export default EmptyState;
