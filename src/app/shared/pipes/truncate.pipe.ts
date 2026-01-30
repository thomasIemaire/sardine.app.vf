import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'truncate',
  standalone: true
})
export class TruncatePipe implements PipeTransform {
  transform(value: string | null, limit = 100, suffix = '...'): string {
    if (!value) return '';
    if (value.length <= limit) return value;
    return value.substring(0, limit).trim() + suffix;
  }
}
