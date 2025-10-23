<template>
  <template v-if="hasActiveItem">
    <UserEditor :activeId="selectedItemId" @deleted="userDeleted" @saved="userSaved" />
  </template>
  <template v-else>
    <TickScreen :title="$translate(LanguagePath.Users)">
      <template v-slot:actions>
        <!-- <TickDropdown v-if="createallowed" @select="toggleCreateUser" :options="userOptions" placeholder="Add" /> -->


        <TickAddCostItemDropdownButton @add="toggleCreateUser" :options="userOptions" :requiredAuth="AuthorizationObjectType.Workspace" :costItem="SubscriptionCostItemType.User" :currentNr="currentNr"
          :title="LanguagePath.App_Add" />

      </template>

      <template v-slot:default>
        <TickEditorPanel :name="$translate(LanguagePath.Users)">

          <div class="list">
            <TickListItem :noBGColor="true" :name="user.name" @select="selectItem(user)" v-for="user in this.users" :key="user.id">
              <template v-slot:icon>
                <UserIcon :userId="user.id" :disabled="true" />
              </template>

              <span class="handle">{{ user.handle }}</span>

              <span class="phone-indicator color-lime" v-if="user.voiceAvailable">
                <TickIcon name="phone" :title="$translate(LanguagePath.Voice_Enabled)" />
              </span>
              <template #actions>

                <div> <span class="admin-indicator" :class="adminClass" v-if="user.isAdmin">{{ $translate(LanguagePath.Admin) }} </span></div>

                <TickButton v-if="user.loggedIn" @click="logoutUser(user)" :size="Size.mini" :appearance="Appearance.secondary" :color="Color.contrast">{{ $translate(LanguagePath.App_UserPanel_Logout)
                }}</TickButton>
              </template>

            </TickListItem>
          </div>

        </TickEditorPanel>

        <TickEditorPanel :name="$translate(LanguagePath.Bots)">
          <div class="list">
            <TickListItem :noBGColor="true" :name="user.name" @select="selectItem(user)" v-for="user in this.bots" :key="user.id">
              <template v-slot:icon>
                <UserIcon :userId="user.id" :disabled="true" />
              </template>
            </TickListItem>
          </div>


        </TickEditorPanel>

      </template>

    </TickScreen>

  </template>
</template>

<script lang="ts">
import { AuthorizationObjectType, ColorsEnum, LanguagePath, MetaDataItem, SubscriptionCostItemType, UserSummary, UserTypeEnum } from '@/TickApi';
import TickIcon from '@/components/TickIcon.vue';
import TickButton, { Appearance, Color, Size } from '@/components/atoms/TickButton.vue';
import TickInput from '@/components/atoms/TickInput.vue';
import TickEditorPanel from '@/components/molecules/editor/TickEditorPanel.vue';
import TickScreen from '@/components/molecules/editor/TickScreen.vue';
import UserCreator from '@/components/molecules/user/UserCreator.vue';
import UserEditor from '@/components/molecules/user/UserEditor.vue';
import { TickRouteParams } from '@/router';
import useManagingStore from '@/store/managingStore';
import useUserStore from '@/store/user';
import { Component, Vue, Watch } from 'vue-facing-decorator';

import TickAddCostItemDropdownButton from '@/components/atoms/TickAddCostItemDropdownButton.vue';
import TickDropdown, { DropdownOption } from '@/components/atoms/TickDropdown.vue';
import TickListItem from '@/components/atoms/TickListItem.vue';
import UserIcon from '@/components/atoms/UserIcon.vue';
import UserCreatePanel from '@/components/panels/UserCreatePanel.vue';
import { getColorName } from '@/helpers/colorsHelper';
import { getUserTypeOptions } from '@/helpers/enumsHelper';
import { mount, unmount } from '@/helpers/mountHelper';
import { adminLogoutUser } from '@/services/TeamsService';

@Component({
  components: { TickScreen, UserEditor, TickButton, TickEditorPanel, TickInput, UserCreator, TickListItem, UserIcon, TickDropdown, TickAddCostItemDropdownButton, TickIcon }
})
export default class TickUsers extends Vue {
  UserTypeEnum = UserTypeEnum;
  LanguagePath = LanguagePath
  AuthorizationObjectType = AuthorizationObjectType;
  SubscriptionCostItemType = SubscriptionCostItemType;
  Size = Size
  Appearance = Appearance
  Color = Color
  private selectedItemId = "";
  private activePanel = "";

  private logoutUser(user: UserSummary) {
    adminLogoutUser(user.id);
  }

  private get currentNr() {
    return this.users.length;
  }

  private get hasActiveItem() {
    return this.selectedItemId != null && this.selectedItemId != "";
  }

  private get adminClass() {
    return getColorName(ColorsEnum.BoldBlack);
  }

  private get userOptions(): DropdownOption[] {
    const options = getUserTypeOptions() as DropdownOption[];
    options.push({
      id: 'bulk',
      text: 'Bulk create users'
    });
    return options;
  }

  private get addAllowedInPlan() {
    const currentNr = this.users.length;
    return useUserStore().allowedAddInPlan(SubscriptionCostItemType.User, currentNr)
  }

  private get createallowed() {
    return useUserStore().allowedEdit(AuthorizationObjectType.Workspace) && this.addAllowedInPlan;
  }

  private get allUsers() {
    return useManagingStore().userSummaries.sort((a, b) => a.name.localeCompare(b.name));
  }

  private get users() {
    return this.allUsers.filter(p => p.userType == UserTypeEnum.User)
  }

  private get bots() {
    return this.allUsers.filter(p => p.userType == UserTypeEnum.Bot);
  }


  private userDeleted() {
    this.$router.push({ name: 'Users' });
  }

  private userSaved() {
    // this.$router.push({ name: 'Users' });
  }


  private selectItem(item: UserSummary) {
    this.selectId(item.id);
  }

  private selectId(id: string) {
    this.$router.push({ params: { ...this.$route.params, id: id } });
  }


  mounted() {
    useManagingStore().useUsers();

    if (this.$route.params.id) {
      this.selectedItemId = this.$route.params.id.toString();
    }
  }

  @Watch("$route.params")
  private paramsChanged(to: TickRouteParams) {
    this.selectedItemId = to.id || null;
  }


  private toggleCreateUser(type: UserTypeEnum | string) {

    if (this.activePanel) {
      this.closePanel();
    } else {
      this.mountUserCreatePanel(type);
    }
  }

  private mountUserCreatePanel(type: UserTypeEnum | string) {
    if (this.activePanel) {
      return;
    }
    const isBulk = type == 'bulk';
    const userType = isBulk ? UserTypeEnum.User : type;

    this.activePanel = mount(UserCreatePanel, {
      props: {
        userType: userType,
        bulk: isBulk,
      },
      events: {
        close: () => {
          this.closePanel();
        },
        created: (data: MetaDataItem) => {

          if (data) {
            this.selectId(data.id);
          }
          this.closePanel();
        },

      },
    });
  }

  private closePanel() {
    if (!this.activePanel) { return; }

    unmount(this.activePanel);
    this.activePanel = "";
  }

}
</script>


<style lang="scss" scoped>
@import "@/styles/theme";

.list {
  background-color: var(--c-base-100);
  border-radius: 8px;
  margin-bottom: 10px;
  overflow: hidden;
}

.handle {
  font-size: 0.8em;
}

.admin-indicator {
  display: inline-block;
  padding: 2px;
  background-color: $grey400;
  padding: 0 4px;
  font-family: 'Inter', sans-serif;
  font-weight: 700;
  font-size: 10px;
  line-height: 16px;
  white-space: nowrap;
  border-radius: 2px;
  color: #fff;
  margin-right: 5px;
  margin-left: 5px;
  text-transform: uppercase;
  @include neon-bg;
}

.phone-indicator {
  @include neon-bg;
  display: inline-block;
  padding: 0px 15px;
  border-radius: 99px;

  svg {
    height: 10px;
    width: 10px;
  }
}
</style>
