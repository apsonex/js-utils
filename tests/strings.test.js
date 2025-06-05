import { describe, it, expect } from 'vitest';
import { str, Str } from '../src/strings';

describe('Str class', () => {
  it('should create an instance via factory', () => {
    const s = str('hello');
    expect(s).toBeInstanceOf(Str);
    expect(s.toString()).toBe('hello');
  });

  it('should handle after and afterLast correctly', () => {
    const s = str('foo/bar/baz');
    expect(s.after('/').toString()).toBe('bar/baz');
    expect(s.afterLast('/').toString()).toBe('baz');
  });

  it('should handle before and beforeLast correctly', () => {
    const s = str('foo/bar/baz');
    expect(s.before('/').toString()).toBe('foo');
    expect(s.beforeLast('/').toString()).toBe('foo/bar');
  });

  it('should check contains and containsAll', () => {
    const s = str('hello world');
    expect(s.contains('world')).toBe(true);
    expect(s.containsAll(['hello', 'world'])).toBe(true);
    expect(s.containsAll(['hello', 'mars'])).toBe(false);
  });

  it('should format case: camelCase, kebabCase, screamCase, snakeCase', () => {
    const s = str('Hello world-TEST');
    expect(s.camelCase().toString()).toBe('helloWorldTest');
    expect(s.kebabCase().toString()).toBe('hello-world-test');
    expect(s.screamCase().toString()).toBe('HELLO_WORLD_TEST');
    expect(s.snakeCase().toString()).toBe('hello_world_test');
  });

  it('should limit and add ... when needed', () => {
    const s = str('This is a long sentence.');
    expect(s.limit(10).toString()).toBe('This is a...');
  });

  it('should start and finish with specified string', () => {
    expect(str('api/users').startCase('api/').toString()).toBe('api/users');
    expect(str('users').startCase('api/').toString()).toBe('api/users');
    expect(str('hello.js').finish('.js').toString()).toBe('hello.js');
    expect(str('hello').finish('.js').toString()).toBe('hello.js');
  });

  it('should pluralize and singularize', () => {
    expect(str('cat').plural().toString()).toBe('cats');
  });

  it('should replace array correctly', () => {
    const result = str('Hello ? you ?').replaceArray('?', ['there', 'buddy']);
    expect(result.toString()).toBe('Hello there you buddy');
  });

  it('should replace first and last occurrence', () => {
    expect(str('foo bar foo').replaceFirst('foo', 'baz').toString()).toBe('baz bar foo');
    expect(str('foo bar foo').replaceLast('foo', 'baz').toString()).toBe('foo bar baz');
  });

  it('should slugify with default and custom separator', () => {
    expect(str('Hello World!').slug().toString()).toBe('hello-world');
    expect(str('Hello World!').slug('_').toString()).toBe('hello_world');
  });

  it('should convert to title case', () => {
    expect(str('this is a test').title().toString()).toBe('This Is A Test');
  });

  it('should limit words and append ...', () => {
    expect(str('one two three four').words(2).toString()).toBe('one two...');
  });

  it('should minify html content', () => {
    const html = `
      <div>
        <span>Text</span>
        <!-- comment -->
      </div>
    `;
    expect(str(html).minifyHtml()).toBe('<div><span>Text</span></div>');
  });

  it('should expose .toString and .valueOf', () => {
    const s = str('text');
    expect(s.toString()).toBe('text');
    expect(`${s}`).toBe('text'); // uses valueOf or toString implicitly
  });

  it('should throw if not enough replacements in replaceArray', () => {
    expect(() => str('Hello ? ?').replaceArray('?', ['only one'])).toThrow();
  });
});
