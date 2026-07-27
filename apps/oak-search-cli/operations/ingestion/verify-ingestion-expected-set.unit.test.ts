/**
 * Unit tests for the verification expected-lesson set.
 *
 * The expected set drives `admin verify`: it is the list of lesson slugs the
 * index MUST contain. It excludes restricted lessons, mirroring the ingest
 * pipeline's MCP-204 filter decision — expecting them would report every
 * restricted lesson as missing.
 */

import { describe, it, expect } from 'vitest';
import { extractLessonsFromBulkDownload, type BulkDownloadData } from './verify-ingestion-lib';

describe('extractLessonsFromBulkDownload', () => {
  it('extracts lesson slugs for a specific key stage', () => {
    const data: BulkDownloadData = {
      lessons: [
        { lessonSlug: 'lesson-1', keyStageSlug: 'ks4' },
        { lessonSlug: 'lesson-2', keyStageSlug: 'ks3' },
        { lessonSlug: 'lesson-3', keyStageSlug: 'ks4' },
      ],
    };

    const result = extractLessonsFromBulkDownload(data, 'ks4');

    expect(result).toEqual(['lesson-1', 'lesson-3']);
  });

  it('returns empty array when no lessons match key stage', () => {
    const data: BulkDownloadData = {
      lessons: [
        { lessonSlug: 'lesson-1', keyStageSlug: 'ks3' },
        { lessonSlug: 'lesson-2', keyStageSlug: 'ks3' },
      ],
    };

    const result = extractLessonsFromBulkDownload(data, 'ks4');

    expect(result).toEqual([]);
  });

  it('handles empty lessons array', () => {
    const data: BulkDownloadData = { lessons: [] };

    const result = extractLessonsFromBulkDownload(data, 'ks4');

    expect(result).toEqual([]);
  });

  it('excludes restricted lessons from the expected set (MCP-204 filter decision)', () => {
    const data: BulkDownloadData = {
      lessons: [
        { lessonSlug: 'open-lesson', keyStageSlug: 'ks4' },
        { lessonSlug: 'hidden-lesson', keyStageSlug: 'ks4', restricted: true },
        { lessonSlug: 'flagged-false-lesson', keyStageSlug: 'ks4', restricted: false },
      ],
    };

    const result = extractLessonsFromBulkDownload(data, 'ks4');

    expect(result).toEqual(['open-lesson', 'flagged-false-lesson']);
  });
});
