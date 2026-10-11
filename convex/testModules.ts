type ModuleLoader = () => Promise<unknown>;

// Vite shortens a source file next to this test to ../name.ts. Convex looks
// that file up from the convex root, as ../../folder/name.
export function modulesFromConvexRoot(
  raw: Record<string, ModuleLoader>,
  folder: string
) {
  return Object.fromEntries(
    Object.entries(raw).map(([key, loader]) => {
      if (key.startsWith("../") && !key.startsWith("../../")) {
        return [`../../${folder}/${key.slice(3)}`, loader];
      }
      return [key, loader];
    })
  );
}
