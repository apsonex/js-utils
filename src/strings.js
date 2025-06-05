import slugify from 'slugify';
import plural from 'plural';
import { camelCase } from 'lodash';

export class Str {
    constructor(value) {
        this.value = value.toString();
    }

    static of(value) {
        return new Str(value);
    }

    explode(delimiter = ' ') {
        return this.value.split(delimiter);
    }

    after(search) {
        const index = this.value.indexOf(search);
        return Str.of(index === -1 ? this.value : this.value.substring(index + search.length));
    }

    afterLast(search) {
        const index = this.value.lastIndexOf(search);
        return Str.of(index === -1 ? this.value : this.value.substring(index + search.length));
    }

    before(search) {
        const index = this.value.indexOf(search);
        return Str.of(index === -1 ? this.value : this.value.substring(0, index));
    }

    beforeLast(search) {
        const index = this.value.lastIndexOf(search);
        return Str.of(index === -1 ? this.value : this.value.substring(0, index));
    }

    contains(substring) {
        return this.value.includes(substring);
    }

    containsAll(substrings) {
        return substrings.every(substr => this.value.includes(substr));
    }

    endsWith(suffix) {
        return this.value.endsWith(suffix);
    }

    finish(ending) {
        return this.endsWith(ending) ? this : Str.of(this.value + ending);
    }

    is(string) {
        return this.value === string;
    }

    camelCase() {
        return Str.of(camelCase(this.value));
    }

    kebabCase() {
        return Str.of(slugify(this.value, { lower: true }));
    }

    screamCase() {
        return this.value.replace(/([a-z0-9])([A-Z])/g, '$1_$2').toUpperCase();
    }

    snakeCase() {
        return Str.of(slugify(this.value.toLowerCase(), { replacement: '_', lower: true }));
    }

    startCase(prefix) {
        return this.value.startsWith(prefix) ? this : Str.of(prefix + this.value);
    }

    limit(limit) {
        const trimmed = this.value.substring(0, limit).trimEnd();
        return Str.of(this.value.length > limit ? `${trimmed}...` : trimmed);
    }

    plural(count = 2) {
        return Str.of(
            plural(this.value, count)
        );
    }

    replaceArray(search, replacements) {
        const segments = this.value.split(search);
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
        const index = this.value.indexOf(search);
        return index === -1
            ? this
            : Str.of(this.value.substring(0, index) + replace + this.value.substring(index + search.length));
    }

    replaceLast(search, replace) {
        const index = this.value.lastIndexOf(search);
        return index === -1
            ? this
            : Str.of(this.value.substring(0, index) + replace + this.value.substring(index + search.length));
    }

    singular() {
        return Str.of(pluralize.singular(this.value));
    }

    slug(separator = '-') {
        return Str.of(slugify(this.value, { lower: true, replacement: separator }));
    }

    startsWith(prefix) {
        return this.value.startsWith(prefix);
    }

    title() {
        return Str.of(
            this.value
                .split(' ')
                .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
                .join(' ')
        );
    }

    words(limit) {
        const words = this.value.split(' ');
        const sliced = words.slice(0, limit);
        return Str.of(words.length > limit ? sliced.join(' ') + '...' : this.value);
    }

    minifyHtml() {
        return this.value
            .replace(/\s{2,}/g, ' ')       // Replace multiple spaces with a single space
            .replace(/\n/g, '')            // Remove newlines
            .replace(/>\s+</g, '><')       // Remove spaces between tags
            .replace(/<!--.*?-->/g, '');
    }

    toString() {
        return this.value;
    }

    valueOf() {
        return this.value;
    }
}

export const str = (val) => Str.of(val);
