/* eslint-disable @typescript-eslint/no-explicit-any */
import App from "@/App.vue";
import TickPanel from "@/components/atoms/TickPanel.vue";
import TickTextarea from "@/components/atoms/TickTextarea.vue";
import TaskFormFieldEditor from "@/components/molecules/form/editor/FormEditorFieldButton.vue";
import GenericMetaDataComponentDataItem from "@/components/molecules/metadatacomponent/components/GenericMetaDataComponentDataItem.vue";
//import TaskFormSectionEditor from "@/components/molecules/task/editor/TaskFormSectionEditor.vue";

import TickSettingsPanel from "@/components/panels/TickSettingsPanel.vue";
import router from "@/router";
import pinia from "@/store/pinia";
import { createApp } from "vue";
import VueGtag from "vue-gtag";
import TickInputLabel from "./components/atoms/TickInputLabel.vue";
import translatePlugin from "./plugins/translatePlugin";

import { autogrow, closable, focus, globalnozoom, handle, tokenize } from "@/directives";
import { Call, Device } from "@twilio/voice-sdk";
import CommunicatorIcon from "./components/atoms/CommunicatorIcon.vue";
import TeamIcon from "./components/atoms/TeamIcon.vue";
import TickButton from "./components/atoms/TickButton.vue";
import TickDropdown from "./components/atoms/TickDropdown.vue";
import TickInput from "./components/atoms/TickInput.vue";
import UserIcon from "./components/atoms/UserIcon.vue";
import ChannelOpeningHoursEditor from "./components/molecules/channel/ChannelOpeningHoursEditor.vue";
import FormFieldEditor from "./components/molecules/form/editor/FormFieldEditor.vue";
import FormFieldExplanation from "./components/molecules/form/form/FormFieldExplanation.vue";
import TicketStatusLabel from "./components/molecules/ticket/TicketStatusLabel.vue";
import TickIcon from "./components/TickIcon.vue";

const app = createApp(App)
    .use(pinia)
    .use(router)
    .use(translatePlugin)
    .use(VueGtag, {
        config: { id: "G-02QFYBR6CQ" }
    });

//1 Add components globally
app
    .component("GenericMetaDataComponentDataItem", GenericMetaDataComponentDataItem)
    .component("FormFieldExplanation", FormFieldExplanation)
    .component("TaskFormFieldEditor", TaskFormFieldEditor)
    .component("TickInputLabel", TickInputLabel)
    .component("TickTextarea", TickTextarea)
    .component("TickSettingsPanel", TickSettingsPanel)
    .component("TickDropdown", TickDropdown)
    .component("TickButton", TickButton)
    .component("TickPanel", TickPanel)
    .component("TickIcon", TickIcon)
    .component("TaskFieldEditor", FormFieldEditor)
    .component("UserIcon", UserIcon)
    .component("TeamIcon", TeamIcon)
    .component("CommunicatorIcon", CommunicatorIcon)
    .component("TickInput", TickInput)
    .component("ChannelOpeningHoursEditor", ChannelOpeningHoursEditor)
    .component("TicketStatusLabel", TicketStatusLabel);
app
    .directive('focus', focus)
    .directive('closable', closable)
    .directive('autogrow', autogrow)
    .directive('tokenize', tokenize)
    .directive('handle', handle)
    .directive('globalnozoom', globalnozoom)
// 2 custom elements
app.config.compilerOptions.isCustomElement = (tag) => {
    return tag.startsWith('tick-chatwidget'); // (return true)
}

//  3 mount app to index.html
app.mount("#app");



//Stop error resizeObserver
const debounce = (callback: (...args: unknown[]) => void, delay: number) => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let tid: any;
    return function (...args: unknown[]) {
        const ctx = self;
        tid && clearTimeout(tid);
        tid = setTimeout(() => {
            callback.apply(ctx, args);
        }, delay);
    };
};

const _ = (window as any).ResizeObserver;
(window as any).ResizeObserver = class ResizeObserver extends _ {
    constructor(callback: (...args: any[]) => void) {
        callback = debounce(callback, 20);
        super(callback);
    }
};


export interface TickDom {
    Tick?: {
        VoiceDevice?: Device,
        VoiceCall?: Call,
    }
}


