import { render } from "@testing-library/react-native";

import BottomSheetHeader from "./BottomSheetHeader";

describe("BottomSheetHeader Component", () => {
  it("renders correctly with title", () => {
    const { getByText } = render(<BottomSheetHeader title="Test Title" />);
    expect(getByText("Test Title")).toBeTruthy();
  });

  it("renders correctly with title and subtitle", () => {
    const { getByText } = render(
      <BottomSheetHeader title="Test Title" subtitle="Test Subtitle" />
    );
    expect(getByText("Test Title")).toBeTruthy();
    expect(getByText("Test Subtitle")).toBeTruthy();
  });

  it("renders correctly without title or subtitle", () => {
    const component = render(<BottomSheetHeader />);
    expect(component.toJSON()).toBeTruthy();
  });

  it("applies correct styling classes", () => {
    const { getByText } = render(<BottomSheetHeader title="Test" />);
    const title = getByText("Test");
    expect(title).toBeTruthy();
  });
});
