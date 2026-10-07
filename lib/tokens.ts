/**
 * Hex values from brain/DESIGN_SYSTEM.md.
 * Use in Satori/ImageResponse, where CSS variables from tokens.css do not work.
 * UI components keep using the CSS tokens.
 */
export const tokens = {
  paper: "#EEF2F6",
  ink: "#1B2559",
  pink: "#FF5A8A",
  sun: "#FFC93C",
  teal: "#2FA39A",
  card: "#FFFFFF",
  paper2: "#DDE4EE",
  inkSoft: "#5B6794",
  danger: "#E5484D",
  halftone: "#C9D3E3",
  rank: {
    E: "#9AA7B8",
    D: "#2FA39A",
    C: "#3B6CFF",
    B: "#FF5A8A",
    A: "#FF8A3D",
    S: "#FFC93C",
  },
  rankText: {
    E: "#1B2559",
    D: "#1B2559",
    C: "#FFFFFF",
    B: "#1B2559",
    A: "#1B2559",
    S: "#1B2559",
  },
} as const;

export const GENRE_CHIP_FILL = [tokens.sun, tokens.teal, tokens.pink] as const;
