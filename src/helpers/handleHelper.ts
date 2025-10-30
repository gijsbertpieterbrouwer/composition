import { TickPanelOptions } from "@/components/atoms/TickPanel.vue";
import { UsersAndTeamsSelection } from "@/components/panels/UsersAndTeamsPanel.vue";
import useUtilityDataStore from "@/store/utilitydata";
import { openUsersAndTeamsItemPanel } from "./panelsHelper";
import { trimTrailingChars } from "./stringHelper";

export function onHandleInputChange(el: HTMLInputElement | HTMLTextAreaElement, onChange: (newValue: string) => void, onClose: () => void) {
  onHandleEditorChange(false, false, el.getBoundingClientRect(), el.selectionStart ?? 0, el.value, onChange, onClose);
}

export function onHandleEditorChange(showAsModal: boolean, forcePopup: boolean, rect: DOMRect, cursorPos: number, currentValue: string, onChange: (newValue: string, token: string) => void, onClose: () => void) {
  const tokenStart = "@";
  const value = currentValue;
  const start = cursorPos;
  const lastChar = value.substring(start, start - 1);

  if (forcePopup || lastChar.endsWith(tokenStart)) {
    const from = rect;
    from.x += 5 * start;

    const panelOptions: TickPanelOptions = {
      title: "Select user or team",
      allowAsSubDialog: true,
      from: showAsModal ? undefined : from,
      showAsModal: showAsModal,

    }

    openUsersAndTeamsItemPanel(panelOptions, "Select user or team", null, false, (to: UsersAndTeamsSelection) => {

      let handle = "";
      if (to?.userIds?.length > 0) {
        const user = useUtilityDataStore().user(to.userIds[0])
        if (user) {
          handle = user.handle;
        }
      }

      if (to?.teamIds?.length > 0) {
        const team = useUtilityDataStore().team(to.teamIds[0])
        if (team) {
          handle = team.handle ?? "";
        }
      }


      let preToken = value.substring(0, start - 1);
      preToken = trimTrailingChars(preToken, tokenStart);

      const postToken = value.substring(start);
      //el.value = `${preToken}{{${token}}}${postToken}`;
      onChange(`${preToken}${handle} ${postToken}`, handle)

      //onChange(`${preToken}{{${token}}}${postToken}`, token)
    }, onClose);
  }
}


