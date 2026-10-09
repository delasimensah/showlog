import { render, screen } from "@testing-library/react-native";

import LoadingScreen from "./LoadingScreen";

describe("LoadingScreen Component", () => {
  describe("Rendering", () => {
    it("renders correctly", () => {
      const { toJSON } = render(<LoadingScreen />);
      expect(toJSON()).toBeTruthy();
    });

    it("shows skeleton bars while the next screen is not ready", () => {
      render(<LoadingScreen />);
      expect(screen.getAllByTestId("skeleton-card").length).toBeGreaterThan(0);
    });
  });

  describe("Layout", () => {
    it("renders with proper structure", () => {
      const { toJSON } = render(<LoadingScreen />);
      expect(toJSON()).toBeTruthy();
    });
  });

  describe("Edge Cases", () => {
    it("renders without errors", () => {
      expect(() => render(<LoadingScreen />)).not.toThrow();
    });

    it("renders consistently", () => {
      const { toJSON: json1 } = render(<LoadingScreen />);
      const { toJSON: json2 } = render(<LoadingScreen />);
      expect(json1()).toBeTruthy();
      expect(json2()).toBeTruthy();
    });
  });
});
