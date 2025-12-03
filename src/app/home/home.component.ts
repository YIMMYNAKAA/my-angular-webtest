import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RacingGameComponent } from './racing-game.component';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, RacingGameComponent],
  template: `<app-racing-game></app-racing-game>`,
  styles: []
})
export class HomeComponent {}