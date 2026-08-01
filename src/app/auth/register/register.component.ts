import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';

type Modo = 'negocio' | 'empleado';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './register.component.html',
})
export default class RegisterComponent {
  modo: Modo = 'negocio';
  cargando = false;
  error = '';

  formNegocio: FormGroup;
  formEmpleado: FormGroup;

  constructor(private fb: FormBuilder, private authService: AuthService, private router: Router) {
    this.formNegocio = this.fb.group({
      nombre: ['', Validators.required],
      nombreNegocio: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
    });

    this.formEmpleado = this.fb.group({
      nombre: ['', Validators.required],
      codigo: ['', [Validators.required, Validators.minLength(6)]],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
    });
  }

  cambiarModo(modo: Modo): void {
    this.modo = modo;
    this.error = '';
  }

  enviarNegocio(): void {
    if (this.formNegocio.invalid) return;
    this.cargando = true;
    this.error = '';
    const { nombre, nombreNegocio, email, password } = this.formNegocio.value;

    this.authService.registrarCrearNegocio(nombre, nombreNegocio, email, password).subscribe({
      next: () => {
        this.cargando = false;
        this.router.navigate(['/app']);
      },
      error: (mensaje) => {
        this.cargando = false;
        this.error = mensaje;
      },
    });
  }

  enviarEmpleado(): void {
    if (this.formEmpleado.invalid) return;
    this.cargando = true;
    this.error = '';
    const { nombre, codigo, email, password } = this.formEmpleado.value;

    this.authService.registrarComoEmpleado(nombre, codigo.toUpperCase(), email, password).subscribe({
      next: () => {
        this.cargando = false;
        this.router.navigate(['/pendiente']);
      },
      error: (mensaje) => {
        this.cargando = false;
        this.error = mensaje;
      },
    });
  }
}
