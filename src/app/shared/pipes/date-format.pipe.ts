import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'dateFormat',
  standalone: true
})
export class DateFormatPipe implements PipeTransform {
  transform(value: Date | string | null, format: 'short' | 'long' | 'relative' = 'short'): string {
    if (!value) return '';

    const date = value instanceof Date ? value : new Date(value);

    if (isNaN(date.getTime())) return '';

    switch (format) {
      case 'short':
        return date.toLocaleDateString('fr-FR');
      case 'long':
        return date.toLocaleDateString('fr-FR', {
          weekday: 'long',
          year: 'numeric',
          month: 'long',
          day: 'numeric'
        });
      case 'relative':
        return this.getRelativeTime(date);
      default:
        return date.toLocaleDateString('fr-FR');
    }
  }

  private getRelativeTime(date: Date): string {
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const seconds = Math.floor(diff / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);

    if (days > 0) return `il y a ${days} jour${days > 1 ? 's' : ''}`;
    if (hours > 0) return `il y a ${hours} heure${hours > 1 ? 's' : ''}`;
    if (minutes > 0) return `il y a ${minutes} minute${minutes > 1 ? 's' : ''}`;
    return "à l'instant";
  }
}
