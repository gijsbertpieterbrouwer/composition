import { ColorsEnum } from "@/TickApi";

export function getColorOptionsForUI(): ColorsEnum[][] {
  const colorOptions: ColorsEnum[][] = [
    [ColorsEnum.SubtleGreen, ColorsEnum.SubtleYellow, ColorsEnum.SubtleOrange, ColorsEnum.SubtleRed, ColorsEnum.SubtlePurple],
    [ColorsEnum.Green, ColorsEnum.Yellow, ColorsEnum.Orange, ColorsEnum.Red, ColorsEnum.Purple],
    [ColorsEnum.BoldGreen, ColorsEnum.BoldYellow, ColorsEnum.BoldOrange, ColorsEnum.BoldRed, ColorsEnum.BoldPurple],

    [ColorsEnum.SubtleBlue, ColorsEnum.SubtleSky, ColorsEnum.SubtleLime, ColorsEnum.SubtlePink, ColorsEnum.SubtleBlack],
    [ColorsEnum.Blue, ColorsEnum.Sky, ColorsEnum.Lime, ColorsEnum.Pink, ColorsEnum.Black],
    [ColorsEnum.BoldBlue, ColorsEnum.BoldSky, ColorsEnum.BoldLime, ColorsEnum.BoldPink, ColorsEnum.BoldBlack],
  ]

  return colorOptions;
}

function colorNameFor(color: ColorsEnum): string {
  switch (color) {
    case ColorsEnum.Grey: {
      return "grey";
    }

    case ColorsEnum.SubtleGreen: {
      return "subtle-green";
    }
    case ColorsEnum.Green: {
      return "green";
    }
    case ColorsEnum.BoldGreen: {
      return "bold-green";
    }


    case ColorsEnum.SubtleYellow: {
      return "subtle-yellow";
    }
    case ColorsEnum.Yellow: {
      return "yellow";
    }
    case ColorsEnum.BoldYellow: {
      return "bold-yellow";
    }


    case ColorsEnum.SubtleOrange: {
      return "subtle-orange";
    }
    case ColorsEnum.Orange: {
      return "orange";
    }
    case ColorsEnum.BoldOrange: {
      return "bold-orange";
    }


    case ColorsEnum.SubtleRed: {
      return "subtle-red";
    }
    case ColorsEnum.Red: {
      return "red";
    }
    case ColorsEnum.BoldRed: {
      return "bold-red";
    }


    case ColorsEnum.SubtlePurple: {
      return "subtle-purple";
    }
    case ColorsEnum.Purple: {
      return "purple";
    }
    case ColorsEnum.BoldPurple: {
      return "bold-purple";
    }


    case ColorsEnum.SubtleBlue: {
      return "subtle-blue";
    }
    case ColorsEnum.Blue: {
      return "blue";
    }
    case ColorsEnum.BoldBlue: {
      return "bold-blue";
    }


    case ColorsEnum.SubtleSky: {
      return "subtle-sky";
    }
    case ColorsEnum.Sky: {
      return "sky";
    }
    case ColorsEnum.BoldSky: {
      return "bold-sky";
    }


    case ColorsEnum.SubtlePink: {
      return "subtle-pink";
    }
    case ColorsEnum.Pink: {
      return "pink";
    }
    case ColorsEnum.BoldPink: {
      return "bold-pink";
    }


    case ColorsEnum.SubtleBlack: {
      return "subtle-black";
    }
    case ColorsEnum.Black: {
      return "black";
    }
    case ColorsEnum.BoldBlack: {
      return "bold-black";
    }

    case ColorsEnum.SubtleLime: {
      return "subtle-lime";
    }
    case ColorsEnum.Lime: {
      return "lime";
    }
    case ColorsEnum.BoldLime: {
      return "bold-lime";
    }




    default: {
      return "unknown";
    }
  }
}

export function getColorName(color: ColorsEnum): string {
  return `color-${colorNameFor(color)}`;
}

export function getColorHex(color: ColorsEnum): string {
  switch (color) {
    case ColorsEnum.SubtleGreen: {
      return "var(--c-green-day)";
    }
    case ColorsEnum.Green: {
      return "var(--c-green-neon)";
    }
    case ColorsEnum.BoldGreen: {
      return "var(--c-green-night)";
    }

    case ColorsEnum.SubtleLime: {
      return "var(--c-lime-day)";
    }
    case ColorsEnum.Lime: {
      return "var(--c-lime-neon)";
    }
    case ColorsEnum.BoldLime: {
      return "var(--c-lime-night)";
    }

    case ColorsEnum.SubtleYellow: {
      return "var(--c-yellow-day)";
    }
    case ColorsEnum.Yellow: {
      return "var(--c-yellow-neon)";
    }
    case ColorsEnum.BoldYellow: {
      return "var(--c-yellow-night)";
    }

    case ColorsEnum.SubtleOrange: {
      return "var(--c-orange-day)";
    }
    case ColorsEnum.Orange: {
      return "var(--c-orange-neon)";
    }
    case ColorsEnum.BoldOrange: {
      return "var(--c-orange-night)";
    }

    case ColorsEnum.SubtleRed: {
      return "var(--c-red-day)";
    }
    case ColorsEnum.Red: {
      return "var(--c-red-neon)";

    }
    case ColorsEnum.BoldRed: {
      return "var(--c-red-night)";
    }


    case ColorsEnum.SubtlePurple: {
      return "var(--c-purple-day)";
    }
    case ColorsEnum.Purple: {
      return "var(--c-purple-neon)";
    }
    case ColorsEnum.BoldPurple: {
      return "var(--c-purple-night)";
    }


    case ColorsEnum.SubtleBlue: {
      return "var(--c-blue-day)";
    }
    case ColorsEnum.Blue: {
      return "var(--c-blue-neon)";
    }
    case ColorsEnum.BoldBlue: {
      return "var(--c-blue-night)";
    }


    case ColorsEnum.SubtleSky: {
      return "var(--c-sky-day)";
    }
    case ColorsEnum.Sky: {
      return "var(--c-sky-neon)";
    }
    case ColorsEnum.BoldSky: {
      return "var(--c-sky-night)";
    }


    case ColorsEnum.SubtlePink: {
      return "var(--c-pink-day)";
    }
    case ColorsEnum.Pink: {
      return "var(--c-pink-neon)";
    }
    case ColorsEnum.BoldPink: {
      return "var(--c-pink-night)";
    }

    case ColorsEnum.SubtleBlack: {
      return "var(--c-grey-day)";
    }
    case ColorsEnum.Black: {
      return "var(--c-grey-neon)";
    }
    case ColorsEnum.BoldBlack: {
      return "var(--c-grey-night)";
    }

    default: {
      return "#C9C8C1";
    }
  }
}


const RED = 0.2126;
const GREEN = 0.7152;
const BLUE = 0.0722;

const GAMMA = 2.4;

interface rgbColor {
  r: number,
  g: number,
  b: number
}

export function colorContrastRatio(hex1: string, hex2: string): number {
  const rgb1 = hex2Rgb(hex1);
  const rgb2 = hex2Rgb(hex2);
  if (!rgb1 || !rgb2) {
    return 10; // when using a nonrgb value => return max value
  }

  const contrastRatio = colorContrast(rgb1, rgb2);
  // note: minimal recommended contrast ratio is 4.5, or 3 for larger font-sizes
  return Math.round((contrastRatio + Number.EPSILON) * 100) / 100;
}

function hex2Rgb(hex: string): rgbColor | null {
  if (!hex) { hex = "#000000" }
  const shorthandRegex = /^#?([a-f\d])([a-f\d])([a-f\d])$/i;
  hex = hex.replace(shorthandRegex, function (m, r, g, b) {
    return r + r + g + g + b + b;
  });

  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result ? {
    r: parseInt(result[1], 16),
    g: parseInt(result[2], 16),
    b: parseInt(result[3], 16)
  } : null;
}

function colorLuminance(r: number, g: number, b: number) {
  const a = [r, g, b].map((v) => {
    v /= 255;
    return v <= 0.03928
      ? v / 12.92
      : Math.pow((v + 0.055) / 1.055, GAMMA);
  });
  return a[0] * RED + a[1] * GREEN + a[2] * BLUE;
}

function colorContrast(rgb1: rgbColor, rgb2: rgbColor) {
  const lum1 = colorLuminance(rgb1.r, rgb1.g, rgb1.b);
  const lum2 = colorLuminance(rgb2.r, rgb2.g, rgb2.b);
  const brightest = Math.max(lum1, lum2);
  const darkest = Math.min(lum1, lum2);
  return (brightest + 0.05) / (darkest + 0.05);
}


// // Array of all enum values for easy indexing (update if enum changes)
// const colorValues: ColorsEnum[] = Object.values(ColorsEnum);

// // Simple deterministic hash function for strings (consistent for same input)
// function hashString(str: string): number {
//   let hash = 0;
//   for (let i = 0; i < str.length; i++) {
//     const char = str.charCodeAt(i);
//     hash = ((hash << 5) - hash) + char;
//     hash = hash & hash; // Ensure 32-bit integer
//   }
//   return Math.abs(hash);
// }

// // Function to pick a color based on workspace name
// // Returns the numeric enum value; cast to WorkspaceColor if needed for type safety
// export function getItemColorForId(id: string): ColorsEnum {
//   if (!id || typeof id !== 'string') {
//     return ColorsEnum.Grey;
//   }

//   const hash = hashString(id.toLowerCase().trim()); // Normalize for consistency
//   const index = hash % colorValues.length;
//   return colorValues[index];
// }