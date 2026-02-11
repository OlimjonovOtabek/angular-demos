import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'optionLetter',
  standalone: true,
})
export class OptionLetterPipe implements PipeTransform {
  transform(index: number): string {
    if (index < 0) {
      return '';
    }

    return String.fromCharCode(65 + Math.floor(index));
  }
}
