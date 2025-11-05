const DEFAULT_STOP_WORDS = new Set<string>([
  'a',
  'an',
  'and',
  'are',
  'as',
  'at',
  'be',
  'for',
  'from',
  'has',
  'in',
  'is',
  'it',
  'of',
  'on',
  'or',
  'that',
  'the',
  'to',
  'with'
]);

export interface CrosswalkControl {
  id: string;
  frameworkId: string;
  title: string;
  description?: string | null;
  family?: string | null;
}

export interface CrosswalkCandidate {
  sourceControlId: string;
  targetControlId: string;
  targetFrameworkId: string;
  confidence: number;
  sharedTerms: string[];
}

interface TokenProfile {
  control: CrosswalkControl;
  tokens: string[];
  termSet: Set<string>;
  vector: Map<string, number>;
}

export interface CrosswalkOptions {
  maxSuggestionsPerControl?: number;
  minConfidence?: number;
  stopWords?: Set<string>;
}

const DEFAULT_OPTIONS: Required<CrosswalkOptions> = {
  maxSuggestionsPerControl: 3,
  minConfidence: 0.35,
  stopWords: DEFAULT_STOP_WORDS
};

const intersection = (left: Set<string>, right: Set<string>): string[] => {
  const [smaller, larger] = left.size < right.size ? [left, right] : [right, left];
  const matches: string[] = [];

  for (const term of smaller) {
    if (larger.has(term)) {
      matches.push(term);
    }
  }

  return matches;
};

const cosine = (left: Map<string, number>, right: Map<string, number>): number => {
  let dotProduct = 0;
  let leftMagnitudeSquared = 0;
  let rightMagnitudeSquared = 0;

  for (const value of left.values()) {
    leftMagnitudeSquared += value * value;
  }

  for (const value of right.values()) {
    rightMagnitudeSquared += value * value;
  }

  const smaller = left.size < right.size ? left : right;
  const larger = smaller === left ? right : left;

  for (const [term, value] of smaller.entries()) {
    const other = larger.get(term);
    if (other) {
      dotProduct += value * other;
    }
  }

  const denominator = Math.sqrt(leftMagnitudeSquared) * Math.sqrt(rightMagnitudeSquared);

  if (denominator === 0) {
    return 0;
  }

  return dotProduct / denominator;
};

const buildTokenProfile = (
  control: CrosswalkControl,
  stopWords: Set<string>
): TokenProfile => {
  const rawText = [control.id, control.title, control.description, control.family]
    .filter(Boolean)
    .join(' ')
    .toLowerCase();

  const tokens = rawText
    .split(/[^a-z0-9]+/g)
    .map((token) => token.trim())
    .filter((token) => token.length > 2 && !stopWords.has(token));

  const vector = new Map<string, number>();

  for (const token of tokens) {
    vector.set(token, (vector.get(token) ?? 0) + 1);
  }

  return {
    control,
    tokens,
    termSet: new Set(tokens),
    vector
  };
};

export const generateCrosswalkCandidates = (
  sourceControls: CrosswalkControl[],
  targetControls: CrosswalkControl[],
  options: CrosswalkOptions = {}
): CrosswalkCandidate[] => {
  if (!sourceControls.length || !targetControls.length) {
    return [];
  }

  const mergedOptions: Required<CrosswalkOptions> = {
    ...DEFAULT_OPTIONS,
    ...options,
    stopWords: options.stopWords ?? DEFAULT_STOP_WORDS
  };

  const sourceProfiles = sourceControls
    .map((control) => buildTokenProfile(control, mergedOptions.stopWords))
    .filter((profile): profile is TokenProfile => profile.tokens.length > 0);

  const targetProfiles = targetControls
    .map((control) => buildTokenProfile(control, mergedOptions.stopWords))
    .filter((profile): profile is TokenProfile => profile.tokens.length > 0);

  if (!sourceProfiles.length || !targetProfiles.length) {
    return [];
  }

  const candidates: CrosswalkCandidate[] = [];

  for (const source of sourceProfiles) {
    const ranking: Array<{
      profile: TokenProfile;
      confidence: number;
      sharedTerms: string[];
    }> = [];

    for (const target of targetProfiles) {
      if (target.control.id === source.control.id) {
        continue;
      }

      const confidence = cosine(source.vector, target.vector);

      if (confidence < mergedOptions.minConfidence) {
        continue;
      }

      const sharedTerms = intersection(source.termSet, target.termSet)
        .slice(0, 10)
        .sort((a, b) => a.localeCompare(b));

      ranking.push({
        profile: target,
        confidence,
        sharedTerms
      });
    }

    ranking.sort((left, right) => right.confidence - left.confidence);

    for (const entry of ranking.slice(0, mergedOptions.maxSuggestionsPerControl)) {
      candidates.push({
        sourceControlId: source.control.id,
        targetControlId: entry.profile.control.id,
        targetFrameworkId: entry.profile.control.frameworkId,
        confidence: Number(entry.confidence.toFixed(4)),
        sharedTerms: entry.sharedTerms
      });
    }
  }

  return candidates;
};
