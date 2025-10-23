import { StorageLocation } from "@/TickApi";
import { TickPanelOptions } from "@/components/atoms/TickPanel.vue";
import { openDatabagItemPanel } from "@/components/panels/DatabagItemsPanel.vue";
import { trimTrailingChars } from "./stringHelper";


export function onTokenizableInputContextMenu(el: HTMLInputElement | HTMLTextAreaElement, searchableLocations: StorageLocation[], defaultNewStorageLocation: StorageLocation, onChange: (newValue: string) => void, onClose: () => void) {
  onTokenizableEditorChange(false, true, el.getBoundingClientRect(), el.selectionStart, el.value, searchableLocations, defaultNewStorageLocation, onChange, onClose);
}

export function onTokenizableInputChange(el: HTMLInputElement | HTMLTextAreaElement, searchableLocations: StorageLocation[], defaultNewStorageLocation: StorageLocation, onChange: (newValue: string) => void, onClose: () => void) {
  onTokenizableEditorChange(false, false, el.getBoundingClientRect(), el.selectionStart, el.value, searchableLocations, defaultNewStorageLocation, onChange, onClose);
}

export function onTokenizableInputClick(el: HTMLInputElement | HTMLTextAreaElement, searchableLocations: StorageLocation[], defaultNewStorageLocation: StorageLocation, onChange: (newValue: string) => void, onClose: () => void) {
  onTokenizableEditorClick(false, false, el.getBoundingClientRect(), el.selectionStart, el.value, searchableLocations, defaultNewStorageLocation, onChange, onClose);
}

export function onTokenizableEditorClick(showAsModal: boolean, forcePopup: boolean, rect: DOMRect, cursorPos: number, currentValue: string, searchableLocations: StorageLocation[], defaultNewStorageLocation: StorageLocation, onChange: (newValue: string, token: string) => void, onClose: () => void) {
  const matches = currentValue.match(/{{[^{}]*}}/g)
  if (matches == null) { return; }
  for (let index = 0; index < matches.length; index++) {
    const match = matches[index];
    const matchIndex = currentValue.indexOf(match);

    const clickInBraces = cursorPos > matchIndex && cursorPos < matchIndex + match.length;
    const braceStartPos = matchIndex;
    const braceEndPos = matchIndex + match.length;

    if (forcePopup || clickInBraces) {
      const from = rect;
      from.x += 5 * cursorPos;

      const panelOptions: TickPanelOptions = {
        title: "DatabagItemsPanel",
        allowAsSubDialog: true,
        from: showAsModal ? null : from,
        showAsModal: showAsModal,
      }

      openDatabagItemPanel(panelOptions, true, "Select variable", searchableLocations, defaultNewStorageLocation, (token: string) => {
        let preToken = currentValue.substring(0, braceStartPos);
        preToken = trimTrailingChars(preToken, "{");

        const postToken = currentValue.substring(braceEndPos);
        onChange(`${preToken}{{${token}}}${postToken}`, token)
      }, onClose);
    }
  }



}

export function onTokenizableEditorChange(showAsModal: boolean, forcePopup: boolean, rect: DOMRect, cursorPos: number, currentValue: string, searchableLocations: StorageLocation[], defaultNewStorageLocation: StorageLocation, onChange: (newValue: string, token: string) => void, onClose: () => void) {
  const tokenStart = "{";
  const value = currentValue;
  const start = cursorPos;
  const lastChar = value.substring(start, start - 1);
  //console.log(start, lastChar);

  if (forcePopup || lastChar.endsWith(tokenStart)) {
    const from = rect;
    from.x += 5 * start;

    const panelOptions: TickPanelOptions = {
      title: "DatabagItemsPanel",
      allowAsSubDialog: true,
      from: showAsModal ? null : from,
      showAsModal: showAsModal,
    }

    openDatabagItemPanel(panelOptions, true, "Select variable", searchableLocations, defaultNewStorageLocation, (token: string) => {
      let preToken = value.substring(0, start - 1);
      preToken = trimTrailingChars(preToken, "{");

      const postToken = value.substring(start);
      //el.value = `${preToken}{{${token}}}${postToken}`;
      onChange(`${preToken}{{${token}}}${postToken}`, token)
    }, onClose);
  }
}


export function ensureTokenBraces(input: string): string {
  return input.includes(".") ? `{{${input}}}` : input;
}


