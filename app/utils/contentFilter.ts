import {
  DataSet,
  RegExpMatcher,
  TextCensor,
  englishDataset,
  englishRecommendedTransformers,
  fixedCharCensorStrategy,
  pattern
} from 'obscenity';

// decode base64 encoded terms at runtime
const decode = (encoded: string): string =>
  Buffer.from(encoded, 'base64').toString('utf-8');

// base64 encoded targeted groups
const ENCODED_TARGETED_GROUPS =
  'amV3cyxibGFja3Msd2hpdGVzLG11c2xpbXMsY2hyaXN0aWFucyxnYXlzLGxlc2JpYW5zLHRyYW5zLHdvbWVuLG1lbixtZXhpY2FucyxpbW1pZ3JhbnRzLHJlZnVnZWVzLGFzaWFucyxhcmFicyxkaXNhYmxlZCxob21lbGVzcw==';

// base64 encoded slur patterns: [label, pattern1, pattern2, ...]
// format: label:pattern1,pattern2,pattern3|label:pattern1,pattern2
const ENCODED_SLURS =
  'bi13b3JkOm5pZyxuaWdnLG5pZ2dhLG5pZ2dlcixtZWdybw==|' +
  'ZmFnZ290OmZhZyxmYWdnb3QsZmFnZw==|' +
  'ZHlrZTpkeWtl|' +
  'dHJhbm55OnRyYW5ueSx0cmFubmll|' +
  'a2lrZTpraWtlLGt5a2U=|' +
  'cmV0YXJkOnJldGFyZA==';

// base64 encoded violent action verbs and phrases
const ENCODED_VIOLENT_VERBS =
  'a2lsbCxnYXMsaGFuZyxidXJuLHNob290LGV4dGVybWluYXRl';
const ENCODED_SHOULD_ACTIONS = 'ZGllLGJ1cm4saGFuZw==';
const ENCODED_DEATH_TO = 'ZGVhdGggdG8=';

// build regex for violent phrases targeting groups
const buildViolentPhrasePattern = () => {
  const groupPattern = decode(ENCODED_TARGETED_GROUPS).split(',').join('|');
  const violentVerbs = decode(ENCODED_VIOLENT_VERBS).split(',');

  const allPatterns = [
    ...violentVerbs.map(
      (verb) => `${verb}\\s+(the\\s+|all\\s+)?(${groupPattern})`
    ),
    `(${groupPattern})\\s+should\\s+(${decode(ENCODED_SHOULD_ACTIONS).split(',').join('|')})`,
    `${decode(ENCODED_DEATH_TO)}\\s+(the\\s+)?(${groupPattern})`
  ];

  return new RegExp(allPatterns.join('|'), 'gi');
};

const violentPhrasePattern = buildViolentPhrasePattern();

const buildExtendedDataset = () =>
  ENCODED_SLURS.split('|')
    .map((encodedGroup) => {
      const decoded = decode(encodedGroup);
      const [label, patternsStr] = decoded.split(':');
      return { label, patterns: patternsStr.split(',') };
    })
    .reduce(
      (dataset, { label, patterns }) =>
        dataset.addPhrase((phrase) => {
          phrase.setMetadata({ originalWord: label });
          patterns.forEach((p) => phrase.addPattern(pattern`${p}`));
          return phrase;
        }),
      new DataSet<{ originalWord: string }>().addAll(englishDataset)
    );

const extendedDataset = buildExtendedDataset();

const matcher = new RegExpMatcher({
  ...extendedDataset.build(),
  ...englishRecommendedTransformers
});

const censor = new TextCensor().setStrategy(fixedCharCensorStrategy('*'));

const censorViolentPhrases = (text: string): string =>
  text.replace(violentPhrasePattern, (match) => '*'.repeat(match.length));

export const filterContent = (
  message: string
): {
  cleaned: string;
} => ({
  cleaned: censorViolentPhrases(
    censor.applyTo(message, matcher.getAllMatches(message))
  )
});
