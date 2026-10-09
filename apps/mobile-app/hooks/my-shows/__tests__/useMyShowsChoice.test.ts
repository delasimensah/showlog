import { renderHook, act } from "@testing-library/react-native";

import { useMyShowsChoice } from "../useMyShowsChoice";

describe("useMyShowsChoice", () => {
  afterEach(() => {
    useMyShowsChoice.setState({ sort: "lastWatched", filter: "All" });
  });

  it("remembers the sort and the filter", () => {
    const { result } = renderHook(() => useMyShowsChoice());

    act(() => {
      result.current.setSort("name");
      result.current.setFilter("Watching");
    });

    expect(useMyShowsChoice.getState().sort).toBe("name");
    expect(useMyShowsChoice.getState().filter).toBe("Watching");
  });
});
