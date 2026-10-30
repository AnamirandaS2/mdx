import { contrast, eventPalette, readablePair, textOnLight } from "../../../mdx-front/src/components/public/event-colors.ts";

describe("cores do evento", () => {
  it("cai na paleta Mermãs quando o evento não escolhe cor", () => {
    expect(eventPalette({
      colorPrimary: null,
      colorSecondary: null,
      colorAccent: null,
    })).toEqual({
      primary: "#EC4899",
      secondary: "#4C1D95",
      accent: "#7C3AED",
    });
  });

  it("só usa uma cor de fundo com texto que passa o contraste", () => {
    const pale = readablePair("#FFFFFF");
    expect(contrast(pale.background, pale.color)).toBeGreaterThanOrEqual(4.5);
    const pink = readablePair("#EC4899");
    expect(contrast(pink.background, pink.color)).toBeGreaterThanOrEqual(4.5);
    expect(contrast("#FFFFFF", textOnLight("#EC4899"))).toBeGreaterThanOrEqual(4.5);
  });
});