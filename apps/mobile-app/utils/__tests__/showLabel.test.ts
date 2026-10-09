import { joinMeta, seasonsLabel } from "../showLabel";

describe("showLabel", () => {
  it("joins the parts that have text", () => {
    expect(joinMeta(["2 seasons", null, "Netflix", ""])).toBe(
      "2 seasons · Netflix"
    );
  });

  it("uses the singular when there is one season", () => {
    expect(seasonsLabel(1)).toBe("1 season");
    expect(seasonsLabel(2)).toBe("2 seasons");
  });
});
