import { Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { StudioType } from '@task-mind/shared';
import { WorkspaceService } from './workspace.service';

@Component({
  selector: 'app-create-workspace-page',
  imports: [
    ReactiveFormsModule,
    RouterLink,
    MatButtonModule,
    MatCardModule,
    MatFormFieldModule,
    MatIconModule,
    MatInputModule,
    MatSelectModule,
  ],
  templateUrl: './create-workspace.page.html',
  styleUrl: './create-workspace.page.scss',
})
export class CreateWorkspacePage {
  private readonly formBuilder = inject(FormBuilder);
  private readonly router = inject(Router);
  private readonly workspaceService = inject(WorkspaceService);

  protected readonly studioTypes = [StudioType.DOCUMENT];
  protected readonly isSaving = signal(false);
  protected readonly errorMessage = signal('');

  protected readonly workspaceForm = this.formBuilder.nonNullable.group({
    name: ['', Validators.required],
    description: [''],
    studioType: [StudioType.DOCUMENT, Validators.required],
  });

  protected createWorkspace(): void {
    if (this.workspaceForm.invalid) {
      this.workspaceForm.markAllAsTouched();
      return;
    }

    this.isSaving.set(true);
    this.errorMessage.set('');

    this.workspaceService.createWorkspace(this.workspaceForm.getRawValue()).subscribe({
      next: (workspace) => {
        void this.router.navigate(['/workspaces', workspace.id]);
      },
      error: () => {
        this.errorMessage.set('Workspace could not be created.');
        this.isSaving.set(false);
      },
    });
  }
}
