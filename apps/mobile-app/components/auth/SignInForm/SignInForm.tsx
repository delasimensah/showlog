import { zodResolver } from "@hookform/resolvers/zod";
import React, { useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { handleAuthError, signInSchema } from "shared";
import { z } from "zod";

import { useSession } from "@/hooks";
import { createAccountSchema, type CreateAccountValues } from "@/utils";

import Button from "../../ui/Button/Button";
import { VStack } from "../../ui/Stack/Stack";
import Text from "../../ui/Text/Text";
import TextField from "../../ui/TextField/TextField";

type AccountMode = "signIn" | "signUp";

const SignInForm: React.FC = () => {
  const { signIn } = useSession();
  const [mode, setMode] = useState<AccountMode>("signIn");
  const [serverError, setServerError] = useState<string | null>(null);
  const isCreating = mode === "signUp";
  const schema = isCreating
    ? createAccountSchema
    : signInSchema.extend({ name: z.string() });
  const { control, handleSubmit, formState } = useForm<CreateAccountValues>({
    resolver: zodResolver(schema),
    defaultValues: { name: "", email: "", password: "" },
  });

  const onSubmit = handleSubmit(async (values) => {
    setServerError(null);
    try {
      await signIn("password", {
        email: values.email.trim().toLowerCase(),
        password: values.password,
        flow: isCreating ? "signUp" : "signIn",
        ...(isCreating ? { name: values.name.trim() } : {}),
      });
    } catch (error) {
      setServerError(handleAuthError(error).message);
    }
  });

  const toggleMode = () => {
    setServerError(null);
    setMode((current) => (current === "signIn" ? "signUp" : "signIn"));
  };

  return (
    <VStack spacing="md" className="w-full">
      {isCreating ? (
        <Controller
          control={control}
          name="name"
          render={({ field, fieldState }) => (
            <TextField
              label="Name"
              value={field.value}
              onChangeText={field.onChange}
              onBlur={field.onBlur}
              error={fieldState.error?.message}
              autoCapitalize="words"
              autoComplete="name"
              keyboardType="default"
              textContentType="name"
              returnKeyType="next"
            />
          )}
        />
      ) : null}
      <Controller
        control={control}
        name="email"
        render={({ field, fieldState }) => (
          <TextField
            label="Email"
            value={field.value}
            onChangeText={field.onChange}
            onBlur={field.onBlur}
            error={fieldState.error?.message}
            autoCapitalize="none"
            autoComplete="email"
            keyboardType="email-address"
            textContentType="emailAddress"
            returnKeyType="next"
          />
        )}
      />
      <Controller
        control={control}
        name="password"
        render={({ field, fieldState }) => (
          <TextField
            label="Password"
            value={field.value}
            onChangeText={field.onChange}
            onBlur={field.onBlur}
            error={fieldState.error?.message}
            secureTextEntry
            autoCapitalize="none"
            autoComplete={isCreating ? "new-password" : "current-password"}
            textContentType={isCreating ? "newPassword" : "password"}
            returnKeyType="go"
            onSubmitEditing={onSubmit}
          />
        )}
      />
      <Button
        text={isCreating ? "Create account" : "Sign in"}
        size="lg"
        fullWidth
        loading={formState.isSubmitting}
        onPress={onSubmit}
      />
      {serverError ? (
        <Text className="text-center font-app-medium text-[15px] text-danger">
          {serverError}
        </Text>
      ) : null}
      <Button
        text={isCreating ? "I already have an account" : "Create account"}
        variant="ghost"
        size="md"
        fullWidth
        onPress={toggleMode}
      />
    </VStack>
  );
};

export default SignInForm;
