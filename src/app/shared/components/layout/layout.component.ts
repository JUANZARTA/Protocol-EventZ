import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { HeaderComponent } from '../header/header.component';
import { BottomNavComponent } from '../bottom-nav/bottom-nav.component';

@Component({
  selector: 'app-layout',
  standalone: true,
  imports: [RouterOutlet, HeaderComponent, BottomNavComponent],
  template: `
    <div class="mx-auto flex min-h-screen max-w-md flex-col bg-black text-white">
      <app-header />
      <main class="flex-1 overflow-y-auto px-4 py-4">
        <router-outlet />
      </main>
      <app-bottom-nav />
    </div>
  `,
})
export class LayoutComponent {}
