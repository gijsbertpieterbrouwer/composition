import { LanguagePath, TicketStatus } from "@/TickApi";
import useTicketsStore from "@/store/tickets";
import useUserStore from "@/store/user";

export function renameTicket(ticketId: string) {
  //if (ticket.status == TicketStatus.Finished) { return; }

  askNewName((title) => {
    if (!title) { return; }
    useTicketsStore().edit({
      ticketId: ticketId,
      title: title,
    });
  }, "", translate(LanguagePath.App_TicketEditor_Rename_Prompt));


}


export function checkIsAssignedToMe(assignedTeamIds: string[], assignedUserIds: string[]) {
  const userId = useUserStore().userId;
  const teamIds = useUserStore().activeWorkspace?.memberOfTeamIds;

  return (assignedUserIds.some(p => p == userId) || assignedTeamIds.some(p => teamIds?.some(t => t == p)));
}

import { TicketFilterOptions } from "@/TickApi";
import { DropdownOption, DropdownOptionType } from "@/components/atoms/TickDropdown.vue";
import { openTaskInstanceCreatorPanel } from "@/components/panels/TaskInstanceCreatorPanel.vue";
import { translate } from "@/plugins/translatePlugin";
import { markCommunicatorAsSpammer } from "@/services/CommunicatorsService";
import { askNewName } from "./questionHelper";


export function getActiveFiltersNr(filters?: TicketFilterOptions) {
  let nrOfFilters = 0;
  if (filters?.assignedTo != null) {
    nrOfFilters++;
  }
  if (filters?.labelDefinitionIds?.length) {
    nrOfFilters++;
  }
  if (filters?.status != null) {
    nrOfFilters++;
  }
  if (filters?.filterCommunicationChannelIds != null) {
    nrOfFilters++;
  }
  if (filters?.filterCreationFromDate != null) {
    nrOfFilters++;
  }


  return nrOfFilters;
}

export function getMainTicketMenuOptions(ticketId: string, status: TicketStatus): DropdownOption[] {
  const options = [
    {
      // icon: "edit",
      id: "rename",
      text: translate(LanguagePath.App_Rename),
      onSelect: () => {
        renameTicket(ticketId);
      }
    },
    {
      id: 'addTask',
      text: translate(LanguagePath.App_TicketEditor_MainOption_AddTask),
      icon: '',
      onSelect: () => {
        openTaskInstanceCreatorPanel(ticketId);
      }
    },
    {
      id: 'spacer',
      type: DropdownOptionType.spacer,
      text: ''
    },
    {
      id: 'markAsSpam',
      text: translate(LanguagePath.App_TicketEditor_MainOption_MarkAsSpammerAndComplete),
      icon: '',
      onSelect: () => {
        const ticket = useTicketsStore().getTicket(ticketId);

        markCommunicatorAsSpammer({
          communicatorId: ticket.primaryCommunicatorId,
          isSpammer: true,
        }).then(() => {
          useTicketsStore().finish(ticketId);
        });
      }
    },

  ];

  if (status != TicketStatus.Finished) {
    options.push({
      // icon: "edit",
      id: "complete",
      text: translate(LanguagePath.App_TicketEditor_Complete),
      onSelect: () => {
        useTicketsStore().finish(ticketId);
      }
    });
  }

  return options;
}