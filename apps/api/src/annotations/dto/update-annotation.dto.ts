import type { UpdateAnnotationRequest } from '@task-mind/shared';
import { CreateAnnotationDto } from './create-annotation.dto';

export class UpdateAnnotationDto
  extends CreateAnnotationDto
  implements UpdateAnnotationRequest {}
