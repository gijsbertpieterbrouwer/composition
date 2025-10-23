/* eslint-disable @typescript-eslint/no-explicit-any */
// Thank you David Walsh: https://davidwalsh.name/javascript-debounce-function

export function getDebounced<Params>(
  callback: (args: Params) => void,
  timeout = 500
) {
  let handle: number | undefined;

  return function debounced(args: Params) {
    const later = () => {
      handle = undefined;
      callback(args);
    };

    clearTimeout(handle);
    handle = window.setTimeout(later, timeout);
  };
}

export type DebouncedToggle<Params> = (args: Params) => void;

export function getDebouncedToggle<Params>(
  callback: (params: Params) => void,
  timeout = 500
): DebouncedToggle<Params> {
  let handle: number | undefined;
  let changed = false;

  return function debounced(args: Params): void {
    changed = !changed;

    const later = () => {
      handle = undefined;

      if (!changed) {
        return;
      }
      callback(args);
    };

    clearTimeout(handle);
    handle = window.setTimeout(later, timeout);
  };
}

// Thanks Rik Schennink: https://pqina.nl/blog/applying-styles-based-on-the-user-scroll-position-with-smart-css/
export function animationDebounce(fn: (...args: any[]) => void) {
  // The debounce function receives our function as a parameter

  // This holds the requestAnimationFrame reference, so we can cancel it if we wish
  let frame: number;

  // The debounce function returns a new function that can receive a variable number of arguments
  return (...params: any[]) => {
    // If the frame variable has been defined, clear it now, and queue for next frame
    if (frame) {
      cancelAnimationFrame(frame);
    }

    // Queue our function call for the next frame
    frame = requestAnimationFrame(() => {
      // Call our function and pass any params we received
      fn(...params);
    });
  };
}
