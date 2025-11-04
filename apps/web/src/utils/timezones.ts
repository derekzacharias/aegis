type TimezoneOption = {
  value: string;
  label: string;
  offset: number;
};

const fallbackTimezones = [
  'UTC',
  'Africa/Johannesburg',
  'America/Anchorage',
  'America/Chicago',
  'America/Denver',
  'America/Los_Angeles',
  'America/New_York',
  'America/Phoenix',
  'America/Sao_Paulo',
  'Asia/Bangkok',
  'Asia/Dubai',
  'Asia/Kolkata',
  'Asia/Seoul',
  'Asia/Shanghai',
  'Asia/Singapore',
  'Asia/Tokyo',
  'Australia/Perth',
  'Australia/Sydney',
  'Europe/Amsterdam',
  'Europe/Athens',
  'Europe/Berlin',
  'Europe/Dublin',
  'Europe/London',
  'Europe/Madrid',
  'Europe/Moscow',
  'Europe/Paris',
  'Europe/Prague',
  'Europe/Rome',
  'Europe/Warsaw',
  'Pacific/Auckland'
];

type IntlWithSupportedValues = typeof Intl & {
  supportedValuesOf?: (key: 'timeZone') => string[];
};

const computeOffsetMinutes = (zone: string): number => {
  try {
    const formatter = new Intl.DateTimeFormat('en-US', {
      timeZone: zone,
      hour: '2-digit',
      minute: '2-digit',
      hour12: false,
      timeZoneName: 'shortOffset'
    });
    const parts = formatter.formatToParts(new Date());
    const offsetPart = parts.find((part) => part.type === 'timeZoneName');
    if (!offsetPart?.value) {
      return 0;
    }

    const match = offsetPart.value.match(/GMT(?<sign>[+-]?)(?<hours>\d{1,2})(?::?(?<minutes>\d{2}))?/);
    if (!match?.groups) {
      return 0;
    }

    const sign = match.groups.sign === '-' ? -1 : 1;
    const hours = Number.parseInt(match.groups.hours, 10);
    const minutes = match.groups.minutes ? Number.parseInt(match.groups.minutes, 10) : 0;
    return sign * (hours * 60 + minutes);
  } catch (error) {
    // eslint-disable-next-line no-console
    console.warn(`Failed to compute timezone offset for "${zone}"`, error);
    return 0;
  }
};

const formatOffsetLabel = (offsetMinutes: number): string => {
  const sign = offsetMinutes >= 0 ? '+' : '-';
  const absolute = Math.abs(offsetMinutes);
  const hours = Math.floor(absolute / 60)
    .toString()
    .padStart(2, '0');
  const minutes = (absolute % 60).toString().padStart(2, '0');
  return `GMT${sign}${hours}:${minutes}`;
};

let cachedOptions: Array<{ value: string; label: string }> | null = null;

export const getTimezoneOptions = (): Array<{ value: string; label: string }> => {
  if (cachedOptions) {
    return cachedOptions;
  }

  const intlWithSupport = Intl as IntlWithSupportedValues;
  let zones: string[] = [];

  if (typeof intlWithSupport.supportedValuesOf === 'function') {
    try {
      zones = intlWithSupport.supportedValuesOf('timeZone');
    } catch (error) {
      // eslint-disable-next-line no-console
      console.warn('Unable to load supported IANA time zones via Intl.supportedValuesOf', error);
    }
  }

  if (!zones.length) {
    zones = fallbackTimezones;
  }

  const options: TimezoneOption[] = zones.map((zone) => {
    const offset = computeOffsetMinutes(zone);
    const label = `${formatOffsetLabel(offset)} — ${zone.replace(/_/g, ' ')}`;
    return {
      value: zone,
      label,
      offset
    };
  });

  options.sort((a, b) => {
    if (a.offset === b.offset) {
      return a.value.localeCompare(b.value);
    }
    return a.offset - b.offset;
  });

  cachedOptions = options.map(({ value, label }) => ({ value, label }));
  return cachedOptions;
};

export const getDefaultTimezone = (): string => {
  try {
    return Intl.DateTimeFormat().resolvedOptions().timeZone;
  } catch {
    return 'UTC';
  }
};
