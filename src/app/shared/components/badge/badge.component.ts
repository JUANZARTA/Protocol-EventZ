import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

export type TonoBadge = 'neutro' | 'dorado' | 'ok' | 'alerta';

const CLASES: Record<TonoBadge, string> = {
  neutro: 'bg-white/10 text-white/70',
  dorado: 'bg-gold-400/15 text-gold-300 border border-gold-400/30',
  ok: 'bg-emerald-500/15 text-emerald-300',
  alerta: 'bg-red-500/15 text-red-300',
};

@Component({
  selector: 'app-badge',
  standalone: true,
  imports: [CommonModule],
  template: `<span class="rounded-full px-2.5 py-1 text-[11px] font-medium" [ngClass]="CLASES[tono]">{{ texto }}</span>`,
})
export class BadgeComponent {
  @Input() texto = '';
  @Input() tono: TonoBadge = 'neutro';
  protected readonly CLASES = CLASES;
}
