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

// --- Type-safe events and props ---
export interface MountParams<
  P extends Record<string, unknown> = Record<string, unknown>,
  E extends Record<string, (...args: any[]) => void> = Record<string, (...args: any[]) => void>
> {
  props?: P;
  selector?: string;
  slot?: HTMLElement;
  slotContainer?: HTMLElement;
  events?: E;
  loadComponents?: Component | Component[];
}

export function mount<
  P extends Record<string, unknown> = Record<string, unknown>,
  E extends Record<string, (...args: any[]) => void> = Record<string, (...args: any[]) => void>
>(
  component: Component,
  params: MountParams<P, E>,
  id?: string
): string {
  // Transform events to "onXxx"
  const events: Record<string, Function> = {};
  if (params.events) {
    for (const key in params.events) {
      events[`on${key.charAt(0).toUpperCase()}${key.slice(1)}`] = params.events[key];
    }
  }

  // Create app
  const comp = h(component, { ...events, ...params.props });
  const app = createApp(comp)
    .use(pinia)
    .use(translatePlugin)
    .directive("focus", focus)
    .directive("closable", closable)
    .directive("autogrow", autogrow)
    .directive("tokenize", tokenize)
    .directive("handle", handle)
    .directive("globalnozoom", globalnozoom);

  // Load extra components
  const components = Array.isArray(params.loadComponents)
    ? params.loadComponents
    : params.loadComponents
      ? [params.loadComponents]
      : [];
  for (const c of components) {
    if (c.name) app.component(c.name, c);
  }

  // Register common components
  app.component("TickInputLabel", TickInputLabel);
  app.component("TickSettingsPanel", TickSettingsPanel);
  app.component("TickDialogPanel", TickDialogPanel);
  app.component("TickPanel", TickPanel);
  app.component("TickDropdown", TickDropdown);
  app.component("TickButton", TickButton);
  app.component("TaskFieldEditor", FormFieldEditor);
  app.component("UserIcon", UserIcon);
  app.component("CommunicatorIcon", CommunicatorIcon);
  app.component("TeamIcon", TeamIcon);
  app.component("TickInput", TickInput);
  app.component("TickIcon", TickIcon);

  // Determine slot
  const designatedSlot: HTMLElement =
    params.slot ??
    (params.slotContainer ? createSlot(params.slotContainer) : createSlot(document.body)) ??
    (params.selector ? (document.querySelector<HTMLElement>(params.selector) ?? createSlot(document.body)) : createSlot(document.body));

  if (!designatedSlot) throw new Error("Designated slot not found");

  id = id || generateId();
  designatedSlot.setAttribute("panelid", id);
  app.mount(designatedSlot);

  mounted.push({ id, el: designatedSlot, unmount: app.unmount });

  return id;
}

export function unmount(id: string) {
  const targetIndex = mounted.findIndex((t) => t.id === id);
  if (targetIndex === -1) return;

  const target = mounted[targetIndex];
  target.unmount();
  target.el.remove();
  mounted.splice(targetIndex, 1);
}
