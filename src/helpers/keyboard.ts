
interface ShortcutOptions {
  ignoreInputFieldEvents: boolean;

}

interface Shortcut {
  keys: string;
  callback: () => boolean | void;
  options: ShortcutOptions;
  identifier: number;
}

export function shortcutMatches(
  keycombo: string,
  event: KeyboardEvent
): boolean {
  const keys = keycombo.split("+");

  for (const key of keys) {
    switch (key.toLowerCase()) {
      case "space":
        if (event.key == "Space") {
          continue;
        } else {
          return false;
        }
      case "down":
        if (event.key == "ArrowDown") {
          continue;
        } else {
          return false;
        }
      case "up":
        if (event.key == "ArrowUp") {
          continue;
        } else {
          return false;
        }

      case "ctrl":
        if (event.ctrlKey) {
          continue;
        } else {
          return false;
        }

      case "alt":
        if (event.altKey) {
          continue;
        } else {
          return false;
        }
      case "shift":
        if (event.shiftKey) {
          continue;
        } else {
          return false;
        }
      case "esc":
        if (event.key === "Escape") {
          continue;
        } else {
          return false;
        }
      case "del":
        if (event.key === "Delete") {
          continue;
        } else {
          return false;
        }
      case "backspace":
        if (event.key === "Backspace") {
          continue;
        } else {
          return false;
        }
      case "tab":
        if (
          event.key === "Tab" &&
          keys.indexOf("shift") > -1 &&
          event.shiftKey
        ) {
          continue;
        }
        if (
          event.key === "Tab" &&
          keys.indexOf("shift") === -1 &&
          !event.shiftKey
        ) {
          continue;
        }
        return false;
      default:
        if (event.key === key) {
          continue;
        } else {
          return false;
        }
    }
  }

  return true;
}

class Keyboard {
  private shortcuts: Shortcut[] = [];
  private lastUsedIdentifier = 0;

  public on(
    keys: string,
    callback: () => boolean | void,
    options: ShortcutOptions = { ignoreInputFieldEvents: true }
  ): number {
    this.lastUsedIdentifier++;
    this.shortcuts.push({
      keys,
      callback,
      options,
      identifier: this.lastUsedIdentifier,
    });

    //debugAction(`[KEYBOARD:Bind] Bind keyboard for key ${keys} => ID: ${this.lastUsedIdentifier}`)
    return this.lastUsedIdentifier;
  }

  public off(identifier: number | number[]) {
    if (identifier == undefined) { return; }

    if (typeof (identifier) == 'number') {
      // debugAction(`[KEYBOARD:UnBind] UnBind keyboard  ID: ${identifier}`)
      this.shortcuts = this.shortcuts.filter((s) => s.identifier !== identifier);
    } else {
      // debugAction(`[KEYBOARD:UnBind] UnBind keyboard  IDs: ${identifier.toString()}`)
      this.shortcuts = this.shortcuts.filter((s) => !identifier.some(p => p == s.identifier));
    }
  }

  constructor() {
    window.addEventListener("keydown", (event: KeyboardEvent) => {
      const element = event.target as HTMLElement;

      const isInputFieldEvent =
        ["input", "textarea"].indexOf(element.tagName.toLowerCase()) > -1 ||
        element.isContentEditable;

      // only trigger for last matched binding
      for (let i = this.shortcuts.length - 1; i >= 0; i--) {
        const shortcut = this.shortcuts[i];
        if (isInputFieldEvent && shortcut.options.ignoreInputFieldEvents) {
          continue;
        }
        if (shortcutMatches(shortcut.keys, event)) {
          const continueEvent = shortcut.callback();
          if (!continueEvent) {
            event.preventDefault();
            event.stopPropagation();
            return false;
          }
        }
      }
      return undefined;
    });
  }
}

const keyboard = new Keyboard();
export default keyboard;
