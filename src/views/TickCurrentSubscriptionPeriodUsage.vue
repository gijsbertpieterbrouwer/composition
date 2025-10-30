<template>
  <TickScreen title="Spending">
    <template v-slot:actions>
      <TickButton :disabled="!hasUsages" @click="downloadPeriodAsExcel" :size="TickButtonSize.regular" :appearance="TickButtonAppearance.secondary" :color="TickButtonColor.contrast" icon="download">
        Download as excel
      </TickButton>
    </template>

    <template v-slot:default>
      <TickEditorPanel name="Expenses this month">
        <div class="charts">
          <TickChart class="chart" v-for="(chart, index) in charts" :key="index" :chart="chart" />
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
              <template v-for="item in credits" :key="item.id">
                <tr class="">
                  <td class="">{{ getCreditDescription(item) }}</td>

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
            <template v-for="(item, index) in usages" :key="item.id">
              <tr v-if="allowSubheaders && differentdate(index)" class="date-row">
                <td class="date">{{ getdate(item.from) }}</td>
                <td></td>
                <td class="numeric">{{ getdateCalculatedCostWithoutDiscount(item.from) }}</td>

                <td class="numeric" v-if="hasDiscount"> </td>
                <td class="numeric" v-if="hasDiscount"> {{ getdateCalculatedDiscount(item.from) }} </td>

                <td class="numeric">{{ getdateCalculatedVATPercentage(item.from) }} </td>
                <td class="numeric">{{ getdateCalculatedVAT(item.from) }} </td>
                <td class="numeric">{{ getdateCalculatedCostIncludingVAT(item.from) }}</td>
              </tr>

              <tr class="detail-rows" v-if="showDetailRows">
                <td class="numeric" v-if="!allowSubheaders">{{ getdate(item.from) }}</td>
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

<script setup lang="ts">
import TickButton from '@/components/atoms/TickButton.vue';
import {
  SubscriptionUsage
} from "@/TickApi";
import { computed, nextTick, onMounted, ref } from 'vue';

import TickEditorPanel from "@/components/molecules/editor/TickEditorPanel.vue";
import TickScreen from "@/components/molecules/editor/TickScreen.vue";
import { ensureIsDate, toDate } from "@/helpers/dateHelper";
import useSubscriptionStore from "@/store/subscription";

import TickSwitch from "@/components/atoms/TickSwitch.vue";
import TickChart from "@/components/molecules/charting/TickChart.vue";
import { allElementsEqual } from "@/helpers/arrayHelper";
import { TickButtonAppearance, TickButtonColor, TickButtonSize } from '@/helpers/enumsHelper';
import { tableToExcel } from "@/helpers/fileHelper";

const showVat = ref(true);
const allowSubheaders = ref(true);
const showDetailRows = ref(false);

const subscriptionStore = useSubscriptionStore();
const currentPeriodData = computed(() => subscriptionStore.currentPeriodUsage);

const usages = computed(() => currentPeriodData.value?.subscriptionUsages || []);
const credits = computed(() => currentPeriodData.value?.credits || []);
const creditCharts = computed(() => currentPeriodData.value?.creditCharts || []);

const hasUsages = computed(() => usages.value.length > 0);
const hasDiscount = computed(() => usages.value.some((p) => (p.calculatedDiscount ?? 0) > 0));
const hasCredits = computed(() => credits.value.length > 0);

const charts = computed(() => {
  const chartsData = creditCharts.value;

  if (showVat.value) {
    return chartsData.concat(currentPeriodData.value?.chartsInclVat || []);
  } else {
    return chartsData.concat(currentPeriodData.value?.charts || []);
  }
});

const getdate = (input: string | Date | undefined) => {
  return toDate(input ?? new Date());  // Safe default if undefined
};

const getDateCumulatedUsage = (date: Date) => {
  return usages.value.filter(p => ensureIsDate(p.from ?? new Date()).getDate() === date.getDate());  // Safe from
};

const getdateTotalInclVat = (input: string | Date | undefined) => {
  const recordsForDate = getDateCumulatedUsage(ensureIsDate(input ?? new Date()));
  const t = recordsForDate
    .map(item => item.calculatedCostIncludingVAT ?? 0)
    .reduce((prev, next) => prev + next, 0);
  return t.toFixed(2);
};

const getdateCalculatedCostWithoutDiscount = (input: string | Date | undefined) => {
  const recordsForDate = getDateCumulatedUsage(ensureIsDate(input ?? new Date()));
  const t = recordsForDate
    .map(item => item.calculatedCostWithoutDiscount ?? 0)
    .reduce((prev, next) => prev + next, 0);
  return t.toFixed(2);
};

const getdateCalculatedDiscount = (input: string | Date | undefined) => {
  const recordsForDate = getDateCumulatedUsage(ensureIsDate(input ?? new Date()));
  const t = recordsForDate
    .map(item => item.calculatedDiscount ?? 0)
    .reduce((prev, next) => prev + next, 0);
  return t.toFixed(2);
};

const getdateCalculatedVAT = (input: string | Date | undefined) => {
  const recordsForDate = getDateCumulatedUsage(ensureIsDate(input ?? new Date()));
  const t = recordsForDate
    .map(item => item.calculatedVAT ?? 0)
    .reduce((prev, next) => prev + next, 0);
  return t.toFixed(2);
};

const getdateCalculatedCostIncludingVAT = (input: string | Date | undefined) => {
  const recordsForDate = getDateCumulatedUsage(ensureIsDate(input ?? new Date()));
  const t = recordsForDate
    .map(item => item.calculatedCostIncludingVAT ?? 0)
    .reduce((prev, next) => prev + next, 0);
  return t.toFixed(2);
};

const getdateCalculatedVATPercentage = (input: string | Date | undefined) => {
  const recordsForDate = getDateCumulatedUsage(ensureIsDate(input ?? new Date()));
  const percentages = recordsForDate.map(item => item.vatPercentage ?? 0);  // Safe map

  const equal = allElementsEqual(percentages);
  return equal ? percentages[0] : 'see details';
};

const differentdate = (currentIndex: number): boolean => {
  if (currentIndex === 0) { return true; } // first row

  const current = usages.value[currentIndex];
  const former = usages.value[currentIndex - 1];

  const d1 = toDate(current?.from ?? new Date());  // Safe chaining + default
  const d2 = toDate(former?.from ?? new Date());
  return d1 !== d2;  // Strict ===
};


const usageDay = (item: SubscriptionUsage) => {
  return toDate(item.from ?? new Date());  // Safe from
};

const downloadPeriodAsExcel = async () => {
  allowSubheaders.value = false;

  await nextTick();
  const download = tableToExcel()("excelDownloadTable", "spending");
  allowSubheaders.value = true;
  return download;
};

onMounted(() => {
  subscriptionStore.useCurrentPeriodUsage();
});
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