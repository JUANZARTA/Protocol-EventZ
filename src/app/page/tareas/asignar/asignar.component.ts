import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TaskService, CargaMesero } from '../../../core/services/task.service';
import { EventService } from '../../../core/services/event.service';
import { Evento, Participante, Tarea } from '../../../core/models/dominio.models';
import { BadgeComponent } from '../../../shared/components/badge/badge.component';

@Component({
  selector: 'app-asignar',
  standalone: true,
  imports: [CommonModule, FormsModule, BadgeComponent],
  templateUrl: './asignar.component.html',
})
export default class AsignarComponent implements OnInit {
  evento: Evento | null = null;
  tareas: Tarea[] = [];
  participantes: Participante[] = [];
  cargas: CargaMesero[] = [];
  cargando = true;

  constructor(private taskService: TaskService, private eventService: EventService) {}

  ngOnInit(): void {
    this.cargar();
  }

  get sinAsignar(): Tarea[] {
    return this.tareas.filter((t) => !t.asignadoA);
  }

  cargar(): void {
    this.cargando = true;
    this.eventService.obtenerVigente().subscribe((evento) => {
      this.evento = evento;
      if (!evento) {
        this.cargando = false;
        return;
      }
      this.eventService.listarParticipantes(evento.id).subscribe((p) => {
        this.participantes = p.filter((x) => x.activo);
      });
      this.taskService.listar(evento.id).subscribe((tareas) => {
        this.tareas = tareas;
        this.cargas = TaskService.calcularCarga(tareas);
        this.cargando = false;
      });
    });
  }

  nombreDe(uid: string): string {
    return this.participantes.find((p) => p.uid === uid)?.nombre ?? uid;
  }

  cargaDe(uid: string): number {
    return this.cargas.find((c) => c.uid === uid)?.porcentaje ?? 0;
  }

  asignar(tarea: Tarea, uid: string): void {
    if (!this.evento) return;
    this.taskService.asignar(this.evento.id, tarea.id, uid || null, tarea.tipo).subscribe(() => this.cargar());
  }
}
