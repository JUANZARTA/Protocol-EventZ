import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-modal',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div *ngIf="abierto" class="fixed inset-0 z-50 flex items-end justify-center bg-black/70 sm:items-center">
      <div class="w-full max-w-md rounded-t-2xl border border-white/10 bg-zinc-950 p-5 sm:rounded-2xl">
        <div class="mb-3 flex items-center justify-between">
          <h2 class="text-base font-semibold text-gold-300">{{ titulo }}</h2>
          <button (click)="cerrar.emit()" class="text-white/50 hover:text-white">✕</button>
        </div>
        <ng-content />
      </div>
    </div>
  `,
})
export class ModalComponent {
  @Input() abierto = false;
  @Input() titulo = '';
  @Output() cerrar = new EventEmitter<void>();
}
