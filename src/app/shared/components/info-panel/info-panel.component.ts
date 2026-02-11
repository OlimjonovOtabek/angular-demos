import { NgClass } from '@angular/common';
import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';

type BorderStyle = 'solid' | 'dashed';
type TextAlign = 'center' | 'none' | 'start' | 'end' | 'right' | 'left';

@Component({
  selector: 'app-info-panel',
  imports: [NgClass],
  templateUrl: './info-panel.component.html',
  styleUrl: './info-panel.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class InfoPanelComponent {
  borderStyle = input<BorderStyle>('solid');
  textPosition = input<TextAlign>('none');

  private readonly baseClass = 'rounded-lg border bg-card p-6 text-sm text-muted-foreground';
  private readonly border = {
    solid: 'border-border',
    dashed: 'border-border border-dashed',
  } as const;
  private readonly textAlign = {
    none: '',
    start: 'text-start',
    end: 'text-end',
    center: 'text-center',
    right: 'text-right',
    left: 'text-left',
  } as const;

  protected classes = computed(() =>
    [this.baseClass, [this.border[this.borderStyle()]], [this.textAlign[this.textPosition()]]].join(
      ' ',
    ),
  );
}
