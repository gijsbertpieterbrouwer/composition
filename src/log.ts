import { AppVersion } from "./services/urls";
import { ColorsEnum } from "./TickApi";

const logDebug = process.env.VUE_APP_LOGDEBUG === "true";
const maxLogCounter = 500;
let logCounter = 0;
let accumulatedLogCounter = 0;
const recentLogs: CachedLog[] = [];




export interface CachedLog {
  message: string,
  date: Date,
  color: ColorsEnum,
}

export function getLogs() {
  return recentLogs || [];
}

function addLogToCache(message: string, color: ColorsEnum) {
  try {
    recentLogs.push({
      message: message,
      date: new Date(),
      color: color,
    });

    if (recentLogs.length > 100) {
      recentLogs.shift();
    }
  } catch (error) {
    // do nothing
  }


}

export function logo(message: string) {
  const style =
    "font-family: Inter, sans-serif; background-color: #efefef; color: #333333; font-weight: 600; font-size: 2em; padding:5px 200px; border-bottom: 2px dotted #333333;";
  console.log("%c" + message, style);
}

export function clearLog() {
  logCounter = 0;
  console.clear();
}

function cleanse() {
  if (logCounter > maxLogCounter) {
    clearLog();
    console.log(`log cleared, total of ${accumulatedLogCounter} logs`);
  }

  logCounter++;
  accumulatedLogCounter++;
}



export function debug(...args: string[]) {
  if (!logDebug) { return; }

  addLogToCache(args[0], ColorsEnum.Black);

  const messages = args.map((m) =>
    colorize(m, logColors.fg.black, logColors.bg.green)
  );

  cleanse();

  console.log(...messages);
}

export function debugCustom(message: string, fg?: string, bg?: string) {
  if (!logDebug) {
    return;
  }
  addLogToCache(message, ColorsEnum.Black);

  message = colorize(
    message,
    fg || logColors.fg.black,
    bg || logColors.bg.green
  );
  cleanse();

  console.log(message);
}

export function debugAction(...args: string[]) {
  if (!logDebug) {
    return;
  }
  addLogToCache(args[0], ColorsEnum.Purple);
  const messages = args.map((m) =>
    colorize(m, logColors.fg.black, logColors.bg.cyan)
  );

  cleanse();

  console.log(...messages);
}

export function debugApi(message: string) {
  if (!logDebug) {
    return;
  }
  addLogToCache(message, ColorsEnum.Blue);

  message = colorize(message, logColors.fg.white, logColors.bg.blue);

  cleanse();
  console.log(message);
}

export function debugAnalytics(message: string) {
  if (!logDebug) {
    return;
  }
  addLogToCache(message, ColorsEnum.Yellow);
  message = colorize(message, logColors.fg.black, logColors.bg.yellow);
  cleanse();

  console.log(message);
}

export function warn(message: string) {
  addLogToCache(message, ColorsEnum.Yellow);
  message = colorize(message, logColors.fg.black, logColors.bg.yellow);
  cleanse();

  console.warn(message);
}

export function log(message: string) {
  cleanse();
  addLogToCache(message, ColorsEnum.Black);
  console.log(message);
}

export function dir(obj: object) {
  cleanse();
  console.dir(obj);
}

export function error(message: string, obj?: unknown) {
  addLogToCache(message, ColorsEnum.Red);

  message = colorize(message, logColors.fg.red, logColors.bg.black);
  cleanse();

  console.error(message, obj);
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function colorize(input: any, fg: string, bg: string): any {
  if (typeof input != "string") { return input; }

  const message = input as string;
  const messagePartsToReplace = brackets(message, "[", "]", true, false);

  if (messagePartsToReplace.length) {
    const f = messagePartsToReplace[0];
    const fSplitted = f.split(":");

    if (fSplitted.length && fSplitted.length > 1) {
      const replaceValue =
        logColors.dim +
        fg +
        bg +
        " " +
        fSplitted[0].replace("[", "").trim() +
        " " +
        logColors.bg.white +
        logColors.fg.black +
        " " +
        fSplitted[1].replace("]", "").trim() +
        " " +
        logColors.reset;

      return message.replace(f, replaceValue + " ");
    } else {
      const formattedPrefix =
        fg + bg + f.replace("[", " ").replace("]", " ") + logColors.reset;

      return message.replace(f, formattedPrefix + " ");
    }
  }

  return message.trim();
}

export const logColors = {
  // eslint-disable-next-line no-control-regex
  uncolorize: (str: string) => str.replace(/\x1B\[\d+m/gi, ""),
  reset: "\x1b[0m",
  bright: "\x1b[1m",
  dim: "\x1b[2m", // bold
  italic: "\x1b[3m", // non-standard feature
  underscore: "\x1b[4m",
  blink: "\x1b[5m",
  reverse: "\x1b[7m",
  hidden: "\x1b[8m",

  fg: {
    black: "\x1b[30m",
    red: "\x1b[31m",
    green: "\x1b[32m",
    yellow: "\x1b[33m",
    blue: "\x1b[34m",
    magenta: "\x1b[35m",
    cyan: "\x1b[36m",
    white: "\x1b[37m",
    crimson: "\x1b[38m",
  },

  bg: {
    black: "\x1b[40m",
    red: "\x1b[41m",
    green: "\x1b[42m",
    yellow: "\x1b[43m",
    blue: "\x1b[44m",
    magenta: "\x1b[45m",
    cyan: "\x1b[46m",
    white: "\x1b[47m",
    crimson: "\x1b[48m",
  },
};

function brackets(
  s: string,
  b1: string,
  b2: string,
  include: boolean,
  recursive: boolean
): string[] {
  if (!s) {
    return [];
  }
  if (typeof s != "string") {
    return [];
  }

  b1 = b1 || "(";
  b2 = b2 || ")";
  const open = s.indexOf(b1);
  const close = s.indexOf(b2);
  let result: any[] = [];

  if (open >= 0 && close >= 0 && open < close) {
    let in_brackets;
    let count_open = 0;

    for (let i = 0; i < s.length; i++) {
      const ch = s[i];
      if (ch == b1) {
        count_open = count_open + 1;
      } else if (ch == b2) {
        count_open--;
        if (count_open === 0) {
          in_brackets = s.slice(s.indexOf(b1) + 1, i);

          const ib_open = in_brackets.indexOf(b1);
          const ib_close = in_brackets.indexOf(b2);
          if (
            recursive &&
            ib_open >= 0 &&
            ib_close >= 0 &&
            ib_open < ib_close
          ) {
            if (include) {
              result.push(
                b1 + in_brackets + b2,
                brackets(in_brackets, b1, b2, include, recursive)
              );
            } else {
              result.push(
                in_brackets,
                brackets(in_brackets, b1, b2, include, recursive)
              );
            }
          } else {
            if (include) {
              result.push(b1 + in_brackets + b2);
            } else {
              result.push(in_brackets);
            }
          }

          const residual = s.substr(i + 1);
          const r_open = residual.indexOf(b1);
          const r_close = residual.indexOf(b2);
          if (r_open >= 0 && r_close >= 0 && r_open < r_close) {
            result = result.concat(
              brackets(residual, b1, b2, include, recursive)
            );
          }
          break;
        }
      }
    }
  }

  return result;
}

export { logDebug };
log(`                                               
                                               
                                               
         █████████████████    ██████           
         ██████████████████   ████████         
         ███████████████████  ████████         
          ██████████████████  █████████        
            ████████████████  ████████         
                   █████████                   
                   █████████                   
                   █████████                   
                   █████████                   
                   █████████                   
                   █████████                   
                   █████████                   
                   █████████                   
                   █████████                   
                    ████████                   
                    ████████                   
                      ██████                   
                                               
                                               
                                               
                                               
                                               `)
//logo("TICK");
log(`Tick version: ${AppVersion()}`)



