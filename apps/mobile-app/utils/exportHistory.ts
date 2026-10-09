import { File, Paths } from "expo-file-system";
import * as Sharing from "expo-sharing";

/** Writes the history file and opens the iPhone share sheet. */
export async function saveHistoryFile(
  json: string,
  day: string
): Promise<void> {
  const file = new File(Paths.cache, `showlog-history-${day}.json`);
  if (file.exists) file.delete();
  file.create();
  file.write(json);
  if (!(await Sharing.isAvailableAsync())) {
    throw new Error("Sharing is not available");
  }
  await Sharing.shareAsync(file.uri, {
    mimeType: "application/json",
    UTI: "public.json",
  });
}
