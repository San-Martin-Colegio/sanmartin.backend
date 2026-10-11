import { ArgumentMetadata, Injectable, PipeTransform } from '@nestjs/common';
import sanitizeHtml = require('sanitize-html');

const SENSITIVE_KEYS = new Set(['password', 'currentPassword', 'newPassword']);

@Injectable()
export class SanitizeInputPipe implements PipeTransform {
  transform(value: unknown, _metadata: ArgumentMetadata): unknown {
    return this.sanitize(value);
  }

  private sanitize(value: unknown, key?: string): unknown {
    if (typeof value === 'string') {
      if (key && SENSITIVE_KEYS.has(key)) return value;
      return sanitizeHtml(value, { allowedTags: [], allowedAttributes: {} })
        .replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/g, '')
        .trim();
    }

    if (Array.isArray(value)) {
      return value.map((item) => this.sanitize(item));
    }

    if (value && typeof value === 'object') {
      return Object.fromEntries(
        Object.entries(value as Record<string, unknown>).map(([entryKey, entryValue]) => [
          entryKey,
          this.sanitize(entryValue, entryKey),
        ]),
      );
    }

    return value;
  }
}
