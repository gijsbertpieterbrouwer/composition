<template>
  <component :is="dynamicComponent" />
</template>

<script lang="ts">
import { Component, Prop, Vue } from 'vue-facing-decorator';
import adapterIcon from './icons/icon-adapter.vue';
import arrowrightIcon from './icons/icon-arrow-right.vue';
import assigneeIcon from './icons/icon-assignee.vue';
import boldIcon from './icons/icon-bold.vue';
import captureIcon from './icons/icon-capture.vue';
import channelIcon from './icons/icon-channel.vue';
import checkIcon from './icons/icon-check.vue';
import chevrondownIcon from './icons/icon-chevron-down.vue';
import choiceIcon from './icons/icon-choice.vue';
import codeIcon from './icons/icon-code.vue';
import codeblockIcon from './icons/icon-codeblock.vue';
import collectionIcon from './icons/icon-collection.vue';
import conditionIcon from './icons/icon-condition.vue';
import contactsIcon from './icons/icon-contacts.vue';
import databagIcon from './icons/icon-databag.vue';
import draggablehandleIcon from './icons/icon-draggable-handle.vue';
import environmentIcon from './icons/icon-environment.vue';
import expandIcon from './icons/icon-expand.vue';
import fileIcon from './icons/icon-file.vue';
import finishIcon from './icons/icon-finish.vue';
import flowIcon from './icons/icon-flow.vue';
import homeIcon from './icons/icon-home.vue';
import inboundIcon from './icons/icon-inbound.vue';
import italicsIcon from './icons/icon-italics.vue';
import labelIcon from './icons/icon-label.vue';
import linkIcon from './icons/icon-link.vue';
import logoutIcon from './icons/icon-logout.vue';
import messageIcon from './icons/icon-message.vue';
import metadatacomponentIcon from './icons/icon-metadata-component.vue';
import minusIcon from './icons/icon-minus.vue';
import navigateIcon from './icons/icon-navigate.vue';
import nocloudIcon from './icons/icon-nocloud.vue';
import noteIcon from './icons/icon-note.vue';
import orderedlistIcon from './icons/icon-orderedlist.vue';
import outboundIcon from './icons/icon-outbound.vue';
import playIcon from './icons/icon-play.vue';
import resizeIcon from './icons/icon-resize.vue';
import secureIcon from './icons/icon-secure.vue';
import sendIcon from './icons/icon-send.vue';
import settingsIcon from './icons/icon-settings.vue';
import slaIcon from './icons/icon-sla.vue';
import statsIcon from './icons/icon-stats.vue';
import subscriptionIcon from './icons/icon-subscription.vue';
import taskIcon from './icons/icon-task.vue';
import teamIcon from './icons/icon-team.vue';
import ticketIcon from './icons/icon-ticket.vue';

import ticknameIcon from './icons/icon-tickname.vue';
import unorderedlistIcon from './icons/icon-unorderedlist.vue';
import usersIcon from './icons/icon-users.vue';
import warningflowstepconnectionIcon from './icons/icon-warning-flowstepconnection.vue';
import warningIcon from './icons/icon-warning.vue';

import balloonsIcon from './icons/status/icon-balloons.vue';
import candyIcon from './icons/status/icon-candy.vue';
import confettiIcon from './icons/status/icon-confetti.vue';
import cupcakeIcon from './icons/status/icon-cupcake.vue';
import drinkIcon from './icons/status/icon-drink.vue';
import giftIcon from './icons/status/icon-gift.vue';
import karaokeIcon from './icons/status/icon-karaoke.vue';
import sparkIcon from './icons/status/icon-spark.vue';

import clockIcon from './icons/icon-clock.vue';
import eyeoffIcon from './icons/icon-eye-off.vue';
import eyeIcon from './icons/icon-eye.vue';
import refreshIcon from './icons/icon-refresh.vue';

import adminIcon from './icons/icon-admin.vue';
import cameraIcon from './icons/icon-camera.vue';
import channelchatwidgetIcon from './icons/icon-channel-chatwidget.vue';
import channelemailIcon from './icons/icon-channel-email.vue';
import channelfbmessengerIcon from './icons/icon-channel-fbmessenger.vue';
import channelphoneIcon from './icons/icon-channel-phone.vue';
import channeltelegramIcon from './icons/icon-channel-telegram.vue';
import circleIcon from './icons/icon-circle.vue';
import closeIcon from './icons/icon-close.vue';
import commentIcon from './icons/icon-comment.vue';
import copyIcon from './icons/icon-copy.vue';
import dashboardIcon from './icons/icon-dashboard.vue';
import databagitemIcon from './icons/icon-databagitem.vue';
import deleteIcon from './icons/icon-delete.vue';
import domainverificationIcon from './icons/icon-domain-verification.vue';
import downloadIcon from './icons/icon-download.vue';
import editIcon from './icons/icon-edit.vue';
import filterIcon from './icons/icon-filter.vue';
import flagnlIcon from './icons/icon-flag-nl.vue';
import flagusIcon from './icons/icon-flag-us.vue';
import infoIcon from './icons/icon-info.vue';
import knowledgebaseIcon from './icons/icon-knowledgebase.vue';
import morehorizontalIcon from './icons/icon-more-horizontal.vue';
import moreverticalIcon from './icons/icon-more-vertical.vue';
import partnerIcon from './icons/icon-partner.vue';
import phoneforwardIcon from './icons/icon-phone-forward.vue';
import phonemissedIcon from './icons/icon-phone-missed.vue';
import phoneoffIcon from './icons/icon-phone-off.vue';
import phoneIcon from './icons/icon-phone.vue';
import plusIcon from './icons/icon-plus.vue';
import searchIcon from './icons/icon-search.vue';
import slackcolorIcon from './icons/icon-slack-color.vue';
import slackIcon from './icons/icon-slack.vue';
import ticklogoIcon from './icons/icon-ticklogo.vue';
import unlimitedIcon from './icons/icon-unlimited.vue';

import micoffIcon from './icons/icon-mic-off.vue';
import micIcon from './icons/icon-mic.vue';
@Component({
  emits: [],
  components: {
    micIcon,
    micoffIcon,
    channelphoneIcon,
    phoneIcon,
    phonemissedIcon,
    phoneforwardIcon,
    phoneoffIcon,
    cameraIcon,
    circleIcon,
    editIcon,
    searchIcon,
    copyIcon,
    domainverificationIcon,
    flagnlIcon,
    flagusIcon,
    slackIcon,
    slackcolorIcon,
    unlimitedIcon,
    databagitemIcon,
    moreverticalIcon,
    morehorizontalIcon,
    infoIcon,
    downloadIcon,
    filterIcon,
    adminIcon,
    plusIcon,
    dashboardIcon,
    closeIcon,
    adapterIcon,
    arrowrightIcon,
    assigneeIcon,
    boldIcon,
    captureIcon,

    channelIcon,
    channeltelegramIcon,
    channelfbmessengerIcon,
    channelchatwidgetIcon,
    channelemailIcon,

    checkIcon,
    chevrondownIcon,
    choiceIcon,
    codeIcon,
    codeblockIcon,
    collectionIcon,
    conditionIcon,
    contactsIcon,
    databagIcon,
    draggablehandleIcon,
    environmentIcon,
    expandIcon,
    fileIcon,
    finishIcon,
    flowIcon,
    homeIcon,
    inboundIcon,
    italicsIcon,
    labelIcon,
    linkIcon,
    logoutIcon,
    messageIcon,
    metadatacomponentIcon,
    minusIcon,
    navigateIcon,
    nocloudIcon,
    noteIcon,
    orderedlistIcon,
    outboundIcon,
    playIcon,
    ticketIcon,
    resizeIcon,
    secureIcon,
    sendIcon,
    settingsIcon,
    slaIcon,
    statsIcon,
    subscriptionIcon,
    taskIcon,
    teamIcon,
    ticklogoIcon,
    ticknameIcon,
    unorderedlistIcon,
    usersIcon,
    warningIcon,
    warningflowstepconnectionIcon,
    eyeIcon,
    eyeoffIcon,
    clockIcon,
    refreshIcon,
    confettiIcon,

    balloonsIcon,
    candyIcon,
    drinkIcon,
    giftIcon,
    karaokeIcon,
    sparkIcon,
    cupcakeIcon,

    commentIcon,
    deleteIcon,
    knowledgebaseIcon,
    partnerIcon
  },
})
export default class TickIcon extends Vue {
  @Prop() private name: string;

  // private get filePath(): string {
  //   const name = this.name;
  //   const fileName = "./icons/icon-" + name.toLowerCase() + ".vue";

  //   return fileName;
  // }

  private get dynamicComponent() {
    let name = this.name ?? "IconLoader";
    if (!name.length) { name = "iconLoader"; }
    if (typeof (name) != "string") {
      // eslint-disable-next-line no-debugger
      debugger;
    }
    return name
      ? name.replace("-", "").toLowerCase() + "Icon"
      : "IconLoader";


    // // store name in const to allow reactivity
    // //return defineAsyncComponent(() => import(`@/components/icons/icon-${name}.vue`));
    // return defineAsyncComponent({
    //   // the loader function
    //   loader: () => import(this.filePath),

    //   // A component to use while the async component is loading
    //   loadingComponent: IconLoader,
    //   // Delay before showing the loading component. Default: 200ms.
    //   delay: 200,

    //   // A component to use if the load fails
    //   errorComponent: IconLoader,
    //   // The error component will be displayed if a timeout is
    //   // provided and exceeded. Default: Infinity.
    //   timeout: 3000
    // });

  }

}
</script>