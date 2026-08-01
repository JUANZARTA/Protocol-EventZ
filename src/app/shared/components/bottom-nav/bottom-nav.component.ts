import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { Rol } from '../../../core/models/dominio.models';

interface ItemNav {
  etiqueta: string;
  ruta: string;
  icono: string; // path SVG
}

const NAV_POR_ROL: Record<Rol, ItemNav[]> = {
  administrador: [
    { etiqueta: 'Eventos', ruta: '/app/eventos', icono: 'M3 10h18M7 3v4M17 3v4M5 6h14a1 1 0 011 1v12a1 1 0 01-1 1H5a1 1 0 01-1-1V7a1 1 0 011-1z' },
    { etiqueta: 'Equipo', ruta: '/app/admin/equipo', icono: 'M17 20h5v-1a4 4 0 00-4-4h-1M9 20H4v-1a4 4 0 014-4h1m0-4a3 3 0 100-6 3 3 0 000 6zm7 0a3 3 0 100-6 3 3 0 000 6z' },
    { etiqueta: 'Solicitudes', ruta: '/app/admin/pendientes', icono: 'M12 4v16m8-8H4' },
    { etiqueta: 'Tareas', ruta: '/app/tareas', icono: 'M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4' },
  ],
  jefe_mesero: [
    { etiqueta: 'Eventos', ruta: '/app/eventos', icono: 'M3 10h18M7 3v4M17 3v4M5 6h14a1 1 0 011 1v12a1 1 0 01-1 1H5a1 1 0 01-1-1V7a1 1 0 011-1z' },
    { etiqueta: 'Tareas', ruta: '/app/tareas', icono: 'M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4' },
    { etiqueta: 'Asignar', ruta: '/app/tareas/asignar', icono: 'M17 20h5v-1a4 4 0 00-4-4h-1M9 20H4v-1a4 4 0 014-4h1m0-4a3 3 0 100-6 3 3 0 000 6zm7 0a3 3 0 100-6 3 3 0 000 6z' },
  ],
  mesero: [
    { etiqueta: 'Eventos', ruta: '/app/eventos', icono: 'M3 10h18M7 3v4M17 3v4M5 6h14a1 1 0 011 1v12a1 1 0 01-1 1H5a1 1 0 01-1-1V7a1 1 0 011-1z' },
    { etiqueta: 'Mis tareas', ruta: '/app/tareas', icono: 'M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4' },
  ],
};

@Component({
  selector: 'app-bottom-nav',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive],
  template: `
    <nav class="sticky bottom-0 z-10 flex border-t border-white/10 bg-black/95 backdrop-blur">
      <a
        *ngFor="let item of items"
        [routerLink]="item.ruta"
        routerLinkActive="text-gold-400"
        class="flex flex-1 flex-col items-center gap-1 py-2 text-[11px] text-white/50 transition"
      >
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" class="h-5 w-5">
          <path stroke-linecap="round" stroke-linejoin="round" [attr.d]="item.icono" />
        </svg>
        {{ item.etiqueta }}
      </a>
    </nav>
  `,
})
export class BottomNavComponent {
  constructor(private authService: AuthService) {}

  get items(): ItemNav[] {
    const rol = this.authService.getSession()?.rol;
    return rol ? NAV_POR_ROL[rol] : [];
  }
}
