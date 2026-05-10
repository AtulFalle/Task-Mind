import { DatePipe } from '@angular/common';
import { Component, input, output } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import type { Annotation } from '@task-mind/shared';

@Component({
  selector: 'app-annotation-card',
  imports: [DatePipe, MatButtonModule, MatIconModule],
  templateUrl: './annotation-card.component.html',
  styleUrl: './annotation-card.component.scss',
})
export class AnnotationCardComponent {
  readonly annotation = input.required<Annotation>();
  readonly isDeleting = input.required<boolean>();
  readonly isActive = input(false);
  readonly deleteAnnotation = output<string>();
  readonly editAnnotation = output<Annotation>();
  readonly selectAnnotation = output<string>();
}
