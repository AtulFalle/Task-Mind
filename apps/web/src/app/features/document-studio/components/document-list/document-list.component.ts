import { DatePipe } from '@angular/common';
import { Component, input } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTableModule } from '@angular/material/table';
import { RouterLink } from '@angular/router';
import type { Document } from '@task-mind/shared';
import { EmptyDocumentsStateComponent } from '../empty-documents-state/empty-documents-state.component';

@Component({
  selector: 'app-document-list',
  imports: [
    DatePipe,
    RouterLink,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule,
    MatTableModule,
    EmptyDocumentsStateComponent,
  ],
  templateUrl: './document-list.component.html',
  styleUrl: './document-list.component.scss',
})
export class DocumentListComponent {
  readonly workspaceId = input.required<string>();
  readonly documents = input.required<Document[]>();
  readonly isLoading = input.required<boolean>();
  readonly errorMessage = input.required<string>();

  protected readonly displayedColumns = [
    'originalName',
    'mimeType',
    'createdAt',
    'status',
    'actions',
  ];
}
