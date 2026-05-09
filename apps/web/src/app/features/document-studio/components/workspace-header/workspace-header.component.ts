import { Component, input } from '@angular/core';
import { DatePipe } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { RouterLink } from '@angular/router';
import type { Workspace } from '@task-mind/shared';

@Component({
  selector: 'app-workspace-header',
  imports: [DatePipe, RouterLink, MatButtonModule, MatIconModule],
  templateUrl: './workspace-header.component.html',
  styleUrl: './workspace-header.component.scss',
})
export class WorkspaceHeaderComponent {
  readonly workspace = input.required<Workspace>();
}
