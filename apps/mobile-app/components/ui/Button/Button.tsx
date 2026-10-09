import { Href, useRouter } from "expo-router";
import React from "react";
import { ActivityIndicator, Pressable, PressableProps } from "react-native";
import { cn } from "shared";

import { COLORS } from "@/constants";

import { HStack } from "../Stack/Stack";
import Text from "../Text/Text";

export type ButtonVariant =
  "primary" | "secondary" | "outline" | "ghost" | "link" | "quietDanger";
export type ButtonSize = "sm" | "md" | "lg";

export interface ButtonProps extends Omit<PressableProps, "onPress"> {
  /** Button text (alternative to children) */
  text?: string;
  /** Button content */
  children?: React.ReactNode;
  /** Visual variant */
  variant?: ButtonVariant;
  /** Button size */
  size?: ButtonSize;
  /** Full width button */
  fullWidth?: boolean;
  /** Left icon */
  leftIcon?: React.ReactNode;
  /** Right icon */
  rightIcon?: React.ReactNode;
  /** Navigation route (uses expo-router) */
  href?: Href;
  /** Press handler (ignored if href provided) */
  onPress?: () => void;
  /** Disabled state */
  disabled?: boolean;
  /** Loading state */
  loading?: boolean;
  /** Custom container className */
  className?: string;
  /** Custom text className */
  textClassName?: string;
}

const variantStyles: Record<
  ButtonVariant,
  { container: string; text: string }
> = {
  primary: {
    container: "bg-primary",
    text: "text-onPrimary",
  },
  secondary: {
    container: "bg-surface",
    text: "text-text",
  },
  outline: {
    container: "border border-primary bg-transparent",
    text: "text-primary",
  },
  ghost: {
    container: "bg-transparent",
    text: "text-primary",
  },
  link: {
    container: "",
    text: "text-primary underline",
  },
  quietDanger: {
    container: "bg-transparent",
    text: "text-danger",
  },
};

const sizeStyles: Record<ButtonSize, { container: string; text: string }> = {
  sm: {
    container: "h-9 px-4 rounded-full",
    text: "text-sm",
  },
  md: {
    container: "h-11 px-6 rounded-full",
    text: "text-base",
  },
  lg: {
    container: "h-[50px] px-6 rounded-full",
    text: "text-base",
  },
};

const Button: React.FC<ButtonProps> = ({
  children,
  text,
  variant = "primary",
  size = "md",
  fullWidth = false,
  leftIcon,
  rightIcon,
  href,
  onPress,
  disabled = false,
  loading = false,
  className,
  textClassName,
  ...pressableProps
}) => {
  const router = useRouter();

  const handlePress = () => {
    if (disabled || loading) return;

    if (href) {
      router.push(href as Href);
    } else if (onPress) {
      onPress();
    }
  };

  const variantStyle = variantStyles[variant];
  const sizeStyle = sizeStyles[size];
  const content = text || children;

  return (
    <Pressable
      accessibilityRole="button"
      onPress={handlePress}
      disabled={disabled || loading}
      style={({ pressed }) => ({
        opacity: pressed ? 0.7 : disabled ? 0.5 : 1,
      })}
      className={cn(
        "flex-row items-center justify-center",
        variantStyle.container,
        sizeStyle.container,
        fullWidth && "w-full",
        className
      )}
      {...pressableProps}
    >
      <HStack spacing="sm" align="center" justify="center">
        {leftIcon && !loading ? leftIcon : null}

        {loading ? (
          <ActivityIndicator
            size="small"
            color={
              variant === "primary"
                ? COLORS.onPrimary
                : variant === "quietDanger"
                  ? COLORS.danger
                  : COLORS.text
            }
            testID="button-loading"
          />
        ) : (
          <Text
            className={cn(
              "text-center font-app-bold",
              variantStyle.text,
              sizeStyle.text,
              textClassName
            )}
          >
            {content}
          </Text>
        )}

        {rightIcon && !loading ? rightIcon : null}
      </HStack>
    </Pressable>
  );
};

export default Button;
