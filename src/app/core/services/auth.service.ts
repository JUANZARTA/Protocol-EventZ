import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, throwError, of } from 'rxjs';
import { catchError, map, switchMap, tap } from 'rxjs/operators';
import { environment } from '../../../environments/environment';
import { Rol, Sesion } from '../models/dominio.models';

const SESSION_KEY = 'pez_sesion';

interface IdentityToolkitResponse {
  idToken: string;
  refreshToken: string;
  localId: string;
  email: string;
}

@Injectable({ providedIn: 'root' })
export class AuthService {
  private identityUrl = 'https://identitytoolkit.googleapis.com/v1/accounts';
  private dbUrl = environment.firebase.databaseURL;

  constructor(private http: HttpClient) {}

  // ---------- Sesión local ----------

  getSession(): Sesion | null {
    if (typeof window === 'undefined') return null;
    const raw = localStorage.getItem(SESSION_KEY);
    return raw ? (JSON.parse(raw) as Sesion) : null;
  }

  isLoggedIn(): boolean {
    return !!this.getSession()?.idToken;
  }

  async getIdToken(): Promise<string | null> {
    return this.getSession()?.idToken ?? null;
  }

  logout(): void {
    if (typeof window === 'undefined') return;
    localStorage.removeItem(SESSION_KEY);
  }

  private guardarSesion(sesion: Sesion): void {
    if (typeof window === 'undefined') return;
    localStorage.setItem(SESSION_KEY, JSON.stringify(sesion));
  }

  // ---------- Login ----------

  login(email: string, password: string): Observable<Sesion> {
    return this.signIn(email, password).pipe(
      switchMap((auth) => this.cargarPerfilYGuardar(auth))
    );
  }

  /** Vuelve a leer rol/estado del negocio (ej: después de que el admin aprueba a alguien). */
  refrescarSesion(): Observable<Sesion> {
    const sesion = this.getSession();
    if (!sesion) return throwError(() => 'No hay sesión activa');
    return this.leerPerfil(sesion.venueId, sesion.localId, sesion.idToken).pipe(
      map((perfil) => {
        const actualizada: Sesion = { ...sesion, ...perfil };
        this.guardarSesion(actualizada);
        return actualizada;
      })
    );
  }

  // ---------- Registro: crear negocio (queda como administrador) ----------

  registrarCrearNegocio(nombre: string, nombreNegocio: string, email: string, password: string): Observable<Sesion> {
    return this.signUp(email, password).pipe(
      switchMap((auth) => {
        const venueId = this.generarId();
        const codigo = this.generarCodigo();
        const ahora = Date.now();

        const altaNegocio$ = this.putConToken(`venues/${venueId}/info`, auth.idToken, {
          nombre: nombreNegocio,
          codigo,
          duenoUid: auth.localId,
          creadoEn: ahora,
          aprobacionAutomatica: false,
        });

        const altaUsuario$ = this.putConToken(`venues/${venueId}/usuarios/${auth.localId}`, auth.idToken, {
          nombre,
          email,
          rol: 'administrador' as Rol,
          estado: 'activo',
          creadoEn: ahora,
        });

        const altaCodigo$ = this.putConToken(`codigos_negocio/${codigo}`, auth.idToken, { venueId });
        const altaIndice$ = this.putConToken(`usuarios_index/${auth.localId}`, auth.idToken, { venueId });

        return altaNegocio$.pipe(
          switchMap(() => altaUsuario$),
          switchMap(() => altaCodigo$),
          switchMap(() => altaIndice$),
          map(() => {
            const sesion: Sesion = {
              idToken: auth.idToken,
              refreshToken: auth.refreshToken,
              localId: auth.localId,
              email,
              nombre,
              venueId,
              rol: 'administrador',
              estado: 'activo',
            };
            this.guardarSesion(sesion);
            return sesion;
          })
        );
      })
    );
  }

  // ---------- Registro: ingresar como empleado (pendiente hasta que el admin asigne rol) ----------

  /** Valida el código de negocio SIN necesitar sesión (lectura pública del índice de códigos). */
  validarCodigoNegocio(codigo: string): Observable<string | null> {
    const url = `${this.dbUrl}/codigos_negocio/${codigo}.json`;
    return this.http.get<{ venueId: string } | null>(url).pipe(
      map((res) => res?.venueId ?? null),
      catchError(() => of(null))
    );
  }

  /** Lectura pública acotada a este único campo (ver database.rules.json). */
  private leerAprobacionAutomatica(venueId: string): Observable<boolean> {
    const url = `${this.dbUrl}/venues/${venueId}/info/aprobacionAutomatica.json`;
    return this.http.get<boolean | null>(url).pipe(
      map((valor) => valor === true),
      catchError(() => of(false))
    );
  }

  registrarComoEmpleado(nombre: string, codigo: string, email: string, password: string): Observable<Sesion> {
    return this.validarCodigoNegocio(codigo).pipe(
      switchMap((venueId) => {
        if (!venueId) return throwError(() => 'El código de negocio no es válido.');

        return this.leerAprobacionAutomatica(venueId).pipe(
          switchMap((aprobacionAutomatica) => {
            const rol: Rol | null = aprobacionAutomatica ? 'mesero' : null;
            const estado = aprobacionAutomatica ? 'activo' : 'pendiente';

            return this.signUp(email, password).pipe(
              switchMap((auth) => {
                const ahora = Date.now();
                const altaUsuario$ = this.putConToken(`venues/${venueId}/usuarios/${auth.localId}`, auth.idToken, {
                  nombre,
                  email,
                  rol,
                  estado,
                  creadoEn: ahora,
                });
                const altaIndice$ = this.putConToken(`usuarios_index/${auth.localId}`, auth.idToken, { venueId });

                return altaUsuario$.pipe(
                  switchMap(() => altaIndice$),
                  map(() => {
                    const sesion: Sesion = {
                      idToken: auth.idToken,
                      refreshToken: auth.refreshToken,
                      localId: auth.localId,
                      email,
                      nombre,
                      venueId,
                      rol,
                      estado,
                    };
                    this.guardarSesion(sesion);
                    return sesion;
                  })
                );
              })
            );
          })
        );
      })
    );
  }

  // ---------- Identity Toolkit ----------

  private signIn(email: string, password: string): Observable<IdentityToolkitResponse> {
    const url = `${this.identityUrl}:signInWithPassword?key=${environment.firebase.apiKey}`;
    return this.http.post<IdentityToolkitResponse>(url, { email, password, returnSecureToken: true }).pipe(
      catchError((err) => throwError(() => this.mensajeError(err)))
    );
  }

  private signUp(email: string, password: string): Observable<IdentityToolkitResponse> {
    const url = `${this.identityUrl}:signUp?key=${environment.firebase.apiKey}`;
    return this.http.post<IdentityToolkitResponse>(url, { email, password, returnSecureToken: true }).pipe(
      catchError((err) => throwError(() => this.mensajeError(err)))
    );
  }

  private cargarPerfilYGuardar(auth: IdentityToolkitResponse): Observable<Sesion> {
    const indiceUrl = `${this.dbUrl}/usuarios_index/${auth.localId}.json?auth=${auth.idToken}`;
    return this.http.get<{ venueId: string } | null>(indiceUrl).pipe(
      switchMap((indice) => {
        const venueId = indice?.venueId ?? null;
        if (!venueId) {
          const sesion: Sesion = {
            idToken: auth.idToken,
            refreshToken: auth.refreshToken,
            localId: auth.localId,
            email: auth.email,
            nombre: '',
            venueId: null,
            rol: null,
            estado: null,
          };
          this.guardarSesion(sesion);
          return of(sesion);
        }
        return this.leerPerfil(venueId, auth.localId, auth.idToken).pipe(
          map((perfil) => {
            const sesion: Sesion = {
              idToken: auth.idToken,
              refreshToken: auth.refreshToken,
              localId: auth.localId,
              email: auth.email,
              nombre: perfil.nombre,
              venueId,
              rol: perfil.rol,
              estado: perfil.estado,
            };
            this.guardarSesion(sesion);
            return sesion;
          })
        );
      })
    );
  }

  private leerPerfil(venueId: string | null, uid: string, idToken: string): Observable<Pick<Sesion, 'nombre' | 'rol' | 'estado'>> {
    if (!venueId) return of({ nombre: '', rol: null, estado: null });
    const url = `${this.dbUrl}/venues/${venueId}/usuarios/${uid}.json?auth=${idToken}`;
    return this.http.get<{ nombre: string; rol: Rol | null; estado: 'pendiente' | 'activo' } | null>(url).pipe(
      map((perfil) => ({
        nombre: perfil?.nombre ?? '',
        rol: perfil?.rol ?? null,
        estado: perfil?.estado ?? null,
      }))
    );
  }

  private putConToken(path: string, idToken: string, value: unknown): Observable<unknown> {
    const url = `${this.dbUrl}/${path}.json?auth=${idToken}`;
    return this.http.put(url, value);
  }

  private mensajeError(err: any): string {
    const codigo = err?.error?.error?.message;
    switch (codigo) {
      case 'EMAIL_NOT_FOUND':
      case 'INVALID_PASSWORD':
      case 'INVALID_LOGIN_CREDENTIALS':
        return 'Correo o contraseña incorrectos.';
      case 'EMAIL_EXISTS':
        return 'Ya existe una cuenta con ese correo.';
      case 'USER_DISABLED':
        return 'Este usuario fue deshabilitado.';
      case 'WEAK_PASSWORD : Password should be at least 6 characters':
        return 'La contraseña debe tener al menos 6 caracteres.';
      default:
        return 'Ocurrió un error inesperado. Intenta de nuevo.';
    }
  }

  private generarCodigo(): string {
    const alfabeto = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
    let codigo = '';
    for (let i = 0; i < 6; i++) {
      codigo += alfabeto[Math.floor(Math.random() * alfabeto.length)];
    }
    return codigo;
  }

  private generarId(): string {
    return `${Date.now().toString(36)}${Math.random().toString(36).slice(2, 10)}`;
  }
}
