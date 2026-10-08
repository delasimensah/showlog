# 🧪 Testing Strategy

This document outlines our testing approach and best practices.

## 📋 Testing Types

### **Unit Tests**

Test individual functions and utilities:

```typescript
import { render, screen } from "@testing-library/react";
import { Button } from "./Button";

describe("Button", () => {
  it("renders with title", () => {
    render(<Button title="Click me" onPress={() => {}} />);
    expect(screen.getByText("Click me")).toBeInTheDocument();
  });
});
```

### **Integration Tests**

Test component interactions:

```typescript
import { render, fireEvent } from "@testing-library/react";
import { LoginForm } from "./LoginForm";

describe("LoginForm", () => {
  it("submits form with valid data", async () => {
    const onSubmit = jest.fn();
    const { getByLabelText, getByRole } = render(
      <LoginForm onSubmit={onSubmit} />
    );

    fireEvent.change(getByLabelText("Email"), {
      target: { value: "test@example.com" },
    });
    fireEvent.click(getByRole("button", { name: "Submit" }));

    expect(onSubmit).toHaveBeenCalledWith({
      email: "test@example.com",
    });
  });
});
```

## Where tests live

Put each test next to the kind of code it covers, using the folder that kind already uses.

- A component test sits in the component folder, named `ComponentName.test.tsx`, next to `ComponentName.tsx`.
- A util test sits in `utils/__tests__/`, named after the util file.
- A hook or service test sits in `__tests__/` inside that category, for example `hooks/auth/__tests__/useStaffSession.test.ts`. Do not put a test file beside the hook or service file. Do not put two hooks in one source file.
- A backend test sits beside the functions it covers, for example `convex/buildings.test.ts` when this product uses Convex.

The file name is always the same base name as the source, with `.test.ts` or `.test.tsx`. This repo uses `.test.`, not `.spec.`.

## 🎯 Testing Guidelines

### **What to Test**

- ✅ Component rendering
- ✅ User interactions
- ✅ Business logic
- ✅ Error handling
- ✅ Edge cases

### **What NOT to Test**

- ❌ Implementation details
- ❌ Third-party library behavior
- ❌ Framework internals

## 📊 Coverage Goals

- **Minimum**: 70% code coverage
- **Target**: 80%+ code coverage
- **Critical paths**: 100% coverage

## 🚀 Running Tests

```bash
# Run all tests
yarn test

# Run with coverage
yarn test:coverage

# Run in watch mode
yarn test:watch
```

---

_Testing ensures code quality and prevents regressions._
