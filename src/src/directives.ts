/* eslint-disable @typescript-eslint/no-unused-vars */
import { Directive, VNode } from "vue";
import { animationDebounce } from "./helpers/debounce";
import { deviceIsDesktop } from "./helpers/deviceHelper";
import { getReadStorageLocations } from "./helpers/enumsHelper";
import { onHandleInputChange } from "./helpers/handleHelper";
import { onTokenizableInputChange, onTokenizableInputClick, onTokenizableInputContextMenu } from "./helpers/tokenizationHelper";
import { StorageLocation } from "./TickApi";



function canFocus(el: HTMLElement): boolean {
  const disabled = el.attributes.getNamedItem('disabled')
  if (el.hidden || disabled) {
    return false;
  }

  if (el instanceof HTMLInputElement) { return true }         // <input>
  if (el instanceof HTMLSelectElement) { return true }    // <select>
  if (el instanceof HTMLTextAreaElement) { return true }  // <textarea>
  if (el instanceof HTMLButtonElement) { return true }  // <textarea>

  return false;
}

function isWritableInput(el: HTMLElement): boolean {
  const disabled = el.attributes.getNamedItem('disabled')
  if (el.hidden || disabled) {
    return false;
  }

  if (el instanceof HTMLInputElement) { return true }         // <input>
  if (el instanceof HTMLTextAreaElement) { return true }  // <textarea>

  return false;
}

function focusElement(el: HTMLElement, select: boolean) {
  if (!el) { return; } // element may be gone

  const elToFocus = canFocus(el)
    ? el
    : el.querySelector('input, select, textarea') as HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement;

  if (!elToFocus) {
    console.log("no focus element found")
    return;
  }

  elToFocus.focus()


  //do not allow on mobile to auto-focus
  if (!deviceIsDesktop()) { return; }
  setTimeout(() => {
    elToFocus.focus();
  }, 200);
  window.requestAnimationFrame(() => {
    elToFocus.focus();
  });

  if (select) {
    if (elToFocus instanceof HTMLInputElement || elToFocus instanceof HTMLTextAreaElement) {
      setTimeout(() => {
        elToFocus.select();
      }, 200);
      window.requestAnimationFrame(() => {
        elToFocus.select();
      });
    }
  }
}

const focus: Directive = {
  //usage v-focus  or v-focus:true for also pre-selecting text
  mounted: (el: HTMLElement, binding, vnode) => {
    focusElement(el, binding?.arg ? true : false)
  }
};
export { focus };

// Thanks Rik Schennink: https://pqina.nl/blog/applying-styles-based-on-the-user-scroll-position-with-smart-css/
const scrollPositionInCss: Directive<HTMLElement> = {
  mounted: (el) => {
    // Reads out the scroll position and stores it in the data attribute
    // so it can be used in our stylesheets
    const storeScroll = () => {
      el.dataset.scrollpx = Math.round(el.scrollTop).toString();
      const scrollpc =
        (100 * el.scrollTop) / (el.scrollHeight - el.clientHeight);
      el.dataset.scrollpc = Math.round(
        (scrollpc < 0 ? scrollpc * -1 : scrollpc) || 0
      ).toString();

      if (el.scrollHeight > el.clientHeight) {
        el.dataset.scrolling = true.toString();
      }
    };

    // Listen for new scroll events, debounce the `storeScroll` function
    el.addEventListener("scroll", animationDebounce(storeScroll), {
      passive: true,
    });

    // Update scroll position for first time
    storeScroll();
  },
};

export { scrollPositionInCss };

const closable: Directive = {
  mounted: function mounted(el, binding) {
    el.scrollOutsideEvent = function (event: Event) {
      if (!(el == event.target || (event.target != window && el.contains(event.target)))) {
        binding.value(event, el);
      }
    };

    el.resizeOutsideEvent = function (event: UIEvent) {
      if (!(el == event.target || (event.target != window && el.contains(event.target)))) {
        binding.value(event, el);
      }
    };

    el.clickOutsideEvent = function (event: MouseEvent) {
      if (!(el == event.target || el.contains(event.target))) {
        binding.value(event, el);
      }
    };

    window.requestAnimationFrame(() => {
      document.addEventListener("click", el.clickOutsideEvent);
      window.addEventListener("resize", el.resizeOutsideEvent, true);
      window.addEventListener("scroll", el.scrollOutsideEvent, true);
    });
  },
  unmounted: function unmounted(el) {
    document.removeEventListener("click", el.clickOutsideEvent);
    window.removeEventListener('resize', el.resizeOutsideEvent);
    window.removeEventListener('scroll', el.scrollOutsideEvent);
  },
};
export { closable };

const autogrow: Directive = {
  mounted: function (element: HTMLElement) {
    // If used in a component library such as buefy, a wrapper will be used on the component so check if a child is the textarea
    const el =
      element.tagName.toLowerCase() === "textarea"
        ? element
        : element.querySelector("textarea");

    const minRows = (el.dataset.rows ?? 1).toString();
    el.setAttribute("rows", minRows);

    const observe = function <T>(
      element: HTMLElement,
      event: string,
      handler: (e: unknown) => void
    ) {
      element.addEventListener(event, handler, false);
    };

    const resize = () => {
      el.style.height = "auto";
      const padding = parseFloat(
        getComputedStyle(el).getPropertyValue("padding-top")
      );
      el.style.height = el.scrollHeight + padding + "px";
    };

    // 0-timeout to get the already changed el
    const delayedResize = () => {
      window.setTimeout(resize, 0);
    };

    // When the textarea is being shown / hidden
    const respondToVisibility = (
      element: HTMLElement,
      callback: () => void
    ) => {
      const intersectionObserver = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.intersectionRatio > 0) {
              callback();
            }
          });
        },
        {
          root: document.documentElement,
        }
      );

      intersectionObserver.observe(element);
    };

    respondToVisibility(el, resize);
    observe(el, "change", resize);
    observe(el, "cut", delayedResize);
    observe(el, "paste", delayedResize);
    observe(el, "drop", delayedResize);
    observe(el, "input", resize);
    observe(el, "focus", resize);

    resize();
  },
};

export { autogrow };



const tokenize: Directive = {
  //usage v-tokenizable="{locations:[]}"
  mounted: (el: HTMLElement, binding, vnode: VNode) => {
    if (!el) { return; } // element may be gone
    const locations: StorageLocation[] = binding.value?.locations || getReadStorageLocations();
    const defaultNewStorageLocation: StorageLocation = binding.value?.defaultNewStorageLocation || null;

    // el.setAttribute("tokenize");

    const elToTokenize: HTMLInputElement | HTMLTextAreaElement = isWritableInput(el)
      ? el as HTMLInputElement | HTMLTextAreaElement
      : el.querySelector('input, textarea') as HTMLInputElement | HTMLTextAreaElement;
    if (!elToTokenize) { return; }

    const onClose = () => {
      focusElement(elToTokenize, false);
    }

    const newTokenSelected = (output: string) => {
      // it is not enough to update the input value => vue needs to know, so dispatch an event.
      const event = new Event('input', { bubbles: true });
      elToTokenize.value = output;
      elToTokenize.dispatchEvent(event);

      focusElement(elToTokenize, false);
    }

    elToTokenize.addEventListener('contextmenu', (event: MouseEvent) => {
      event.stopPropagation();
      event.preventDefault();
      onTokenizableInputContextMenu(elToTokenize, locations, defaultNewStorageLocation, newTokenSelected, onClose);
    });


    elToTokenize.addEventListener('input', (event: InputEvent) => {
      if (!event.data) { return; } // not typing, probably removing text
      onTokenizableInputChange(elToTokenize, locations, defaultNewStorageLocation, newTokenSelected, onClose);
    });

    elToTokenize.addEventListener('click', (event: MouseEvent) => {

      onTokenizableInputClick(elToTokenize, locations, defaultNewStorageLocation, newTokenSelected, onClose);
    });

  },
  unmounted: function unmounted() {
    // unmount event listeners etc
  },
};
export { tokenize };



const handle: Directive = {
  //usage v-tokenizable="{locations:[]}"
  mounted: (el: HTMLElement, binding, vnode: VNode) => {
    if (!el) { return; } // element may be gone
    //const locations: StorageLocation[] = binding.value?.locations || getReadStorageLocations();
    //const defaultNewStorageLocation: StorageLocation = binding.value?.defaultNewStorageLocation || null;

    // el.setAttribute("tokenize");
    const inputEl: HTMLInputElement | HTMLTextAreaElement = isWritableInput(el)
      ? el as HTMLInputElement | HTMLTextAreaElement
      : el.querySelector('input, textarea') as HTMLInputElement | HTMLTextAreaElement;
    if (!inputEl) { return; }

    const onClose = () => {
      focusElement(inputEl, false);
    }

    const newHandleSelected = (output: string) => {
      // it is not enough to update the input value => vue needs to know, so dispatch an event.
      const event = new Event('input', { bubbles: true });
      inputEl.value = output;
      inputEl.dispatchEvent(event);
      focusElement(inputEl, false);
    }

    inputEl.addEventListener('input', (event: InputEvent) => {
      if (!event.data) { return; } // not typing, probably removing text
      onHandleInputChange(inputEl, newHandleSelected, onClose);
    });

  },
  unmounted: function unmounted(el) {
    // unmount event listeners etc
  },
};
export { handle };





// Thanks Rik Schennink: https://pqina.nl/blog/applying-styles-based-on-the-user-scroll-position-with-smart-css/
const globalnozoom: Directive<HTMLElement> = {
  mounted: () => {

    const scrollCheck = true;
    const keyboardCheck = true;
    console.log("Zoom disabled");

    document.addEventListener("keydown", function (e: KeyboardEvent) {

      if (
        keyboardCheck &&
        e.ctrlKey && (
          e.code == "Minus" ||
          e.code == "Equal"
        )
      ) {
        e.preventDefault();
      }
    });

    document.addEventListener(
      "wheel",
      function (e) {
        if (scrollCheck && e.ctrlKey) {
          e.preventDefault();
        }
      },
      {
        passive: false
      }
    );


  },
}; export { globalnozoom };

