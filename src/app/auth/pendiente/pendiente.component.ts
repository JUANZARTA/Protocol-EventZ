import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-pendiente',
  standalone: true,
  template: `
    <div class="flex min-h-screen flex-col items-center justify-center bg-black px-6 text-center text-white">
      <div class="mb-6 h-14 w-14 animate-pulse rounded-full border-2 border-gold-400"></div>
      <h1 class="mb-2 text-lg font-semibold">Solicitud enviada</h1>
      <p class="max-w-xs text-sm text-white/50">
        Tu administrador todavía no te asignó un rol. Avisale y volvé a intentar cuando te confirme.
      </p>

      <button
        (click)="reintentar()"
        [disabled]="cargando"
        class="mt-8 rounded-full bg-gold-400 px-6 py-2 text-sm font-semibold text-black disabled:opacity-50"
      >
        {{ cargando ? 'Revisando…' : 'Ya me asignaron el rol' }}
      </button>

      <button (click)="salir()" class="mt-4 text-xs text-white/40 underline">Salir</button>
    </div>
  `,
})
export default class PendienteComponent {
  cargando = false;

  constructor(private authService: AuthService, private router: Router) {}

  reintentar(): void {
    this.cargando = true;
    this.authService.refrescarSesion().subscribe({
      next: (sesion) => {
        this.cargando = false;
        if (sesion.estado === 'activo') this.router.navigate(['/app']);
      },
      error: () => (this.cargando = false),
    });
  }

  salir(): void {
    this.authService.logout();
    this.router.navigate(['/login']);
  }
}
