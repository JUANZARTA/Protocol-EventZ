import { Injectable } from '@angular/core';
import { Observable, map } from 'rxjs';
import { RtdbService } from './rtdb.service';
import { AuthService } from './auth.service';
import { Rol, UsuarioVenue } from '../models/dominio.models';

@Injectable({ providedIn: 'root' })
export class UserService {
  constructor(private rtdb: RtdbService, private authService: AuthService) {}

  private get venueId(): string {
    const id = this.authService.getSession()?.venueId;
    if (!id) throw new Error('No hay negocio asociado a la sesión actual.');
    return id;
  }

  listarEquipo(): Observable<UsuarioVenue[]> {
    return this.rtdb
      .get<Record<string, Omit<UsuarioVenue, 'uid'>>>(`venues/${this.venueId}/usuarios`)
      .pipe(map((obj) => this.aArreglo(obj)));
  }

  listarPendientes(): Observable<UsuarioVenue[]> {
    return this.listarEquipo().pipe(map((usuarios) => usuarios.filter((u) => u.estado === 'pendiente')));
  }

  listarActivosPorRol(...roles: Rol[]): Observable<UsuarioVenue[]> {
    return this.listarEquipo().pipe(
      map((usuarios) => usuarios.filter((u) => u.estado === 'activo' && u.rol && roles.includes(u.rol)))
    );
  }

  asignarRol(uid: string, rol: Rol): Observable<unknown> {
    return this.rtdb.patch(`venues/${this.venueId}/usuarios/${uid}`, { rol, estado: 'activo' });
  }

  quitarAcceso(uid: string): Observable<unknown> {
    return this.rtdb.patch(`venues/${this.venueId}/usuarios/${uid}`, { rol: null, estado: 'pendiente' });
  }

  private aArreglo(obj: Record<string, Omit<UsuarioVenue, 'uid'>> | null): UsuarioVenue[] {
    if (!obj) return [];
    return Object.entries(obj).map(([uid, value]) => ({ ...value, uid }));
  }
}
