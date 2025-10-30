<template>
  <component :is="dynamicComponent" />
</template>

<script setup lang="ts">
import { computed } from 'vue';

// ✅ Props
const props = defineProps<{
  name: string;
}>();

// ✅ Imports for all icons
import adapterIcon from './icons/icon-adapter.vue';
import adminIcon from './icons/icon-admin.vue';
import arrowrightIcon from './icons/icon-arrow-right.vue';
import assigneeIcon from './icons/icon-assignee.vue';
import boldIcon from './icons/icon-bold.vue';
import cameraIcon from './icons/icon-camera.vue';
import captureIcon from './icons/icon-capture.vue';
import channelchatwidgetIcon from './icons/icon-channel-chatwidget.vue';
import channelemailIcon from './icons/icon-channel-email.vue';
import channelfbmessengerIcon from './icons/icon-channel-fbmessenger.vue';
import channelphoneIcon from './icons/icon-channel-phone.vue';
import channeltelegramIcon from './icons/icon-channel-telegram.vue';
import channelIcon from './icons/icon-channel.vue';
import checkIcon from './icons/icon-check.vue';
import chevrondownIcon from './icons/icon-chevron-down.vue';
import choiceIcon from './icons/icon-choice.vue';
import circleIcon from './icons/icon-circle.vue';
import clockIcon from './icons/icon-clock.vue';
import closeIcon from './icons/icon-close.vue';
import codeIcon from './icons/icon-code.vue';
import codeblockIcon from './icons/icon-codeblock.vue';
import collectionIcon from './icons/icon-collection.vue';
import commentIcon from './icons/icon-comment.vue';
import conditionIcon from './icons/icon-condition.vue';
import contactsIcon from './icons/icon-contacts.vue';
import copyIcon from './icons/icon-copy.vue';
import dashboardIcon from './icons/icon-dashboard.vue';
import databagIcon from './icons/icon-databag.vue';
import databagitemIcon from './icons/icon-databagitem.vue';
import deleteIcon from './icons/icon-delete.vue';
import domainverificationIcon from './icons/icon-domain-verification.vue';
import downloadIcon from './icons/icon-download.vue';
import draggablehandleIcon from './icons/icon-draggable-handle.vue';
import editIcon from './icons/icon-edit.vue';
import environmentIcon from './icons/icon-environment.vue';
import expandIcon from './icons/icon-expand.vue';
import eyeoffIcon from './icons/icon-eye-off.vue';
import eyeIcon from './icons/icon-eye.vue';
import fileIcon from './icons/icon-file.vue';
import filterIcon from './icons/icon-filter.vue';
import finishIcon from './icons/icon-finish.vue';
import flagnlIcon from './icons/icon-flag-nl.vue';
import flagusIcon from './icons/icon-flag-us.vue';
import flowIcon from './icons/icon-flow.vue';
import homeIcon from './icons/icon-home.vue';
import inboundIcon from './icons/icon-inbound.vue';
import infoIcon from './icons/icon-info.vue';
import italicsIcon from './icons/icon-italics.vue';
import knowledgebaseIcon from './icons/icon-knowledgebase.vue';
import labelIcon from './icons/icon-label.vue';
import linkIcon from './icons/icon-link.vue';
import logoutIcon from './icons/icon-logout.vue';
import messageIcon from './icons/icon-message.vue';
import metadatacomponentIcon from './icons/icon-metadata-component.vue';
import micoffIcon from './icons/icon-mic-off.vue';
import micIcon from './icons/icon-mic.vue';
import minusIcon from './icons/icon-minus.vue';
import morehorizontalIcon from './icons/icon-more-horizontal.vue';
import moreverticalIcon from './icons/icon-more-vertical.vue';
import navigateIcon from './icons/icon-navigate.vue';
import nocloudIcon from './icons/icon-nocloud.vue';
import noteIcon from './icons/icon-note.vue';
import orderedlistIcon from './icons/icon-orderedlist.vue';
import outboundIcon from './icons/icon-outbound.vue';
import partnerIcon from './icons/icon-partner.vue';
import phoneforwardIcon from './icons/icon-phone-forward.vue';
import phonemissedIcon from './icons/icon-phone-missed.vue';
import phoneoffIcon from './icons/icon-phone-off.vue';
import phoneIcon from './icons/icon-phone.vue';
import playIcon from './icons/icon-play.vue';
import plusIcon from './icons/icon-plus.vue';
import refreshIcon from './icons/icon-refresh.vue';
import resizeIcon from './icons/icon-resize.vue';
import searchIcon from './icons/icon-search.vue';
import secureIcon from './icons/icon-secure.vue';
import sendIcon from './icons/icon-send.vue';
import settingsIcon from './icons/icon-settings.vue';
import slaIcon from './icons/icon-sla.vue';
import slackcolorIcon from './icons/icon-slack-color.vue';
import slackIcon from './icons/icon-slack.vue';
import statsIcon from './icons/icon-stats.vue';
import subscriptionIcon from './icons/icon-subscription.vue';
import taskIcon from './icons/icon-task.vue';
import teamIcon from './icons/icon-team.vue';
import ticketIcon from './icons/icon-ticket.vue';
import ticklogoIcon from './icons/icon-ticklogo.vue';
import ticknameIcon from './icons/icon-tickname.vue';
import unlimitedIcon from './icons/icon-unlimited.vue';
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


// ✅ Registry of all icons
const icons = {
  adapterIcon,
  arrowrightIcon,
  assigneeIcon,
  boldIcon,
  captureIcon,
  channelIcon,
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
  resizeIcon,
  secureIcon,
  sendIcon,
  settingsIcon,
  slaIcon,
  statsIcon,
  subscriptionIcon,
  taskIcon,
  teamIcon,
  ticketIcon,
  ticknameIcon,
  unorderedlistIcon,
  usersIcon,
  warningflowstepconnectionIcon,
  warningIcon,
  balloonsIcon,
  candyIcon,
  confettiIcon,
  cupcakeIcon,
  drinkIcon,
  giftIcon,
  karaokeIcon,
  sparkIcon,
  clockIcon,
  eyeoffIcon,
  eyeIcon,
  refreshIcon,
  adminIcon,
  cameraIcon,
  channelchatwidgetIcon,
  channelemailIcon,
  channelfbmessengerIcon,
  channelphoneIcon,
  channeltelegramIcon,
  circleIcon,
  closeIcon,
  commentIcon,
  copyIcon,
  dashboardIcon,
  databagitemIcon,
  deleteIcon,
  domainverificationIcon,
  downloadIcon,
  editIcon,
  filterIcon,
  flagnlIcon,
  flagusIcon,
  infoIcon,
  knowledgebaseIcon,
  morehorizontalIcon,
  moreverticalIcon,
  partnerIcon,
  phoneforwardIcon,
  phonemissedIcon,
  phoneoffIcon,
  phoneIcon,
  plusIcon,
  searchIcon,
  slackcolorIcon,
  slackIcon,
  ticklogoIcon,
  unlimitedIcon,
  micoffIcon,
  micIcon,
};

// ✅ Compute which icon to render
const dynamicComponent = computed(() => {
  let name = props.name?.trim() ?? '';

  // Normalize: remove dashes, lowercase, and append "Icon"
  const key = (name.replace(/-/g, '').toLowerCase() + 'Icon') as keyof typeof icons;

  // Return component or fallback
  return icons[key];
});
</script>
