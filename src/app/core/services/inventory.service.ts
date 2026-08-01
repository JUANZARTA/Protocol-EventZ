import { Injectable } from '@angular/core';
import { Observable, map } from 'rxjs';
import { RtdbService } from './rtdb.service';
import { AuthService } from './auth.service';
import { ItemInventario } from '../models/dominio.models';

@Injectable({ providedIn: 'root' })
export class InventoryService {
  constructor(private rtdb: RtdbService, private authService: AuthService) {}

  private get venueId(): string {
    const id = this.authService.getSession()?.venueId;
    if (!id) throw new Error('No hay negocio asociado a la sesión actual.');
    return id;
  }

  listar(eventoId: string): Observable<ItemInventario[]> {
    return this.rtdb
      .get<Record<string, Omit<ItemInventario, 'id'>>>(`venues/${this.venueId}/eventos/${eventoId}/inventario`)
      .pipe(map((obj) => RtdbService.toArray(obj)));
  }

  agregarItem(
    eventoId: string,
    datos: Pick<ItemInventario, 'nombre' | 'cantidad' | 'falta' | 'nota'>,
    cargadoPor: string
  ): Observable<string> {
    const id = this.generarId();
    const item: Omit<ItemInventario, 'id'> = {
      ...datos,
      cargadoPor,
      cargadoEn: Date.now(),
      confirmadoPorAdmin: false,
    };
    return this.rtdb.put(`venues/${this.venueId}/eventos/${eventoId}/inventario/${id}`, item).pipe(map(() => id));
  }

  actualizarItem(eventoId: string, itemId: string, cambios: Partial<ItemInventario>): Observable<unknown> {
    return this.rtdb.patch(`venues/${this.venueId}/eventos/${eventoId}/inventario/${itemId}`, cambios);
  }

  confirmarAdmin(eventoId: string, itemId: string): Observable<unknown> {
    return this.actualizarItem(eventoId, itemId, { confirmadoPorAdmin: true });
  }

  private generarId(): string {
    return `${Date.now().toString(36)}${Math.random().toString(36).slice(2, 10)}`;
  }
}
