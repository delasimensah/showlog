# Forms guide

> **Purpose**: How to build forms in the phone app with React Hook Form and Zod.

## Stack

- **React Hook Form** (`react-hook-form`) holds the field values and errors.
- **Zod** describes what a valid form looks like. Every form has a Zod schema.
- **`@hookform/resolvers/zod`** connects the two.
- Inputs are React Native `TextInput` wrapped in a component from `components/ui/`, or an Expo UI control when it has one (pickers, toggles).

## Where the schema lives

- **Used by the phone app and by Convex:** `packages/shared/src/validation/`. Export from `validation/index.ts`. Import from `shared`.
- **Phone only:** `apps/mobile-app/utils/`, named after the form (for example `signInSchema.ts`). Export from `utils/index.ts`. Test in `utils/__tests__/`. Import from `@/utils`.

Convex functions validate their own arguments with `v` validators. A Zod schema on the phone does not replace them.

## Pattern

```tsx
import { zodResolver } from "@hookform/resolvers/zod";
import { Controller, useForm } from "react-hook-form";

import { signInSchema, type SignInValues } from "@/utils";

const SignInForm = () => {
  const { control, handleSubmit, formState } = useForm<SignInValues>({
    resolver: zodResolver(signInSchema),
    defaultValues: { email: "", password: "" },
  });

  const handleSignIn = handleSubmit(async (values) => {
    // call the Convex Auth sign-in with values
  });

  return (
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
          keyboardType="email-address"
        />
      )}
    />
  );
};
```

## Rules

- Show the Zod message under the field. Do not show a toast for a field error.
- Show a server error (for example a wrong password) once, above the submit button, in plain words. `shared` has `authErrors.ts` for sign-in messages.
- Disable the submit button while `formState.isSubmitting` is true.
- Set `autoCapitalize`, `keyboardType`, `textContentType`, and `returnKeyType` on every text field.

## Tests

Use `fireEvent.changeText` to fill fields and `fireEvent.press` to submit. Test the schema on its own in `utils/__tests__/`.

## References

- React Hook Form: https://react-hook-form.com/docs/useform
- Zod: https://zod.dev
- Hook Form resolvers: https://github.com/react-hook-form/resolvers
