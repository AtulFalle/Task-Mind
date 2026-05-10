import { DatePipe } from '@angular/common';
import { Component, computed, input } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { FeedbackEventType, type FeedbackEvent } from '@task-mind/shared';

@Component({
  selector: 'app-feedback-event-card',
  imports: [DatePipe, MatIconModule],
  templateUrl: './feedback-event-card.component.html',
  styleUrl: './feedback-event-card.component.scss',
})
export class FeedbackEventCardComponent {
  readonly event = input.required<FeedbackEvent>();

  protected readonly title = computed(() => {
    switch (this.event().eventType) {
      case FeedbackEventType.DOCUMENT_UPLOADED:
        return 'Document uploaded';
      case FeedbackEventType.TEXT_EXTRACTED:
        return 'Text extracted';
      case FeedbackEventType.ANNOTATION_CREATED:
        return 'Annotation created';
      case FeedbackEventType.RULE_CREATED:
        return 'Rule created';
      case FeedbackEventType.RULE_DELETED:
        return 'Rule deleted';
      default:
        return this.formatEventType(this.event().eventType);
    }
  });

  protected readonly icon = computed(() => {
    switch (this.event().eventType) {
      case FeedbackEventType.DOCUMENT_UPLOADED:
        return 'upload_file';
      case FeedbackEventType.TEXT_EXTRACTED:
        return 'article';
      case FeedbackEventType.ANNOTATION_CREATED:
        return 'edit_note';
      case FeedbackEventType.RULE_CREATED:
        return 'rule';
      case FeedbackEventType.RULE_DELETED:
        return 'delete';
      default:
        return 'history';
    }
  });

  protected readonly description = computed(() => {
    const payload = this.event().payloadJson;

    switch (this.event().eventType) {
      case FeedbackEventType.DOCUMENT_UPLOADED:
        return (
          this.optionalText(payload['originalName']) ||
          'A document was uploaded.'
        );
      case FeedbackEventType.TEXT_EXTRACTED:
        return this.textExtractionDescription(payload);
      case FeedbackEventType.ANNOTATION_CREATED:
        return this.annotationDescription(payload);
      case FeedbackEventType.RULE_CREATED:
        return this.ruleDescription(payload, 'Created');
      case FeedbackEventType.RULE_DELETED:
        return this.ruleDescription(payload, 'Deleted');
      default:
        return 'Teaching memory was updated.';
    }
  });

  private annotationDescription(payload: Record<string, unknown>): string {
    const fieldName = this.optionalText(payload['fieldName']);
    const selectedText = this.optionalText(payload['selectedText']);

    if (fieldName && selectedText) {
      return `${fieldName}: ${selectedText}`;
    }

    return fieldName || selectedText || 'A text annotation was saved.';
  }

  private ruleDescription(
    payload: Record<string, unknown>,
    verb: string,
  ): string {
    const title = this.optionalText(payload['title']);
    const category = this.optionalText(payload['category']);

    if (title && category) {
      return `${verb} ${category.toLowerCase()} rule: ${title}`;
    }

    return title ? `${verb} rule: ${title}` : `${verb} an operational rule.`;
  }

  private textExtractionDescription(payload: Record<string, unknown>): string {
    const status = this.optionalText(payload['status']);
    const textLength = payload['textLength'];

    if (status && typeof textLength === 'number') {
      return `${status.toLowerCase()} with ${textLength} extracted characters.`;
    }

    return status
      ? `Text extraction ${status.toLowerCase()}.`
      : 'Document text extraction finished.';
  }

  private optionalText(value: unknown): string {
    return typeof value === 'string' ? value : '';
  }

  private formatEventType(eventType: FeedbackEvent['eventType']): string {
    return eventType
      .toLowerCase()
      .split('_')
      .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
      .join(' ');
  }
}
