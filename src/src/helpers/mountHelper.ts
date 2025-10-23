import CommunicatorIcon from "@/components/atoms/CommunicatorIcon.vue";
import TeamIcon from "@/components/atoms/TeamIcon.vue";
import TickButton from "@/components/atoms/TickButton.vue";
import TickDropdown from "@/components/atoms/TickDropdown.vue";
import TickInput from "@/components/atoms/TickInput.vue";
import TickInputLabel from "@/components/atoms/TickInputLabel.vue";
import TickPanel from "@/components/atoms/TickPanel.vue";
import UserIcon from "@/components/atoms/UserIcon.vue";
import FormFieldEditor from "@/components/molecules/form/editor/FormFieldEditor.vue";
import TickDialogPanel from "@/components/panels/TickDialogPanel.vue";
import TickSettingsPanel from "@/components/panels/TickSettingsPanel.vue";
import TickIcon from "@/components/TickIcon.vue";
import { autogrow, closable, focus, globalnozoom, handle, tokenize } from "@/directives";
import translatePlugin from "@/plugins/translatePlugin";
import pinia from "@/store/pinia";
import { Component, createApp, h } from "vue";
import generateId from "./guid";
interface MountedComponent {
  id: string;
  el: HTMLElement;
  unmount: () => void;
}

const mounted: MountedComponent[] = [];

function createSlot(slotContainer: Element): HTMLDivElement {
  const el = document.createElement("div");
  el.style.position = "absolute";
  el.style.zIndex = (999999999 + mounted.length).toString();
  slotContainer.appendChild(el);
  return el;
}

// eslint-disable-next-line @typescript-eslint/ban-types
type Events = Record<string, Function>;

interface MountParams {
  props?: Record<string, unknown>;
  selector?: string;
  slot?: HTMLElement;
  slotContainer?: HTMLElement;
  events?: Events;
  loadComponents?: Component | Component[]
}

export function mount(component: Component, params: MountParams, id?: string) {
  const events: Events = {};
  if (typeof params.events === "object") {
    for (const key in params.events) {
      // events should be prefixed with "on" for registration.
      const newKey = `on${key.substring(0, 1).toUpperCase()}${key.substring(1)}`;
      events[newKey] = params.events[key];
    }
  }

  const comp = h(component as Component, { ...events, ...params.props });
  const app = createApp(comp)
    .use(pinia)
    .use(translatePlugin);

  app
    .directive('focus', focus)
    .directive('closable', closable)
    .directive('autogrow', autogrow)
    .directive('tokenize', tokenize)
    .directive('handle', handle)
    .directive('globalnozoom', globalnozoom)


  // LOAD components
  if (params.loadComponents) {
    if (!Array.isArray(params.loadComponents)) {
      params.loadComponents = [params.loadComponents];
    }

    for (let index = 0; index < params.loadComponents.length; index++) {
      const c: Component = (params.loadComponents as Component[])[index];
      app.component(c.name, c);
    }
  }


  app.component("TickInputLabel", TickInputLabel)
  app.component("TickSettingsPanel", TickSettingsPanel);
  app.component("TickDialogPanel", TickDialogPanel);
  app.component("TickPanel", TickPanel);
  app.component("TickDropdown", TickDropdown)
  app.component("TickButton", TickButton)
  app.component("TaskFieldEditor", FormFieldEditor)
  app.component("UserIcon", UserIcon)
  app.component("CommunicatorIcon", CommunicatorIcon)
  app.component("TeamIcon", TeamIcon)
  app.component("TickInput", TickInput)
  app.component("TickIcon", TickIcon);
  // create a new slot in the body if required
  const designatedSlot =
    params.slot ||
    (params.slotContainer && createSlot(params.slotContainer)) ||
    (params.selector ? document.querySelector(params.selector) : createSlot(document.body));

  id = id || generateId();
  designatedSlot.setAttribute("panelid", id);

  app.mount(designatedSlot);

  mounted.push({
    id,
    unmount: app.unmount,
    el: designatedSlot,
  });

  return id;
}

export function unmount(id: string) {
  if (!id) { return; }
  const target = mounted.find((t) => t.id === id);
  if (!target) { return; }

  target.unmount();
  target.el.remove();

  mounted.splice(mounted.findIndex((t) => t.id === id), 1);
}
