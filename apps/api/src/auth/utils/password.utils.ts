export type PasswordComplexityRule = 'upper' | 'lower' | 'digit' | 'symbol';

const RULE_DETAILS: Record<PasswordComplexityRule, { test: RegExp; description: string }> = {
  lower: {
    test: /[a-z]/,
    description: 'one lowercase letter'
  },
  upper: {
    test: /[A-Z]/,
    description: 'one uppercase letter'
  },
  digit: {
    test: /\d/,
    description: 'one number'
  },
  symbol: {
    test: /[^A-Za-z0-9]/,
    description: 'one special character'
  }
};

export interface PasswordComplexityResult {
  valid: boolean;
  missing: PasswordComplexityRule[];
}

export const DEFAULT_PASSWORD_COMPLEXITY: PasswordComplexityRule[] = ['lower', 'upper', 'digit', 'symbol'];

export function validatePasswordComplexity(
  candidate: string,
  rules: PasswordComplexityRule[]
): PasswordComplexityResult {
  const uniqueRules = Array.from(new Set(rules));
  const missing = uniqueRules.filter((rule) => {
    const detail = RULE_DETAILS[rule];
    return detail ? !detail.test.test(candidate) : false;
  });

  return {
    valid: missing.length === 0,
    missing
  };
}

export function describeMissingRules(rules: PasswordComplexityRule[]): string {
  if (!rules.length) {
    return '';
  }

  const descriptions = rules
    .map((rule) => RULE_DETAILS[rule]?.description)
    .filter((value): value is string => Boolean(value));

  if (!descriptions.length) {
    return '';
  }

  if (descriptions.length === 1) {
    return descriptions[0]!;
  }

  const [last, ...rest] = descriptions.reverse();
  return `${rest.reverse().join(', ')} and ${last}`;
}

export function getPasswordPolicyError(
  candidate: string,
  minLength: number,
  rules: PasswordComplexityRule[]
): string | null {
  if (candidate.length < minLength) {
    return `Password must be at least ${minLength} characters long`;
  }

  const evaluation = validatePasswordComplexity(candidate, rules);

  if (evaluation.valid) {
    return null;
  }

  const description = describeMissingRules(evaluation.missing);
  if (!description) {
    return 'Password does not meet complexity requirements';
  }

  return `Password must include at least ${description}`;
}
