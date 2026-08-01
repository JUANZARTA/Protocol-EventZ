import { Injectable } from '@angular/core';
import { Observable, switchMap, map } from 'rxjs';
import { RtdbService } from './rtdb.service';
import { AuthService } from './auth.service';
import { Negocio } from '../models/dominio.models';

@Injectable({ providedIn: 'root' })
export class VenueService {
  constructor(private rtdb: RtdbService, private authService: AuthService) {}

  private get venueId(): string {
    const id = this.authService.getSession()?.venueId;
    if (!id) throw new Error('No hay negocio asociado a la sesión actual.');
    return id;
  }

  obtenerInfo(): Observable<Negocio> {
    return this.rtdb.get<Negocio>(`venues/${this.venueId}/info`);
  }

  regenerarCodigo(): Observable<string> {
    const nuevo = this.generarCodigo();
    return this.obtenerInfo().pipe(
      switchMap((info) =>
        this.rtdb.put(`codigos_negocio/${nuevo}`, { venueId: this.venueId }).pipe(
          switchMap(() => this.rtdb.remove(`codigos_negocio/${info.codigo}`)),
          switchMap(() => this.rtdb.patch(`venues/${this.venueId}/info`, { codigo: nuevo })),
          map(() => nuevo)
        )
      )
    );
  }

  actualizarAprobacionAutomatica(valor: boolean): Observable<unknown> {
    return this.rtdb.patch(`venues/${this.venueId}/info`, { aprobacionAutomatica: valor });
  }

  private generarCodigo(): string {
    const alfabeto = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
    let codigo = '';
    for (let i = 0; i < 6; i++) codigo += alfabeto[Math.floor(Math.random() * alfabeto.length)];
    return codigo;
  }
}
