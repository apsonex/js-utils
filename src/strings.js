import slugify from 'slugify';
import plural from 'plural';
import { camelCase, snakeCase } from 'lodash';

export class Str {
    constructor(value) {
        this.value = value.toString();
    }

    static of(value) {
        return new Str(value);
    }

    resolveValue() {
        return typeof this.value === 'string' ? this.value : '';
    }

    explode(delimiter = ' ') {
        return this.value.split(delimiter);
    }

    after(search) {
        const index = this.resolveValue().indexOf(search);
        return Str.of(index === -1 ? this.resolveValue() : this.resolveValue().substring(index + search.length));
    }

    afterLast(search) {
        const index = this.resolveValue().lastIndexOf(search);
        return Str.of(index === -1 ? this.resolveValue() : this.resolveValue().substring(index + search.length));
    }

    before(search) {
        const index = this.resolveValue().indexOf(search);
        return Str.of(index === -1 ? this.resolveValue() : this.resolveValue().substring(0, index));
    }

    beforeLast(search) {
        const index = this.resolveValue().lastIndexOf(search);
        return Str.of(index === -1 ? this.resolveValue() : this.resolveValue().substring(0, index));
    }

    contains(substring) {
        return this.resolveValue().includes(substring);
    }

    containsAll(substrings) {
        return substrings.every(substr => this.resolveValue().includes(substr));
    }

    endsWith(suffix) {
        return this.resolveValue().endsWith(suffix);
    }

    finish(ending) {
        return this.endsWith(ending) ? this : Str.of(this.resolveValue() + ending);
    }

    is(string) {
        return this.resolveValue() === string;
    }

    camelCase() {
        return Str.of(camelCase(this.resolveValue()));
    }

    kebabCase() {
        return Str.of(slugify(this.resolveValue(), { lower: true }));
    }

    screamCase() {
        return Str.of(
            this.resolveValue()
                .toUpperCase()
                .replace(/[^A-Z0-9]+/g, "_")  // Replace non-alphanumerics with underscores
                .replace(/_+/g, "_")          // Collapse multiple underscores
                .replace(/^_+|_+$/g, "")     // Trim leading/trailing underscores
        );
    }

    sentenseCase() {
        return Str.of(
            this.resolveValue()
                .toUpperCase()
                .replace(/[^A-Z0-9]+/g, "_")  // Replace non-alphanumerics with underscores
                .replace(/_+/g, "_") // Collapse multiple underscores
                .replace(/^_+|_+$/g, "") // Trim leading/trailing underscores
                .toLowerCase()
                .replace(/_/ig, ' ')
                .replace(/\b\w/g, char => char.toUpperCase())
        );
    }

    snakeCase() {
        return Str.of(snakeCase(this.resolveValue()));
    }

    startCase(prefix) {
        return this.resolveValue().startsWith(prefix) ? this : Str.of(prefix + this.resolveValue());
    }

    limit(limit) {
        const trimmed = this.resolveValue().substring(0, limit).trimEnd();
        return Str.of(this.resolveValue().length > limit ? `${trimmed}...` : trimmed);
    }

    plural(count = 2) {
        return Str.of(
            plural(this.resolveValue(), count)
        );
    }

    replaceArray(search, replacements) {
        const segments = this.resolveValue().split(search);
        if (segments.length - 1 > replacements.length) {
            throw new Error('Not enough replacements to replace all occurrences.');
        }

        let result = '';
        for (let i = 0; i < segments.length - 1; i++) {
            result += segments[i] + replacements[i];
        }
        result += segments[segments.length - 1];

        return Str.of(result);
    }

    replaceFirst(search, replace) {
        const index = this.resolveValue().indexOf(search);
        return index === -1
            ? this
            : Str.of(this.resolveValue().substring(0, index) + replace + this.resolveValue().substring(index + search.length));
    }

    replaceLast(search, replace) {
        const index = this.resolveValue().lastIndexOf(search);
        return index === -1
            ? this
            : Str.of(this.resolveValue().substring(0, index) + replace + this.resolveValue().substring(index + search.length));
    }

    singular() {
        return Str.of(pluralize.singular(this.resolveValue()));
    }

    slug(separator = '-') {
        return Str.of(slugify(this.resolveValue(), { lower: true, replacement: separator, strict: true }));
    }

    startsWith(prefix) {
        return this.resolveValue().startsWith(prefix);
    }

    title() {
        return Str.of(
            this.resolveValue()
                .split(' ')
                .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
                .join(' ')
        );
    }

    words(limit) {
        const words = this.resolveValue().split(' ');
        const sliced = words.slice(0, limit);
        return Str.of(words.length > limit ? sliced.join(' ') + '...' : this.resolveValue());
    }

    minifyHtml() {
        return this.resolveValue()
            .replace(/\s{2,}/g, ' ')       // Replace multiple spaces with a single space
            .replace(/\n/g, '')            // Remove newlines
            .replace(/>\s+</g, '><')       // Remove spaces between tags
            .replace(/<!--.*?-->/g, '')
            .trim();
    }

    toString() {
        return this.resolveValue();
    }

    valueOf() {
        return this.resolveValue();
    }
}

export const str = (val) => Str.of(val);
