import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-header',
  standalone: true,
  template: `
    <header class="sticky top-0 z-10 flex items-center justify-between border-b border-white/10 bg-black/90 px-4 py-3 backdrop-blur">
      <div class="flex flex-col leading-tight">
        <span class="text-xs uppercase tracking-widest text-gold-400">Protocol EventZ</span>
        <span class="text-sm text-white/70">{{ nombre }}</span>
      </div>
      <button
        (click)="salir()"
        class="rounded-full border border-gold-400/40 px-3 py-1 text-xs text-gold-300 transition hover:bg-gold-400/10"
      >
        Salir
      </button>
    </header>
  `,
})
export class HeaderComponent {
  constructor(private authService: AuthService, private router: Router) {}

  get nombre(): string {
    return this.authService.getSession()?.nombre || '';
  }

  salir(): void {
    this.authService.logout();
    this.router.navigate(['/login']);
  }
}
