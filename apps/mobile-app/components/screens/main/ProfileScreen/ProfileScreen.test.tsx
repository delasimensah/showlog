import { fireEvent, render, waitFor } from "@testing-library/react-native";
import * as Sharing from "expo-sharing";
import { Alert, Linking } from "react-native";

import {
  useAccount,
  useExportHistory,
  useProfileStats,
  useSession,
} from "@/hooks";

import ProfileScreen from "./ProfileScreen";

jest.mock("expo-file-system", () => ({
  File: jest.fn(() => ({
    exists: false,
    uri: "file:///cache/history.json",
    delete: jest.fn(),
    create: jest.fn(),
    write: jest.fn(),
  })),
  Paths: { cache: "cache" },
}));

jest.mock("expo-sharing", () => ({
  isAvailableAsync: jest.fn(() => Promise.resolve(true)),
  shareAsync: jest.fn(() => Promise.resolve()),
}));

jest.mock("@/hooks", () => ({
  useAccount: jest.fn(),
  useProfileStats: jest.fn(),
  useExportHistory: jest.fn(),
  useSession: jest.fn(),
}));

const mockedAccount = useAccount as jest.Mock;
const mockedStats = useProfileStats as jest.Mock;
const mockedExport = useExportHistory as jest.Mock;
const mockedSession = useSession as jest.Mock;

describe("ProfileScreen", () => {
  const signOut = jest.fn();
  const exportHistory = jest.fn();

  beforeEach(() => {
    signOut.mockReset();
    exportHistory.mockReset();
    exportHistory.mockResolvedValue('{"shows":[],"episodes":[]}');
    mockedAccount.mockReturnValue({
      name: "Ada",
      email: "me@example.com",
    });
    mockedStats.mockReturnValue({
      episodesWatched: 9629,
      minutesWatched: (8 * 30 * 24 + 24 + 12) * 60,
    });
    mockedExport.mockReturnValue(exportHistory);
    mockedSession.mockReturnValue({
      signOut,
      signIn: jest.fn(),
      isAuthenticated: true,
      isLoading: false,
    });
  });

  it("shows the account name and email", () => {
    const { getByText, queryByLabelText } = render(<ProfileScreen />);

    expect(queryByLabelText("Back")).toBeNull();
    expect(getByText("Ada")).toBeTruthy();
    expect(getByText("me@example.com")).toBeTruthy();
  });

  it("shows watch time and episodes watched", () => {
    const { getByLabelText, getByText } = render(<ProfileScreen />);

    expect(getByText("Watch time")).toBeTruthy();
    expect(getByText("Episodes watched")).toBeTruthy();
    expect(getByLabelText("8 months 1 day 12 hours")).toBeTruthy();
    expect(getByText("months")).toBeTruthy();
    expect(getByText("day")).toBeTruthy();
    expect(getByText("hours")).toBeTruthy();
    expect(getByText("9,629")).toBeTruthy();
  });

  it("keeps the labels while the numbers load", () => {
    mockedAccount.mockReturnValue(undefined);
    mockedStats.mockReturnValue(undefined);
    const { getByText, getAllByTestId } = render(<ProfileScreen />);

    expect(getByText("Watch time")).toBeTruthy();
    expect(getByText("Episodes watched")).toBeTruthy();
    expect(getByText("Name")).toBeTruthy();
    expect(getByText("Account")).toBeTruthy();
    expect(getByText("Export my history")).toBeTruthy();
    expect(getAllByTestId("skeleton-card").length).toBeGreaterThan(0);
  });

  it("opens the share sheet with the history file", async () => {
    const { getByLabelText } = render(<ProfileScreen />);

    fireEvent.press(getByLabelText("Export my history"));

    expect(exportHistory).toHaveBeenCalledWith({});
    await waitFor(() => {
      expect(Sharing.shareAsync).toHaveBeenCalled();
    });
  });

  it("opens the TVmaze credit", () => {
    const open = jest.spyOn(Linking, "openURL").mockResolvedValue(true);
    const { getByText, getByText: findVersion } = render(<ProfileScreen />);

    expect(findVersion("Version 1.0.0")).toBeTruthy();
    fireEvent.press(getByText("Show data from TVmaze"));
    expect(open).toHaveBeenCalledWith("https://www.tvmaze.com");
    open.mockRestore();
  });

  it("asks before signing out", () => {
    const alertSpy = jest.spyOn(Alert, "alert").mockImplementation();
    const { getByText } = render(<ProfileScreen />);

    fireEvent.press(getByText("Sign out"));

    expect(alertSpy).toHaveBeenCalled();
    const buttons = alertSpy.mock.calls[0]?.[2];
    const confirm = buttons?.find((button) => button.text === "Sign out");
    confirm?.onPress?.();
    expect(signOut).toHaveBeenCalledTimes(1);
    alertSpy.mockRestore();
  });
});
