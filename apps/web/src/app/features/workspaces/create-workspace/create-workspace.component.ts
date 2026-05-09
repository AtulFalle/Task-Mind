import { Component, computed, effect, inject, Injector, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { StudioType, type CreateWorkspaceRequest } from '@task-mind/shared';
import { WorkspaceService } from '../workspace.service';

@Component({
  selector: 'app-create-workspace',
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
  templateUrl: './create-workspace.component.html',
  styleUrl: './create-workspace.component.scss',
})
export class CreateWorkspaceComponent {
  private readonly formBuilder = inject(FormBuilder);
  private readonly injector = inject(Injector);
  private readonly router = inject(Router);
  private readonly workspaceService = inject(WorkspaceService);

  protected readonly studioTypes = [StudioType.DOCUMENT];
  protected readonly workspaceRequest = signal<CreateWorkspaceRequest | null>(
    null,
  );
  protected readonly createWorkspaceResource =
    this.workspaceService.createWorkspaceResource(
      this.workspaceRequest,
      this.injector,
    );
  protected readonly isSaving = this.createWorkspaceResource.isLoading;
  protected readonly errorMessage = computed(() =>
    this.createWorkspaceResource.error()
      ? 'Workspace could not be created.'
      : '',
  );

  protected readonly workspaceForm = this.formBuilder.nonNullable.group({
    name: ['', Validators.required],
    description: [''],
    studioType: [StudioType.DOCUMENT, Validators.required],
  });

  constructor() {
    effect(() => {
      const createdWorkspace = this.createWorkspaceResource.value();

      if (createdWorkspace) {
        void this.router.navigate(['/workspaces', createdWorkspace.id]);
      }
    });
  }

  protected createWorkspace(): void {
    if (this.workspaceForm.invalid) {
      this.workspaceForm.markAllAsTouched();
      return;
    }

    this.workspaceRequest.set(this.workspaceForm.getRawValue());
  }
}
