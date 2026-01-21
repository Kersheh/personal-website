import { filterContent } from '../contentFilter';

describe('filterContent()', () => {
  it('should return clean messages unchanged', () => {
    const result = filterContent('Hello, how are you doing today?');
    expect(result.cleaned).toBe('Hello, how are you doing today?');
  });

  it('should censor profanity with asterisks', () => {
    const result = filterContent('What the fuck is this?');
    expect(result.cleaned).not.toContain('fuck');
    expect(result.cleaned).toContain('****');
  });

  it('should return a cleaned property', () => {
    const result = filterContent('Hello world');
    expect(result).toHaveProperty('cleaned');
    expect(typeof result.cleaned).toBe('string');
  });
});
