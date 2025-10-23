<template>

  <TickScreen title="Spending">
    <template v-slot:actions>
      <TickButton :disabled="!hasUsages" @click="downloadPeriodAsExcel" :size="Size.regular" :appearance="Appearance.secondary" :color="Color.contrast" icon="download">Download as excel
      </TickButton>
    </template>

    <template v-slot:default>
      <TickEditorPanel name="Expenses this month">
        <div class="charts">
          <TickChart class="chart" v-for="(chart, index) in this.charts" :key="index" :chart="chart" />
        </div>

        <div class="discount-message" v-if="hasDiscount">
          Including discount
        </div>
        <TickSwitch v-model="showVat">Show amounts with VAT</TickSwitch>
      </TickEditorPanel>

      <!-- <TickEditorPanel name="Credits" v-if="hasCredits">
        <template v-slot:explainer>
          Each month you receive credits.<br />

          <table class="styledTable odd-even">
            <thead>
              <tr>
                <th>Description</th>
                <th>Started with</th>
                <th>Remaining</th>
              </tr>
            </thead>
            <tbody>
              <template v-for="item in this.credits" :key="item.id">
                <tr class="">
                  <td class="">{{ this.getCreditDescription(item) }}</td>

                  <td class="numeric">{{ item.startCreditValue }}</td>
                  <td class="numeric">{{ item.remainingCreditValue }}</td>

                </tr>
              </template>

</tbody>
</table>


</template>

</TickEditorPanel> -->


      <TickEditorPanel name="Usages">
        <template v-slot:explainer>
          Usage is calculated on a daily basis and billed at the beginning of the next month.<br />
          <TickSwitch v-model="showDetailRows">Show details per day</TickSwitch>
        </template>



        <table class="styledTable odd-even " id="excelDownloadTable">
          <thead>
            <tr>
              <th v-if="!allowSubheaders">Date</th>
              <th v-else>Description</th>

              <th class="numeric" v-if="showDetailRows">Credits used</th>

              <th class="numeric">Cost</th>

              <th class="numeric" v-if="hasDiscount">Discount</th>
              <th class="numeric" v-if="hasDiscount">Cost after discount</th>

              <th class="numeric">VAT %</th>
              <th class="numeric">VAT</th>
              <th class="numeric">Total incl. VAT</th>
            </tr>
          </thead>
          <tbody>
            <template v-for="(item, index) in this.usages" :key="item.id">
              <tr v-if="allowSubheaders && this.differentdate(index)" class="date-row">
                <td class="date">{{ this.getdate(item.from) }}</td>
                <td></td>
                <td class="numeric">{{ this.getdateCalculatedCostWithoutDiscount(item.from) }}</td>

                <td class="numeric" v-if="hasDiscount"> </td>
                <td class="numeric" v-if="hasDiscount"> {{ this.getdateCalculatedDiscount(item.from) }} </td>

                <td class="numeric">{{ this.getdateCalculatedVATPercentage(item.from) }} </td>
                <td class="numeric">{{ this.getdateCalculatedVAT(item.from) }} </td>
                <td class="numeric">{{ this.getdateCalculatedCostIncludingVAT(item.from) }}</td>
              </tr>

              <tr class="detail-rows" v-if="showDetailRows">
                <td class="numeric" v-if="!allowSubheaders">{{ this.getdate(item.from) }}</td>
                <td class="indent" v-else>{{ item.description }}</td>

                <td class="numeric">{{ item.itemCreditUsageValue }}</td>
                <td class="numeric">{{ item.calculatedCostWithoutDiscount }}</td>

                <td class="numeric" v-if="hasDiscount"> {{ item.calculatedDiscount }} </td>
                <td class="numeric" v-if="hasDiscount"> {{ item.calculatedCostWithDiscount }} </td>

                <td class="numeric">{{ item.vatPercentage }}</td>
                <td class="numeric">{{ item.calculatedVAT }}</td>
                <td class="numeric">{{ item.calculatedCostIncludingVAT }}</td>
              </tr>
            </template>

          </tbody>
        </table>
      </TickEditorPanel>
    </template>
  </TickScreen>

</template>

<script lang="ts">
import { Component, Vue } from "vue-facing-decorator";


import TickButton, { Appearance, Color, Size } from '@/components/atoms/TickButton.vue';
import {
  BillingPeriodData,
  SubscriptionUsage,
  TickSubscriptionCredit,
} from "@/TickApi";

import TickCheckbox from "@/components/atoms/TickCheckbox.vue";
import TickDropdown from "@/components/atoms/TickDropdown.vue";
import TickListItem from "@/components/atoms/TickListItem.vue";
import TickEditorPanel from "@/components/molecules/editor/TickEditorPanel.vue";
import TickScreen from "@/components/molecules/editor/TickScreen.vue";
import TickIcon from "@/components/TickIcon.vue";
import { ensureIsDate, toDate } from "@/helpers/dateHelper";
import useSubscriptionStore from "@/store/subscription";

import TickFocusScreen from "@/components/atoms/TickFocusScreen.vue";
import TickSwitch from "@/components/atoms/TickSwitch.vue";
import TickChart from "@/components/molecules/charting/TickChart.vue";
import { allElementsEqual } from "@/helpers/arrayHelper";
import { getCostItemTypeName } from "@/helpers/enumsHelper";
import { tableToExcel } from "@/helpers/fileHelper";

@Component({
  directives: {},
  components: {
    TickFocusScreen,
    TickButton,
    TickScreen,
    TickListItem,
    TickEditorPanel,
    TickDropdown,
    TickIcon,
    TickCheckbox,
    TickChart,
    TickSwitch
  },
})
export default class TickCurrentSubscriptionPeriodUsage extends Vue {
  private showVat = true;
  Color = Color;
  Appearance = Appearance;
  Size = Size;

  private allowSubheaders = true;
  private showDetailRows = false;

  private differentdate(currentIndex: number): boolean {
    if (currentIndex == 0) { return true; } // first row

    const current = this.usages[currentIndex];
    const former = this.usages[currentIndex - 1];

    const d1 = toDate(current?.from);
    const d2 = toDate(former?.from);
    return (d1 != d2);
  }




  private downloadPeriodAsExcel() {
    this.allowSubheaders = false;


    this.$nextTick(() => {
      const download = tableToExcel()("excelDownloadTable", "spending");
      this.allowSubheaders = true;
      return download;
    });



  }

  private get hasUsages() {
    return this.usages.length > 0;
  }

  private get hasDiscount() {
    return this.usages.some((p) => p.calculatedDiscount > 0);
  }

  private getdate(input: string | Date) {
    return toDate(input);
  }
  private getDateCumulatedUsage(date: Date) {
    return this.usages.filter(p => ensureIsDate(p.from).getDate() == date.getDate());
  }

  private getdateTotalInclVat(input: string | Date) {
    const recordsForDate = this.getDateCumulatedUsage(ensureIsDate(input));
    const t = recordsForDate.map(item => item.calculatedCostIncludingVAT).reduce((prev, next) => prev + next);
    return t.toFixed(2);
  }
  private getdateCalculatedCostWithoutDiscount(input: string | Date) {
    const recordsForDate = this.getDateCumulatedUsage(ensureIsDate(input));
    const t = recordsForDate.map(item => item.calculatedCostWithoutDiscount).reduce((prev, next) => prev + next);
    return t.toFixed(2);
  }
  private getdateCalculatedDiscount(input: string | Date) {
    const recordsForDate = this.getDateCumulatedUsage(ensureIsDate(input));
    const t = recordsForDate.map(item => item.calculatedDiscount).reduce((prev, next) => prev + next);
    return t.toFixed(2);
  }
  private getdateCalculatedVAT(input: string | Date) {
    const recordsForDate = this.getDateCumulatedUsage(ensureIsDate(input));
    const t = recordsForDate.map(item => item.calculatedVAT).reduce((prev, next) => prev + next);
    return t.toFixed(2);
  }
  private getdateCalculatedCostIncludingVAT(input: string | Date) {
    const recordsForDate = this.getDateCumulatedUsage(ensureIsDate(input));
    const t = recordsForDate.map(item => item.calculatedCostIncludingVAT).reduce((prev, next) => prev + next);
    return t.toFixed(2);
  }
  private getdateCalculatedVATPercentage(input: string | Date) {
    const recordsForDate = this.getDateCumulatedUsage(ensureIsDate(input));
    const percentages = recordsForDate.map(item => item.vatPercentage);

    const equal = allElementsEqual(percentages);
    return equal ? percentages[0] : 'see details'
  }

  private get creditCharts() {
    return this.currentPeriodData.creditCharts || [];
  }

  private get charts() {

    const charts = this.creditCharts;

    if (this.showVat) {
      return charts.concat(this.currentPeriodData.chartsInclVat || []);
    } else {
      return charts.concat(this.currentPeriodData.charts || []);
    }
  }

  private get usages() {
    return this.currentPeriodData.subscriptionUsages || [];
  }
  private get credits() {
    return this.currentPeriodData.credits || [];
  }
  private get hasCredits() {
    return this.credits.length > 0;
  }


  private getCreditDescription(item: TickSubscriptionCredit): string {
    return getCostItemTypeName(item?.itemType);
  }

  private usageDay(item: SubscriptionUsage) {
    return toDate(item.from);
  }

  private get currentPeriodData(): BillingPeriodData {
    return useSubscriptionStore().currentPeriodUsage;
  }

  mounted() {
    useSubscriptionStore().useCurrentPeriodUsage();
  }
}
</script>

<style lang="scss" scoped>
@import "@/styles/theme";


.date-row {
  font-size: 1.1em;
}

.indent {
  padding-left: 20px;
}

.fade {
  opacity: 0.4;
}


.charts {
  display: flex;
  flex-wrap: wrap;
  justify-content: flex-start;
  gap: 20px;
  margin-bottom: 10px;

  .chart {
    padding: 20px;
    border-radius: 16px;
    color: var(--c-contrast);
    background-color: var(--c-base-100);
  }
}

.discount-message {
  font-style: italic;
}
</style>
