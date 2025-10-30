/* eslint-disable @typescript-eslint/no-unused-vars */
import { Directive } from "vue";
import { animationDebounce } from "./helpers/debounce";
import { deviceIsDesktop } from "./helpers/deviceHelper";
import { getReadStorageLocations } from "./helpers/enumsHelper";
import { onHandleInputChange } from "./helpers/handleHelper";
import {
  onTokenizableInputChange,
  onTokenizableInputClick,
  onTokenizableInputContextMenu,
} from "./helpers/tokenizationHelper";
import { StorageLocation } from "./TickApi";

/* ------------------------------------------------------------------ */
/*  Helpers                                                            */
/* ------------------------------------------------------------------ */
function canFocus(el: HTMLElement): boolean {
  if (el.hidden || el.hasAttribute("disabled")) return false;
  return (
    el instanceof HTMLInputElement ||
    el instanceof HTMLSelectElement ||
    el instanceof HTMLTextAreaElement ||
    el instanceof HTMLButtonElement
  );
}

function isWritableInput(
  el: HTMLElement
): el is HTMLInputElement | HTMLTextAreaElement {
  if (el.hidden || el.hasAttribute("disabled")) return false;
  return el instanceof HTMLInputElement || el instanceof HTMLTextAreaElement;
}

/* ------------------------------------------------------------------ */
/*  focus                                                              */
/* ------------------------------------------------------------------ */
function focusElement(el: HTMLElement, select: boolean) {
  if (!el) return;

  const focusable = canFocus(el)
    ? el
    : (el.querySelector(
      "input, select, textarea, button"
    ) as HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement | HTMLButtonElement | null);

  if (!focusable) {
    console.log("no focus element found");
    return;
  }

  focusable.focus();

  if (!deviceIsDesktop()) return;
  setTimeout(() => focusable.focus(), 200);

  if (select && "select" in focusable) {
    setTimeout(() => (focusable as any).select(), 200);
  }
}

export const focus: Directive<HTMLElement, boolean> = {
  mounted(el, binding) {
    focusElement(el, binding.value ?? binding.arg === "");
  },
};

/* ------------------------------------------------------------------ */
/*  scrollPositionInCss                                                */
/* ------------------------------------------------------------------ */
export const scrollPositionInCss: Directive<HTMLElement> = {
  mounted(el) {
    const store = () => {
      const top = Math.round(el.scrollTop);
      el.dataset.scrollpx = top.toString();

      const pct =
        el.scrollHeight > el.clientHeight
          ? (100 * el.scrollTop) / (el.scrollHeight - el.clientHeight)
          : 0;
      el.dataset.scrollpc = Math.round(Math.abs(pct)).toString();

      el.dataset.scrolling = el.scrollHeight > el.clientHeight ? "true" : "";
    };

    const listener = animationDebounce(store);
    el.addEventListener("scroll", listener as EventListener, { passive: true });
    store();

    el._scrollListener = listener;
  },
  unmounted(el) {
    if (el._scrollListener) {
      el.removeEventListener("scroll", el._scrollListener);
      delete (el as any)._scrollListener;
    }
  },
};

/* ------------------------------------------------------------------ */
/*  closable (outside click/scroll/resize)                             */
/* ------------------------------------------------------------------ */
export const closable: Directive<
  HTMLElement,
  (ev: Event, el: HTMLElement) => void
> = {
  mounted(el, binding) {
    const click = ((e: Event) => {
      if (el !== e.target && !el.contains(e.target as Node)) binding.value(e, el);
    }) as EventListener;
    const scroll = ((e: Event) => {
      if (el !== e.target && !el.contains(e.target as Node)) binding.value(e, el);
    }) as EventListener;
    const resize = ((e: Event) => {
      if (el !== e.target && !el.contains(e.target as Node)) binding.value(e, el);
    }) as EventListener;

    window.requestAnimationFrame(() => {
      document.addEventListener("click", click, true);
      window.addEventListener("scroll", scroll, true);
      window.addEventListener("resize", resize, true);
    });

    el._closableHandlers = { click, scroll, resize };
  },
  unmounted(el) {
    const h = el._closableHandlers as any;
    if (h) {
      document.removeEventListener("click", h.click, true);
      window.removeEventListener("scroll", h.scroll, true);
      window.removeEventListener("resize", h.resize, true);
      delete (el as any)._closableHandlers;
    }
  },
};

/* ------------------------------------------------------------------ */
/*  autogrow (textarea)                                                */
/* ------------------------------------------------------------------ */
export const autogrow: Directive<HTMLElement> = {
  mounted(el) {
    const textarea =
      el.tagName.toLowerCase() === "textarea"
        ? (el as HTMLTextAreaElement)
        : el.querySelector("textarea");

    if (!textarea) return;

    const minRows = Math.max(1, parseInt(textarea.dataset.rows ?? "1", 10));
    textarea.rows = minRows;

    const resize = () => {
      textarea.style.height = "auto";
      const style = getComputedStyle(textarea);
      const pad = parseFloat(style.paddingTop) + parseFloat(style.paddingBottom);
      textarea.style.height = `${textarea.scrollHeight + pad}px`;
    };
    const delayed = () => setTimeout(resize, 0);

    const observer = new IntersectionObserver(
      (entries) => entries.forEach((e) => e.isIntersecting && resize()),
      { root: document.documentElement }
    );
    observer.observe(textarea);

    const events: string[] = ["change", "cut", "paste", "drop", "input", "focus"];
    events.forEach((ev) =>
      textarea.addEventListener(ev, (ev === "input" ? resize : delayed) as EventListener)
    );

    resize();

    textarea._autogrow = { events, observer, resize, delayed };
  },
  unmounted(el) {
    const textarea =
      el.tagName.toLowerCase() === "textarea"
        ? el
        : el.querySelector("textarea");
    const data = textarea?._autogrow as any;
    if (!data) return;

    data.events.forEach((ev: string) =>
      textarea!.removeEventListener(
        ev,
        (ev === "input" ? data.resize : data.delayed) as EventListener
      )
    );
    data.observer.disconnect();
    delete (textarea as any)._autogrow;
  },
};

/* ------------------------------------------------------------------ */
/*  tokenize                                                           */
/* ------------------------------------------------------------------ */
type TokenizeBinding = {
  locations?: StorageLocation[];
  defaultNewStorageLocation?: StorageLocation | null;
};

export const tokenize: Directive<HTMLElement, TokenizeBinding> = {
  mounted(el, binding) {
    if (!el) return;

    const locations = binding.value?.locations ?? getReadStorageLocations();
    const defaultLoc = binding.value?.defaultNewStorageLocation ?? null as StorageLocation | null;

    const input = isWritableInput(el)
      ? el
      : (el.querySelector("input, textarea") as HTMLInputElement | HTMLTextAreaElement | null);
    if (!input) return;

    const fire = (value: string) => {
      input.value = value;
      input.dispatchEvent(new Event("input", { bubbles: true }));
    };
    const close = () => focusElement(input, false);
    const selected = (out: string) => {
      fire(out);
      close();
    };

    // ---- typed handlers (cast to EventListener when registering) ----
    const ctx = ((e: MouseEvent) => {
      e.preventDefault();
      e.stopPropagation();
      onTokenizableInputContextMenu(input, locations, defaultLoc, selected, close);
    }) as EventListener;

    const inp = ((e: InputEvent) => {
      if (e.data === null) return;
      onTokenizableInputChange(input, locations, defaultLoc, selected, close);
    }) as EventListener;

    const clk = (() => {
      onTokenizableInputClick(input, locations, defaultLoc, selected, close);
    }) as EventListener;

    input.addEventListener("contextmenu", ctx);
    input.addEventListener("input", inp);
    input.addEventListener("click", clk);

    el._tokenizeHandlers = { ctx, input: inp, click: clk };
  },
  unmounted(el) {
    const h = el._tokenizeHandlers as any;
    const input = isWritableInput(el)
      ? el
      : (el.querySelector("input, textarea") as HTMLInputElement | HTMLTextAreaElement | null);
    if (!h || !input) return;

    input.removeEventListener("contextmenu", h.ctx);
    input.removeEventListener("input", h.input);
    input.removeEventListener("click", h.click);
    delete (el as any)._tokenizeHandlers;
  },
};

/* ------------------------------------------------------------------ */
/*  handle                                                             */
/* ------------------------------------------------------------------ */
export const handle: Directive<HTMLElement> = {
  mounted(el) {
    if (!el) return;

    const input = isWritableInput(el)
      ? el
      : (el.querySelector("input, textarea") as HTMLInputElement | HTMLTextAreaElement | null);
    if (!input) return;

    const fire = (value: string) => {
      input.value = value;
      input.dispatchEvent(new Event("input", { bubbles: true }));
    };
    const close = () => focusElement(input, false);
    const selected = (out: string) => {
      fire(out);
      close();
    };

    const handler = ((e: InputEvent) => {
      if (e.data === null) return;
      onHandleInputChange(input, selected, close);
    }) as EventListener;

    input.addEventListener("input", handler);
    el._handleInput = handler;
  },
  unmounted(el) {
    const fn = el._handleInput as any;
    const input = isWritableInput(el)
      ? el
      : (el.querySelector("input, textarea") as HTMLInputElement | HTMLTextAreaElement | null);
    if (!fn || !input) return;

    input.removeEventListener("input", fn);
    delete (el as any)._handleInput;
  },
};

/* ------------------------------------------------------------------ */
/*  globalnozoom                                                       */
/* ------------------------------------------------------------------ */
export const globalnozoom: Directive<HTMLElement> = {
  mounted() {
    const wheel = ((e: WheelEvent) => e.ctrlKey && e.preventDefault()) as EventListener;
    const key = ((e: KeyboardEvent) => {
      if (e.ctrlKey && (e.key === "=" || e.key === "-")) e.preventDefault();
    }) as EventListener;

    document.addEventListener("wheel", wheel, { passive: false });
    document.addEventListener("keydown", key);

    if (!(document as any)._nz) (document as any)._nz = { wheel, key };
  },
  unmounted() {
    const l = (document as any)._nz;
    if (!l) return;
    document.removeEventListener("wheel", l.wheel);
    document.removeEventListener("keydown", l.key);
    delete (document as any)._nz;
  },
};