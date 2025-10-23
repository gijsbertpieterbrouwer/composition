/* eslint-disable no-bitwise */
/* eslint-disable no-mixed-operators */

const usedGuids: { [key: string]: string } = {};
const maxTries = 10;

export const unlimited = -1;

function createGuid() {
  // version 4
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (c) => {
    const r = Math.random() * 16 | 0;
    const v = c === "x" ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
}

function getGuid(retryCount = 0): string {
  const guid = createGuid();

  if (!usedGuids[guid]) {
    usedGuids[guid] = guid;
    return guid;
  }

  if (retryCount >= maxTries) { return ""; }
  return getGuid(retryCount + 1);
}

export default function generateId(): string {
  return getGuid();
}

export function generateShortId(): string {
  return getGuid().substring(0, 5);
}



