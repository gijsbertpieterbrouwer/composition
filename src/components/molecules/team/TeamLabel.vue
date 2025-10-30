<template>
  <TickLabel @remove="remove" :allowRemove="allowRemove" :color="color" disableCollapse="true" disableToggle="true" :name="name" />
</template>

<script lang="ts">
import { ColorsEnum, ObjectVersion } from "@/TickApi";
import TickLabel from "@/components/atoms/TickLabel.vue";
import useUtilityDataStore from "@/store/utilitydata";
import { Component, Prop, Vue } from "vue-facing-decorator";

@Component({
  emits: ["select"],
  components: {
    TickLabel,
  },
})
export default class TeamLabel extends Vue {
  @Prop() private teamId!: string;
  @Prop() private allowRemove!: boolean;
  //private team: TeamSummary;

  private get name(): string {
    return this.team.name;
  }

  private get color(): ColorsEnum {
    return this.team.color || ColorsEnum.Grey;
  }

  private remove() {
    this.$emit("remove", this.team);
  }

  private get team() {
    return useUtilityDataStore().team(this.teamId) || {
      id: "",
      name: "unknown",
      color: ColorsEnum.Grey,
    };
  }

  // beforeMount() {
  //   this.team = useUtilityDataStore().team(this.teamId) || {
  //     id: "",
  //     name: "unknown",
  //     color: ColorsEnum.Grey,
  //   };
  // }

  private select(item: ObjectVersion) {
    this.$emit("select", item.id);
  }
}
</script>

<style lang="scss" scoped>
@import "@/styles/theme";

// .team {
//   margin-right: 4px;

//   .version {
//     padding: 0 4px;
//     @include font-inter;
//     font-weight: 700;
//     font-size: 10px;
//     line-height: 16px;
//     white-space: nowrap;
//     border-radius: 2px;
//     transition: all 0.3s ease;
//     color: $white;
//     background-color: #5a5a5a;

//   }
// }</style>
