<template>
  <TickSettingsPanel :panel-options="panelOptions" class="users-and-teams-panel" @close="close(false)">
    <template #title>
      {{ titleText }}
    </template>

    <div class="content">
      <TickInput v-if="showSearch" v-model="filterText" v-focus class="filter-input" :placeholder="$translate(LanguagePath.App_Search)" />

      <div v-if="reducedFilteredUsers.length" class="title">
        {{ $translate(LanguagePath.Users) }}
      </div>
      <TickAssigneeDisplay v-for="(user, index) in reducedFilteredUsers" :id="user.id" :key="user.id" class="assignable" :class="{ highlighted: isHighlighted(index, AssigneeTypeEnum.User) }"
        :selected="userIsSelected(user.id)" :name="user.name" :handle="user.handle" :type="AssigneeTypeEnum.User" @toggle="toggleUserAssignment" />

      <PanelReduceSwitch :reduce="reduceUserResults" :nr-hidden="nrOfHiddenUsers" :total-count="filteredUsers.length" :max-nr-of-items="maxNrOfItems" @toggle="toggleReduceUsers" />

      <div v-if="reducedFilteredTeams.length" class="title">
        {{ $translate(LanguagePath.Teams) }}
      </div>
      <TickAssigneeDisplay v-for="(team, index) in reducedFilteredTeams" :id="team.id" :key="team.id" class="assignable" :class="{ highlighted: isHighlighted(index, AssigneeTypeEnum.Team) }"
        :selected="teamIsSelected(team.id)" :name="team.name" :handle="team.handle" :type="AssigneeTypeEnum.Team" @toggle="toggleTeamAssignment" />
      <PanelReduceSwitch :reduce="reduceTeamResults" :nr-hidden="nrOfHiddenTeams" :total-count="filteredTeams.length" :max-nr-of-items="maxNrOfItems" @toggle="toggleReduceTeams" />
    </div>
  </TickSettingsPanel>
</template>

<script lang="ts">
import { AssigneeTypeEnum, LanguagePath, SubscriptionCostItemType, UserTypeEnum } from "@/TickApi";
import TickInput from "@/components/atoms/TickInput.vue";
import TickAssigneeDisplay from "@/components/molecules/TickAssigneeDisplay.vue";
import TickSettingsPanel from "@/components/panels/TickSettingsPanel.vue";
import { focus } from "@/directives";
import { smartFilter } from "@/helpers/arrayHelper";
import keyboard from "@/helpers/keyboard";
import useManagingStore from "@/store/managingStore";
import useUserStore from "@/store/user";
import useUtilityDataStore from "@/store/utilitydata";
import { computed, defineComponent, onBeforeUnmount, onMounted, ref, watch } from 'vue';
import { TickPanelOptions } from '../atoms/TickPanel.vue';
import PanelReduceSwitch from "./PanelReduceSwitch.vue";

export interface UsersAndTeamsSelection {
  userIds: string[];
  teamIds: string[];
}

export default defineComponent({
  name: 'UsersAndTeamsPanel',
  directives: { focus },
  components: { TickSettingsPanel, TickAssigneeDisplay, TickInput, PanelReduceSwitch },
  props: {
    title: String,
    typeFilters: { type: Array as () => AssigneeTypeEnum[], default: () => [] },
    panelOptions: { type: Object as () => TickPanelOptions, required: true },
    modelValue: { type: Object as () => UsersAndTeamsSelection, required: true },
    limitToOne: { type: Boolean, default: false },
    filterOnlyVoiceAvailable: { type: Boolean, default: false }
  },
  emits: ["update:modelValue", "close"],
  setup(props, { emit }) {
    const filterText = ref('');
    const maxNrOfItems = ref(5);
    const reduceUserResults = ref(true);
    const reduceTeamResults = ref(true);
    const highlightedIndex = ref(-1);
    const highlightedType = ref(AssigneeTypeEnum.User);

    const model = ref<UsersAndTeamsSelection>({
      userIds: [...props.modelValue.userIds],
      teamIds: [...props.modelValue.teamIds]
    });

    // Watch for prop changes
    watch(() => props.modelValue, (newVal) => {
      model.value.userIds = [...newVal.userIds];
      model.value.teamIds = [...newVal.teamIds];
    });

    const userIsSelected = (id: string) => model.value.userIds.includes(id);
    const teamIsSelected = (id: string) => model.value.teamIds.includes(id);

    const allowType = (type: AssigneeTypeEnum) => !props.typeFilters?.length || props.typeFilters.includes(type);

    const availableInPlan = (costItem?: SubscriptionCostItemType) => useUserStore().allowedView(null, costItem);

    const allUsers = computed(() => {
      if (!availableInPlan(SubscriptionCostItemType.User)) return [];
      return useUtilityDataStore().utilityData?.users?.filter(p =>
        (props.filterOnlyVoiceAvailable ? p.voiceAvailable : true)
        && (p.deleted === false || userIsSelected(p.id))
        && p.userType === UserTypeEnum.User
      ) || [];
    });

    const filteredUsers = computed(() =>
      allowType(AssigneeTypeEnum.User)
        ? smartFilter(filterText.value, allUsers.value, { filterProps: ['name', 'handle'] })
        : []
    );

    const reducedFilteredUsers = computed(() => reduceUserResults.value ? filteredUsers.value.slice(0, maxNrOfItems.value) : filteredUsers.value);

    const nrOfHiddenUsers = computed(() => filteredUsers.value.length - reducedFilteredUsers.value.length);

    const allTeams = computed(() =>
      availableInPlan(SubscriptionCostItemType.Teams)
        ? useManagingStore().teamSummaries.filter(p =>
          (props.filterOnlyVoiceAvailable ? p.voiceAvailable : true) && !p.deleted
        )
        : []
    );

    const filteredTeams = computed(() =>
      allowType(AssigneeTypeEnum.Team)
        ? smartFilter(filterText.value, allTeams.value, { filterProps: ['name', 'handle'] })
        : []
    );

    const reducedFilteredTeams = computed(() => reduceTeamResults.value ? filteredTeams.value.slice(0, maxNrOfItems.value) : filteredTeams.value);

    const nrOfHiddenTeams = computed(() => filteredTeams.value.length - reducedFilteredTeams.value.length);

    const showSearch = computed(() => allTeams.value.length > 1 || allUsers.value.length > 1);

    const titleText = computed(() => {
      if (props.title) return props.title;
      const items: string[] = [];
      if (availableInPlan(SubscriptionCostItemType.User)) items.push("Users");
      if (availableInPlan(SubscriptionCostItemType.Teams)) items.push("Teams");
      return items.join(" & ");
    });

    const setAssignments = (userIds: string[], teamIds: string[]) => {
      model.value.userIds = [...userIds];
      model.value.teamIds = [...teamIds];
      emit("update:modelValue", { userIds, teamIds });
    };

    const toggleUserAssignment = (id: string) => {
      if (props.limitToOne) {
        setAssignments(userIsSelected(id) ? [] : [id], []);
        emit('close', false);
      } else {
        const newUsers = userIsSelected(id)
          ? model.value.userIds.filter(u => u !== id)
          : [...model.value.userIds, id];
        setAssignments(newUsers, model.value.teamIds);
      }
    };

    const toggleTeamAssignment = (id: string) => {
      if (props.limitToOne) {
        setAssignments([], teamIsSelected(id) ? [] : [id]);
        emit('close', false);
      } else {
        const newTeams = teamIsSelected(id)
          ? model.value.teamIds.filter(t => t !== id)
          : [...model.value.teamIds, id];
        setAssignments(model.value.userIds, newTeams);
      }
    };

    const isHighlighted = (index: number, type: AssigneeTypeEnum) =>
      highlightedType.value === type && highlightedIndex.value === index;

    const setHighLightIndex = (newIndex: number) => {
      highlightedIndex.value = newIndex;
      // Simplified boundary logic
      const totalUsers = reducedFilteredUsers.value.length - 1;
      const totalTeams = reducedFilteredTeams.value.length - 1;

      if (highlightedType.value === AssigneeTypeEnum.User) {
        if (highlightedIndex.value < 0) {
          if (allowType(AssigneeTypeEnum.Team)) { highlightedType.value = AssigneeTypeEnum.Team; highlightedIndex.value = totalTeams; }
          else highlightedIndex.value = totalUsers;
        }
        if (highlightedIndex.value > totalUsers) {
          if (allowType(AssigneeTypeEnum.Team)) { highlightedType.value = AssigneeTypeEnum.Team; highlightedIndex.value = 0; }
          else highlightedIndex.value = 0;
        }
      } else if (highlightedType.value === AssigneeTypeEnum.Team) {
        if (highlightedIndex.value < 0) {
          if (allowType(AssigneeTypeEnum.User)) { highlightedType.value = AssigneeTypeEnum.User; highlightedIndex.value = totalUsers; }
          else highlightedIndex.value = totalTeams;
        }
        if (highlightedIndex.value > totalTeams) {
          if (allowType(AssigneeTypeEnum.User)) { highlightedType.value = AssigneeTypeEnum.User; highlightedIndex.value = 0; }
          else highlightedIndex.value = 0;
        }
      }
    };

    const toggleReduceUsers = () => { reduceUserResults.value = !reduceUserResults.value; };
    const toggleReduceTeams = () => { reduceTeamResults.value = !reduceTeamResults.value; };
    const close = (byKeyboard: boolean) => emit('close', byKeyboard);

    // Keyboard navigation
    let keyboardId = 0;
    onMounted(() => {
      useManagingStore().useTeams();

      keyboardId = keyboard.on("Down", () => setHighLightIndex(highlightedIndex.value + 1), { ignoreInputFieldEvents: false });
      keyboardId = keyboard.on("Up", () => setHighLightIndex(highlightedIndex.value - 1), { ignoreInputFieldEvents: false });
      keyboardId = keyboard.on("Enter", () => {
        const index = highlightedIndex.value === -1 ? 0 : highlightedIndex.value;
        if (highlightedType.value === AssigneeTypeEnum.User) toggleUserAssignment(reducedFilteredUsers.value[index].id);
        else toggleTeamAssignment(reducedFilteredTeams.value[index].id);
      }, { ignoreInputFieldEvents: false });
    });

    onBeforeUnmount(() => {
      keyboard.off(keyboardId);
    });

    return {
      filterText,
      maxNrOfItems,
      reduceUserResults,
      reduceTeamResults,
      highlightedIndex,
      highlightedType,
      model,
      userIsSelected,
      teamIsSelected,
      showSearch,
      filteredUsers,
      reducedFilteredUsers,
      filteredTeams,
      reducedFilteredTeams,
      nrOfHiddenUsers,
      nrOfHiddenTeams,
      toggleUserAssignment,
      toggleTeamAssignment,
      isHighlighted,
      setHighLightIndex,
      toggleReduceUsers,
      toggleReduceTeams,
      close,
      titleText,
      AssigneeTypeEnum,
      LanguagePath
    };
  }
});
</script>

<style lang="scss" scoped>
@import "@/styles/theme";

.assignable {
  width: 100%;

  &.highlighted {
    color: var(--c-contrast);
    background-color: var(--c-base-200);
  }
}

.moreitems-message {
  line-height: 20px;
  opacity: 0.6;
  font-weight: 500;
  font-size: $text-size-regular;
  font-style: italic;
}

.title {
  line-height: 20px;
  opacity: 0.6;
  font-weight: 500;
  font-size: $text-size-regular;
  letter-spacing: 0.04em;
  text-transform: uppercase;
}

.content {
  display: flex;
  flex-direction: column;
  gap: 8px;
}
</style>
