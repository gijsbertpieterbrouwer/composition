import { DashboardTileType } from "@/TickApi";

const _dashboardFactor = 100;



export function getDashboardPixelSize(size: number, gap: number): number | null {
  const retract = (size - 1) * gap;

  return size
    ? (size * _dashboardFactor) + retract
    : null;
}

export function getDashboardPixelSizeAsString(input: number, gap: number): string | null {
  const pixelSize = getDashboardPixelSize(input, gap);

  return pixelSize ? (pixelSize + 'px') : null;
}


export function getMinimumTileSize(type: DashboardTileType): { w: number, h: number } {
  switch (type) {
    case DashboardTileType.Pie: return { w: 2, h: 2 };
    case DashboardTileType.Charting: return { w: 3, h: 1 };
    case DashboardTileType.Counter: return { w: 1, h: 1 };
    case DashboardTileType.Messageboard: { return { w: 3, h: 1 } }
    case DashboardTileType.Heatmap: { return { w: 4, h: 2 } }
    default: return { w: 0, h: 0 };
  }
}

