export interface Breakpoints {
  [key: string]: (rect: DOMRectReadOnly) => boolean;
}

export const defaultHorizontalBreakpoints: Breakpoints = {
  small: (rect) => rect.width < 720,
  medium: (rect) => rect.width > 720 && rect.width <= 1080,
  "medium-and-above": (rect) => rect.width > 720,
  "medium-and-below": (rect) => rect.width <= 1080,
  large: (rect) => rect.width > 1080 && rect.width <= 1400,
  "large-and-above": (rect) => rect.width > 1080,
  "large-and-below": (rect) => rect.width <= 1400,
  "extra-large": (rect) => rect.width > 1400,
};

export function observeBreakpoints(element: Element, breakpoints: Breakpoints = defaultHorizontalBreakpoints) {
  const ro = new ResizeObserver((entries) => {
    for (const entry of entries) {
      Object.entries(breakpoints).forEach(([key, matcher]) => {
        if (matcher(entry.contentRect as DOMRectReadOnly)) {
          entry.target.classList.add(key);
        } else {
          entry.target.classList.remove(key);
        }
      });
    }
  });

  ro.observe(element);

  return () => { ro.disconnect(); };
}

export function observeSizeChange(element: Element, callback: (newSize: DOMRectReadOnly) => void) {
  const ro = new ResizeObserver((entries) => {
    for (const entry of entries) {
      callback(entry.contentRect as DOMRectReadOnly);
    }
  });

  ro.observe(element);
  
  return () => { ro.disconnect(); };
}
