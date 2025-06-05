/**
 * A chainable, promise-aware pipeline processor.
 * ES6 version of: https://github.com/kamranahmedse/pipeline-js
 *
 * @example
 * const result = await new Pipeline()
 *   .pipe([x => x + 1, x => Promise.resolve(x * 2)])
 *   .process(5); // 12
 */
class Pipeline {
  /**
   * Initialize a new pipeline with optional stages.
   * @param {Array<Function|any>} presetStages
   */
  constructor(presetStages = []) {
    /**
     * Array of stages (functions or literals).
     * @type {Array<Function|any>}
     */
    this.stages = presetStages;
  }

  /**
   * Add one or multiple stages to the pipeline.
   * @param {Function|any|Array<Function|any>} stages
   * @returns {Pipeline}
   */
  pipe(stages) {
    if (Array.isArray(stages)) {
      stages.forEach(stage => this.stages.push(stage));
    } else {
      this.stages.push(stages);
    }
    return this;
  }

  /**
   * Remove all stages from the pipeline.
   * @returns {Pipeline}
   */
  empty() {
    this.stages = [];
    return this;
  }

  /**
   * Run the pipeline with the provided input.
   * Supports sync and async (Promise-based) stages.
   * @param {*} input
   * @returns {*|Promise<any>}
   */
  process(input) {
    if (this.stages.length === 0) {
      return input;
    }

    let result = input;

    for (const stage of this.stages) {
      const isPromise = result && typeof result.then === 'function';

      if (isPromise) {
        result = result.then(stage);
      } else {
        result = typeof stage === 'function' ? stage(result) : stage;
      }
    }

    return result;
  }
}

export default Pipeline;
