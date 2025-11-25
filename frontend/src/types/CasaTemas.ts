// =========================================================================
// 1. Tipos e interfaces
// =========================================================================
import { Lightbulb, Shield, School, Forest } from "@mui/icons-material";
import type { OverridableComponent } from "@mui/material/OverridableComponent";
import type { SvgIconTypeMap } from "@mui/material";

export type CasaNome =
  | "Grifinória"
  | "Lufa-Lufa"
  | "Corvinal"
  | "Sonserina"
  | string;

export interface TemaCasa {
  primary: string; // Cor principal escura
  secondary: string; // Cor secundária metálica
  icon: OverridableComponent<SvgIconTypeMap<{}, "svg">>;
  emoji: string;
}

// =========================================================================
// 2. Temas das casas
// =========================================================================
export const CasaTemas: Record<CasaNome, TemaCasa> = {
  Grifinória: {
    primary: "#740001",
    secondary: "#D3A625",
    icon: Shield,
    emoji: "🦁",
  },
  "Lufa-Lufa": {
    primary: "#372E29",
    secondary: "#FFDB00",
    icon: Forest,
    emoji: "🦡",
  },
  Corvinal: {
    primary: "#0E1A40",
    secondary: "#C0C0C0",
    icon: Lightbulb,
    emoji: "🦅",
  },
  Sonserina: {
    primary: "#1A472A",
    secondary: "#AAAAAA",
    icon: School,
    emoji: "🐍",
  },
  Default: {
    primary: "#455A64",
    secondary: "#B0BEC5",
    icon: School,
    emoji: "🧙",
  },
};

// =========================================================================
// 3. Funções auxiliares
// =========================================================================
export function getTemaCasa(nomeCasa: string): TemaCasa {
  const tema = CasaTemas[nomeCasa as CasaNome];
  return tema || CasaTemas.Default;
}
