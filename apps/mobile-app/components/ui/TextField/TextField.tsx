import { Ionicons } from "@expo/vector-icons";
import React, { useState } from "react";
import { Pressable, TextInput, TextInputProps } from "react-native";

import { COLORS, FONTS } from "@/constants";

import { HStack, VStack } from "../Stack/Stack";
import Text from "../Text/Text";

interface TextFieldProps extends Omit<
  TextInputProps,
  "value" | "onChangeText"
> {
  label: string;
  value: string;
  onChangeText: (value: string) => void;
  error?: string;
}

const TextField: React.FC<TextFieldProps> = ({
  label,
  value,
  onChangeText,
  error,
  secureTextEntry,
  ...inputProps
}) => {
  const [hidden, setHidden] = useState(true);
  const revealLabel = hidden ? "Show password" : "Hide password";

  return (
    <VStack spacing="xs" className="w-full">
      <Text className="font-app-medium text-[13px] text-muted">{label}</Text>
      <HStack
        align="center"
        spacing="none"
        className="h-[50px] rounded-xl border border-border bg-surface px-4"
      >
        <TextInput
          accessibilityLabel={label}
          value={value}
          onChangeText={onChangeText}
          placeholderTextColor={COLORS.muted}
          secureTextEntry={secureTextEntry ? hidden : false}
          className="h-full flex-1 text-base text-text"
          style={{ fontFamily: FONTS.regular }}
          {...inputProps}
        />
        {secureTextEntry ? (
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={revealLabel}
            onPress={() => setHidden((current) => !current)}
            hitSlop={4}
          >
            <VStack
              spacing="none"
              align="center"
              justify="center"
              className="h-[50px] pl-3"
            >
              <Ionicons
                name={hidden ? "eye" : "eye-off"}
                size={20}
                color={COLORS.muted}
              />
            </VStack>
          </Pressable>
        ) : null}
      </HStack>
      {error ? (
        <Text className="font-app-medium text-[13px] text-danger">{error}</Text>
      ) : null}
    </VStack>
  );
};

export default TextField;
