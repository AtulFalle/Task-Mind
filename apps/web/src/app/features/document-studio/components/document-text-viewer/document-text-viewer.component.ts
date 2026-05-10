import {
  Component,
  ElementRef,
  computed,
  inject,
  input,
  output,
  signal,
  viewChild,
} from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import {
  ExtractedTextStatus,
  type Annotation,
  type CreateAnnotationRequest,
} from '@task-mind/shared';
import { AnnotationFormComponent } from '../annotation-form/annotation-form.component';
import type {
  AnnotationPopoverPosition,
  AnnotationTextSegment,
  SelectedDocumentText,
} from '../../models/document-studio.models';

interface AnnotationEditRequest {
  annotationId: string;
  payload: CreateAnnotationRequest;
}

interface OffsetAnnotation extends Annotation {
  startOffset: number;
  endOffset: number;
}

@Component({
  selector: 'app-document-text-viewer',
  imports: [
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule,
    AnnotationFormComponent,
  ],
  templateUrl: './document-text-viewer.component.html',
  styleUrl: './document-text-viewer.component.scss',
})
export class DocumentTextViewerComponent {
  private readonly hostElement = inject<ElementRef<HTMLElement>>(ElementRef);
  private readonly textElement =
    viewChild<ElementRef<HTMLElement>>('textElement');

  readonly isLoading = input.required<boolean>();
  readonly status = input.required<ExtractedTextStatus | null>();
  readonly text = input.required<string | null>();
  readonly error = input<string | null>(null);
  readonly annotations = input<Annotation[]>([]);
  readonly activeAnnotationId = input<string | null>(null);
  readonly isSavingAnnotation = input(false);
  readonly annotationErrorMessage = input('');
  readonly saveAnnotation = output<CreateAnnotationRequest>();
  readonly updateAnnotation = output<AnnotationEditRequest>();
  readonly deleteAnnotation = output<string>();
  readonly annotationSelected = output<string>();

  protected readonly pendingSelection = signal<SelectedDocumentText | null>(
    null,
  );
  protected readonly selectedAnnotation = signal<Annotation | null>(null);
  protected readonly isEditingAnnotation = signal(false);
  protected readonly popoverPosition = signal<AnnotationPopoverPosition | null>(
    null,
  );
  protected readonly extractedTextStatus = ExtractedTextStatus;
  protected readonly hasText = computed(() => Boolean(this.text()?.trim()));
  protected readonly textSegments = computed(() =>
    this.buildTextSegments(this.text() ?? '', this.annotations()),
  );
  protected readonly emptyMessage = computed(() => {
    if (this.status() === ExtractedTextStatus.NOT_STARTED) {
      return 'Text extraction has not started.';
    }

    if (this.status() === ExtractedTextStatus.UNSUPPORTED) {
      return this.text() ?? 'No extractable text is available for this file.';
    }

    return 'No extracted text is available for this document.';
  });

  protected captureSelection(): void {
    const selection = globalThis.getSelection?.();
    const rawSelectedText = selection?.toString() ?? '';
    const selectedText = rawSelectedText.trim();
    const textElement = this.textElement()?.nativeElement;

    if (
      !selection ||
      !selectedText ||
      !textElement ||
      selection.rangeCount === 0
    ) {
      return;
    }

    const range = selection.getRangeAt(0);

    if (!textElement.contains(range.commonAncestorContainer)) {
      return;
    }

    const offsetRange = range.cloneRange();
    offsetRange.selectNodeContents(textElement);
    offsetRange.setEnd(range.startContainer, range.startOffset);

    const startOffset =
      offsetRange.toString().length + rawSelectedText.search(/\S/);
    const endOffset = startOffset + selectedText.length;
    const hostRect = this.hostElement.nativeElement.getBoundingClientRect();
    const rangeRect = range.getBoundingClientRect();

    this.pendingSelection.set({
      text: selectedText,
      startOffset,
      endOffset,
    });
    this.selectedAnnotation.set(null);
    this.isEditingAnnotation.set(false);
    this.popoverPosition.set({
      left: rangeRect.left - hostRect.left,
      top: rangeRect.bottom - hostRect.top + 10,
    });
  }

  protected submitAnnotation(payload: CreateAnnotationRequest): void {
    const selection = this.pendingSelection();

    if (selection) {
      this.saveAnnotation.emit(payload);
      this.cancelPopover();
    }
  }

  protected submitAnnotationEdit(payload: CreateAnnotationRequest): void {
    const annotation = this.selectedAnnotation();

    if (annotation) {
      this.updateAnnotation.emit({ annotationId: annotation.id, payload });
      this.cancelPopover();
    }
  }

  protected cancelPopover(): void {
    this.pendingSelection.set(null);
    this.selectedAnnotation.set(null);
    this.isEditingAnnotation.set(false);
    this.popoverPosition.set(null);
  }

  protected openAnnotationPopover(
    annotationId: string,
    event: MouseEvent,
  ): void {
    const annotation = this.annotations().find(
      (candidate) => candidate.id === annotationId,
    );
    const textElement = this.textElement()?.nativeElement;

    if (!annotation || !textElement) {
      return;
    }

    const target = event.currentTarget as HTMLElement;
    const targetRect = target.getBoundingClientRect();
    const hostRect = this.hostElement.nativeElement.getBoundingClientRect();

    this.pendingSelection.set(null);
    this.selectedAnnotation.set(annotation);
    this.isEditingAnnotation.set(false);
    this.annotationSelected.emit(annotation.id);
    this.popoverPosition.set({
      left: targetRect.left - hostRect.left,
      top: targetRect.bottom - hostRect.top + 10,
    });
  }

  protected editSelectedAnnotation(): void {
    this.isEditingAnnotation.set(true);
  }

  protected deleteSelectedAnnotation(): void {
    const annotation = this.selectedAnnotation();

    if (annotation) {
      this.deleteAnnotation.emit(annotation.id);
      this.cancelPopover();
    }
  }

  protected segmentAnnotation(segment: AnnotationTextSegment): Annotation | null {
    if (!segment.annotationId) {
      return null;
    }

    return (
      this.annotations().find(
        (annotation) => annotation.id === segment.annotationId,
      ) ?? null
    );
  }

  private buildTextSegments(
    text: string,
    annotations: Annotation[],
  ): AnnotationTextSegment[] {
    const sortedAnnotations = annotations
      .map((annotation): OffsetAnnotation | null => {
        if (
          annotation.startOffset === undefined ||
          annotation.endOffset === undefined ||
          annotation.startOffset < 0 ||
          annotation.endOffset <= annotation.startOffset ||
          annotation.endOffset > text.length
        ) {
          return null;
        }

        return {
          ...annotation,
          startOffset: annotation.startOffset,
          endOffset: annotation.endOffset,
        };
      })
      .filter(
        (annotation): annotation is OffsetAnnotation => annotation !== null,
      )
      .sort((first, second) => first.startOffset - second.startOffset);

    const segments: AnnotationTextSegment[] = [];
    let cursor = 0;

    for (const annotation of sortedAnnotations) {
      const startOffset = annotation.startOffset;
      const endOffset = annotation.endOffset;

      if (startOffset < cursor) {
        continue;
      }

      if (startOffset > cursor) {
        segments.push({
          id: `text-${cursor}-${startOffset}`,
          text: text.slice(cursor, startOffset),
        });
      }

      segments.push({
        id: annotation.id,
        text: text.slice(startOffset, endOffset),
        annotationId: annotation.id,
      });
      cursor = endOffset;
    }

    if (cursor < text.length) {
      segments.push({
        id: `text-${cursor}-${text.length}`,
        text: text.slice(cursor),
      });
    }

    return segments.length ? segments : [{ id: 'text-full', text }];
  }
}
