/* eslint-disable @typescript-eslint/no-explicit-any */
import useUserStore from '@/store/user';
import { format, formatDistanceToNow, isValid, parseISO } from 'date-fns';
const serverDateFormat = 'yyyy-MM-dd'

export function isValidDate(input: any) {
  if (typeof (input) != "string") { return false; }

  if (!input.endsWith("Z")) { input = input + "Z" }
  const parsed = parseISO(input);

  return isValid(parsed)
}

export function serverDateToInputValue(input: any) {
  if (!input) { return null; }
  // input is in format:  "2022-11-04T18:09:22.2406416"

  // input needs  YYYY-MM-DD as format
  return format(ensureIsDate(input), serverDateFormat);
}

export function inputValueToServerDate(input: string): any {
  if (!input) { return null; }

  // input is in format  YYYY-MM-DD 
  return format(ensureIsDate(input), serverDateFormat);
}

export function inputValueToServerDateTicks(input: string): any {
  if (!input) { return null; }

  // input is in format  YYYY-MM-DD 
  const date = ensureIsDate(input);
  return dateToTicks(date);
}


export function ensureIsDate(input: string | Date | undefined): Date {
  if (input == null) { return new Date(); }

  if (typeof (input) == "string") {
    if (!input.endsWith("Z")) { input = input + "Z" }

    return parseISO(input); // input is UTC  Z => means it is in utc
  } else {
    return input;
  }
}

export function toMinuteOfHour(input: Date | string) {
  // used in charting
  const date = ensureIsDate(input);

  if (date.getMinutes() == 0) {
    return format(date, "HH:mm");
  } else {
    return format(date, "mm");

  }
}

export function getFormattingForTimespane(from: string | Date, to: string | Date): string {
  if (!from || !to) { return "MMM dd, yyyy HH:mm:ss"; }

  const fromDate = ensureIsDate(from);
  const toDate = ensureIsDate(to);

  const distance = toDate.getTime() - fromDate.getTime()

  const m = GetMinuteInMs();
  const halfHourMs = m * 30;
  const hourlyMiliseconds = 3600000;
  const dailyMs = 86400000;

  if (distance < halfHourMs) {
    return "HH:mm:ss";
  }

  if (distance < (hourlyMiliseconds * 2)) {
    return "HH:mm";
  }

  if (distance < (hourlyMiliseconds * 2)) {
    return "HH:mm";
  }

  if (distance <= dailyMs) {
    return "HH:mm";
  }

  return "MMM dd, yyyy HH:mm";

}

export function toDate(input: Date | string | undefined) {
  // used in charting
  const date = ensureIsDate(input ?? "");
  return format(date, "MMM dd yyyy");

}

export function displayDistanceToNowDate(input: Date | string): string {
  if (!input) { return ""; }
  const date = ensureIsDate(input);

  return formatDistanceToNow(date, {
    addSuffix: true,
    locale: useUserStore().locale,
    includeSeconds: true,
  });
}

export function displayDate(input: Date | string | undefined, onlyDatePart?: boolean): string {
  if (!input) { return ""; }
  const date = ensureIsDate(input);

  const formatting = onlyDatePart ? 'MMM dd, yyyy' : 'MMM dd, yyyy HH:mm:ss';

  return format(date, formatting, {
    locale: useUserStore().locale
  });
}

export function displayDateWithFormat(input: Date | string, formatting?: string): string {
  if (!input) { return ""; }
  const date = ensureIsDate(input);

  formatting = formatting || 'MMM dd, yyyy HH:mm:ss';

  return format(date, formatting, {
    locale: useUserStore().locale
  });
}


export function dateToTicks(input: Date | string) {
  const date = ensureIsDate(input);
  return ((date.getTime() * 10000) + 621355968000000000);
}


export interface TimeSpan {
  value: string;
  unit: string;
}

export function getTimespan(msDuration: number): TimeSpan {
  if (!msDuration) {
    return {
      unit: "",
      value: "",
    }
  }

  const d = (msDuration / 1000 / 60 / 60 / 24);
  const h = Math.floor(msDuration / 1000 / 60 / 60);
  const m = Math.floor((msDuration / 1000 / 60 / 60 - h) * 60);
  const s = Math.floor(((msDuration / 1000 / 60 / 60 - h) * 60 - m) * 60);


  // To get time format 00:00:00
  const seconds: string = s < 10 ? `0${s}` : `${s}`;
  const minutes: string = m < 10 ? `0${m}` : `${m}`;
  const hours: string = h < 10 ? `0${h}` : `${h}`;


  if (d >= 1) {
    return {
      value: `${d.toFixed(1)}`,
      unit: "Days",
    }
  }


  if (h) {
    return {
      value: `${h}:${minutes}`,
      unit: "Hours",
    }
  }

  if (m) {
    return {
      value: `${m}:${seconds}`,
      unit: "Min",
    }
  }

  if (s) {
    return {
      value: `${s}`,
      unit: "Sec",
    }
  }

  if (msDuration < 1000) {
    return {
      value: `${(msDuration).toFixed(2)}`,
      unit: "ms",
    }
  }


  return {
    value: `${hours}h ${minutes}m ${seconds}s`,
    unit: "",
  };

}


export function GetMinuteInMs() {
  return 60 * 1000;
}


export function dateCalculateFromNow(days: number, months: number, years: number) {
  const date = new Date();
  date.setDate(date.getDate() + (days || 0));
  date.setMonth(date.getMonth() + (months || 0));
  date.setFullYear(date.getFullYear() + (years || 0));
  return date;
}