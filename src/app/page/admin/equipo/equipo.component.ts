import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { UserService } from '../../../core/services/user.service';
import { VenueService } from '../../../core/services/venue.service';
import { AuthService } from '../../../core/services/auth.service';
import { Negocio, Rol, UsuarioVenue } from '../../../core/models/dominio.models';
import { BadgeComponent } from '../../../shared/components/badge/badge.component';

@Component({
  selector: 'app-equipo',
  standalone: true,
  imports: [CommonModule, FormsModule, BadgeComponent],
  templateUrl: './equipo.component.html',
})
export default class EquipoComponent implements OnInit {
  equipo: UsuarioVenue[] = [];
  negocio: Negocio | null = null;
  cargando = true;
  regenerando = false;

  constructor(
    private userService: UserService,
    private venueService: VenueService,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    this.cargar();
    this.venueService.obtenerInfo().subscribe((n) => (this.negocio = n));
  }

  get miUid(): string {
    return this.authService.getSession()?.localId ?? '';
  }

  cargar(): void {
    this.cargando = true;
    this.userService.listarEquipo().subscribe((usuarios) => {
      this.equipo = usuarios.filter((u) => u.estado === 'activo');
      this.cargando = false;
    });
  }

  cambiarRol(usuario: UsuarioVenue, rol: Rol): void {
    this.userService.asignarRol(usuario.uid, rol).subscribe(() => this.cargar());
  }

  quitarAcceso(usuario: UsuarioVenue): void {
    this.userService.quitarAcceso(usuario.uid).subscribe(() => this.cargar());
  }

  regenerarCodigo(): void {
    this.regenerando = true;
    this.venueService.regenerarCodigo().subscribe((codigo) => {
      if (this.negocio) this.negocio = { ...this.negocio, codigo };
      this.regenerando = false;
    });
  }
}
