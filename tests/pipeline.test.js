import { describe, it, expect, beforeEach } from 'vitest';
import Pipeline from '../src/pipeline';

describe('Pipeline', () => {
  let pipeline;

  beforeEach(() => {
    pipeline = new Pipeline();
  });

  it('should return input as-is when no stages are defined', async () => {
    expect(await pipeline.process(10)).toBe(10);
  });

  it('should apply a single sync stage', async () => {
    pipeline.pipe(x => x + 5);
    expect(await pipeline.process(10)).toBe(15);
  });

  it('should apply multiple sync stages in order', async () => {
    pipeline.pipe([x => x + 2, x => x * 3]);
    expect(await pipeline.process(4)).toBe(18); // (4 + 2) * 3
  });

  it('should support async stages (Promises)', async () => {
    pipeline.pipe([
      x => Promise.resolve(x + 1),
      x => x * 10,
    ]);
    expect(await pipeline.process(2)).toBe(30); // (2 + 1) * 10
  });

  it('should support mix of sync and async stages', async () => {
    pipeline.pipe([
      x => x + 1,
      x => Promise.resolve(x * 2),
      x => x - 3,
    ]);
    expect(await pipeline.process(3)).toBe(5); // (((3+1)*2) -3)
  });

  it('should handle literal values as stages', async () => {
    pipeline.pipe(['ignored']);
    expect(await pipeline.process('start')).toBe('ignored');
  });

  it('should chain .pipe calls', async () => {
    pipeline
      .pipe(x => x + 1)
      .pipe(x => x * 2);
    expect(await pipeline.process(2)).toBe(6); // (2 + 1) * 2
  });

  it('should reset stages with .empty()', async () => {
    pipeline.pipe(x => x + 10);
    pipeline.empty();
    expect(await pipeline.process(5)).toBe(5);
  });

  it('should initialize with preset stages', async () => {
    const p = new Pipeline([x => x * 3]);
    p.pipe(x => x + 1);
    expect(await p.process(4)).toBe(13); // (4 * 3) + 1
  });
});
