export const formatPhoneNumber = (value: string): string => {
  if (!value) {
    return '';
  }

  const trimmed = value.trim();
  const hasPlusPrefix = trimmed.startsWith('+');
  const digits = trimmed.replace(/\D/g, '');

  if (!digits) {
    return hasPlusPrefix ? '+' : '';
  }

  let countryCode = '';
  let localDigits = digits;
  let extra = '';

  if (hasPlusPrefix) {
    if (digits.startsWith('1')) {
      if (digits.length === 1) {
        return '+1';
      }
      countryCode = '+1';
      localDigits = digits.slice(1);
    } else if (digits.length > 10) {
      const codeLength = digits.length - 10;
      countryCode = `+${digits.slice(0, codeLength)}`;
      localDigits = digits.slice(codeLength, codeLength + 10);
      extra = digits.slice(codeLength + 10);
    } else {
      return `+${digits}`;
    }
  } else if (digits.length === 11 && digits.startsWith('1')) {
    countryCode = '+1';
    localDigits = digits.slice(1);
  } else if (digits.length > 10) {
    localDigits = digits.slice(0, 10);
    extra = digits.slice(10);
  }

  if (localDigits.length === 0) {
    return countryCode || '';
  }

  if (localDigits.length <= 3) {
    const base = localDigits;
    const formatted = countryCode ? `${countryCode} ${base}` : base;
    return extra ? `${formatted} ${extra}` : formatted;
  }

  if (localDigits.length <= 6) {
    const area = localDigits.slice(0, 3);
    const subscriber = localDigits.slice(3);
    const base = `(${area}) ${subscriber}`;
    const formatted = countryCode ? `${countryCode} ${base}` : base;
    return extra ? `${formatted} ${extra}` : formatted;
  }

  const area = localDigits.slice(0, 3);
  const prefix = localDigits.slice(3, 6);
  const tail = localDigits.slice(6, 10);

  let base = `(${area}) ${prefix}`;
  if (tail) {
    base = `${base}-${tail}`;
  }

  const formatted = countryCode ? `${countryCode} ${base}` : base;
  return extra ? `${formatted} ${extra}` : formatted;
};
