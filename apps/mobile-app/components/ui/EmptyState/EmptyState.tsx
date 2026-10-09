import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { View } from "react-native";

import { COLORS } from "@/constants";

import Button from "../Button/Button";
import ScreenWithAnimatedHeader from "../ScreenWithAnimatedHeader/ScreenWithAnimatedHeader";
import { VStack } from "../Stack/Stack";
import Text from "../Text/Text";

export interface EmptyStateProps {
  pageTitle?: string;
  title?: string;
  subtitle: string;
  buttonText?: string;
  onButtonPress?: () => void;
  secondaryButtonText?: string;
  onSecondaryButtonPress?: () => void;
  icon?: React.ReactNode;
  headerLeft?: React.ReactNode;
  headerRight?: React.ReactNode;
  /** The screen already has the system navigation bar. */
  usesSystemHeader?: boolean;
}

export function EmptyIcon({ name }: { name: keyof typeof Ionicons.glyphMap }) {
  return <Ionicons name={name} size={48} color={COLORS.muted} />;
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
  usesSystemHeader = false,
}) => {
  const defaultIcon = (
    <Ionicons name="folder-outline" size={64} color={COLORS.muted} />
  );
  const body = (
    <VStack spacing="lg" align="center">
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
  );

  if (usesSystemHeader) {
    return (
      <View
        style={{
          flex: 1,
          justifyContent: "center",
          paddingHorizontal: 20,
        }}
      >
        {body}
      </View>
    );
  }

  return (
    <ScreenWithAnimatedHeader
      title={pageTitle ?? ""}
      headerLeft={headerLeft}
      headerRight={headerRight}
      scrollable={false}
    >
      {body}
    </ScreenWithAnimatedHeader>
  );
};

export default EmptyState;
