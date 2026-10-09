import { File } from "expo-file-system";
import * as Sharing from "expo-sharing";

import { saveHistoryFile } from "../exportHistory";

jest.mock("expo-file-system", () => ({
  File: jest.fn(),
  Paths: { cache: "cache" },
}));

jest.mock("expo-sharing", () => ({
  isAvailableAsync: jest.fn(),
  shareAsync: jest.fn(),
}));

const MockFile = File as unknown as jest.Mock;

describe("saveHistoryFile", () => {
  const file = {
    exists: false,
    uri: "file:///cache/showlog-history-2026-10-09.json",
    delete: jest.fn(),
    create: jest.fn(),
    write: jest.fn(),
  };

  beforeEach(() => {
    file.exists = false;
    file.delete.mockReset();
    file.create.mockReset();
    file.write.mockReset();
    MockFile.mockReset();
    MockFile.mockImplementation(() => file);
    (Sharing.isAvailableAsync as jest.Mock).mockResolvedValue(true);
    (Sharing.shareAsync as jest.Mock).mockResolvedValue(undefined);
  });

  it("writes one JSON file and opens the share sheet", async () => {
    await saveHistoryFile('{"shows":[]}', "2026-10-09");

    expect(MockFile).toHaveBeenCalledWith(
      "cache",
      "showlog-history-2026-10-09.json"
    );
    expect(file.write).toHaveBeenCalledWith('{"shows":[]}');
    expect(Sharing.shareAsync).toHaveBeenCalledWith(file.uri, {
      mimeType: "application/json",
      UTI: "public.json",
    });
  });
});
