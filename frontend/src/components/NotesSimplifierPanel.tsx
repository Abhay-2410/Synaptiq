import { useCallback, useEffect, useRef, useState } from 'react';
import { simplifyNotesStream, NOTES_ERROR_MESSAGE } from '../api/client';
import type { BoardId, ClassLevel, StreamId } from '../api/client';
import type { NotesPipelineStage, NotesSimplifyResult } from '../types';
import type { SubjectKey } from '../curriculum';
import { getSubjectMeta } from '../curriculum';

const MAX_BYTES = 10 * 1024 * 1024;
const TOOLTIP_KEY = 'synaptiq_notes_tooltip_seen';

const STAGE_LABELS: Record<NotesPipelineStage, string> = {
  upload: 'Sending your file',
  extract: 'Reading your notes',
  simplify: 'Rewriting simply',
  pdf: 'Making study sheet',
  done: 'All done!',
  error: 'Something went wrong',
};

const WAITING_TIPS = [
  'This usually takes 30–60 seconds — hang tight!',
  'Tip: Hold your phone straight above the page.',
  'Tip: Good lighting helps us read handwriting.',
  'Tip: One page at a time works best.',
  'Tip: Keep the page flat on your desk.',
];

export interface NotesSimplifierContext {
  boardId: BoardId;
  classLevel: ClassLevel;
  streamId?: StreamId;
  subject: SubjectKey;
}

type PanelState = 'idle' | 'processing' | 'error';

function isPhotoReadError(message: string): boolean {
  return /could not read|retake|clearer photo|unreadable|hard to read/i.test(message);
}

export function useNotesTooltip(): { showTooltip: boolean; dismissTooltip: () => void } {
  const [showTooltip, setShowTooltip] = useState(false);

  useEffect(() => {
    if (!localStorage.getItem(TOOLTIP_KEY)) {
      setShowTooltip(true);
    }
  }, []);

  const dismissTooltip = useCallback(() => {
    localStorage.setItem(TOOLTIP_KEY, '1');
    setShowTooltip(false);
  }, []);

  return { showTooltip, dismissTooltip };
}

export function useNotesSimplifier(
  context: NotesSimplifierContext,
  disabled?: boolean,
  onComplete?: (result: NotesSimplifyResult, fileName: string) => void,
) {
  const [panelState, setPanelState] = useState<PanelState>('idle');
  const [stage, setStage] = useState<NotesPipelineStage>('upload');
  const [stageMessage, setStageMessage] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [fileName, setFileName] = useState<string | null>(null);
  const [tipIndex, setTipIndex] = useState(0);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);
  const abortRef = useRef<AbortController | null>(null);

  const { boardId, classLevel, streamId, subject } = context;

  useEffect(() => {
    if (panelState !== 'processing') return;
    const interval = setInterval(() => {
      setTipIndex((i) => (i + 1) % WAITING_TIPS.length);
    }, 5000);
    return () => clearInterval(interval);
  }, [panelState]);

  const reset = useCallback(() => {
    abortRef.current?.abort();
    abortRef.current = null;
    setPanelState('idle');
    setStage('upload');
    setStageMessage('');
    setError(null);
    setFileName(null);
    setTipIndex(0);
    if (fileInputRef.current) fileInputRef.current.value = '';
    if (cameraInputRef.current) cameraInputRef.current.value = '';
  }, []);

  const cancel = useCallback(() => {
    abortRef.current?.abort();
    reset();
  }, [reset]);

  const openFilePicker = useCallback(() => {
    if (disabled || panelState === 'processing') return;
    fileInputRef.current?.click();
  }, [disabled, panelState]);

  const openCamera = useCallback(() => {
    if (disabled || panelState === 'processing') return;
    cameraInputRef.current?.click();
  }, [disabled, panelState]);

  const handleFile = useCallback(
    async (file: File) => {
      if (disabled) return;

      if (file.size > MAX_BYTES) {
        setPanelState('error');
        setError(
          'That file is a bit too big (max 10 MB). Try photographing just one page instead of the whole notebook.',
        );
        return;
      }

      const okType =
        file.type === 'application/pdf' ||
        file.type === 'image/jpeg' ||
        file.type === 'image/png' ||
        file.type === 'image/jpg' ||
        /\.(pdf|jpe?g|png)$/i.test(file.name);

      if (!okType) {
        setPanelState('error');
        setError('Please upload a photo (JPG/PNG) or a PDF of your notes.');
        return;
      }

      abortRef.current?.abort();
      const controller = new AbortController();
      abortRef.current = controller;

      setPanelState('processing');
      setStage('upload');
      setStageMessage('Sending your notes…');
      setError(null);
      setFileName(file.name);
      setTipIndex(0);

      try {
        await simplifyNotesStream({
          file,
          boardId,
          subjectId: subject,
          classLevel,
          streamId: classLevel >= 11 ? streamId : undefined,
          signal: controller.signal,
          onEvent: (event) => {
            if (event.type === 'status') {
              setStage(event.stage);
              setStageMessage(event.message);
            } else if (event.type === 'done') {
              onComplete?.(event.result, file.name);
              reset();
            } else if (event.type === 'error') {
              setError(event.message);
              setPanelState('error');
              setStage('error');
            }
          },
        });
      } catch (err) {
        if (controller.signal.aborted) {
          reset();
          return;
        }
        setError(err instanceof Error ? err.message : NOTES_ERROR_MESSAGE);
        setPanelState('error');
        setStage('error');
      }
    },
    [boardId, classLevel, streamId, subject, disabled, onComplete, reset],
  );

  const onInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) void handleFile(file);
  };

  const notesBusy = panelState === 'processing';
  const subjectLabel = getSubjectMeta(subject).label;

  return {
    panelState,
    stage,
    stageMessage,
    error,
    fileName,
    fileInputRef,
    cameraInputRef,
    notesBusy,
    tipIndex,
    waitingTip: WAITING_TIPS[tipIndex],
    subjectLabel,
    classLevel,
    openFilePicker,
    openCamera,
    onInputChange,
    reset,
    cancel,
  };
}

interface NotesUploadStatusProps {
  panelState: PanelState;
  stage: NotesPipelineStage;
  stageMessage: string;
  error: string | null;
  fileName: string | null;
  waitingTip: string;
  onCancel: () => void;
  onReset: () => void;
}

function PhotoTipsChecklist() {
  return (
    <ul className="notes-photo-tips" aria-label="Tips for a clearer photo">
      <li className="notes-tip-ok">Page flat on your desk</li>
      <li className="notes-tip-ok">Bright light, no shadows</li>
      <li className="notes-tip-ok">One page at a time</li>
      <li className="notes-tip-bad">Avoid blurry or tilted photos</li>
    </ul>
  );
}

export function NotesUploadStatus({
  panelState,
  stage,
  stageMessage,
  error,
  fileName,
  waitingTip,
  onCancel,
  onReset,
}: NotesUploadStatusProps) {
  if (panelState === 'idle') return null;

  return (
    <div className="notes-upload-status" role="region" aria-label="Notes upload status">
      {panelState === 'processing' && (
        <div className="notes-progress" role="status" aria-live="polite">
          <p className="notes-progress-title">Working on your notes…</p>
          <p className="notes-file-label">{fileName}</p>
          <ol className="notes-stages">
            {(['upload', 'extract', 'simplify', 'pdf'] as const).map((s) => {
              const order = ['upload', 'extract', 'simplify', 'pdf'];
              const current = order.indexOf(stage);
              const idx = order.indexOf(s);
              const status = idx < current ? 'done' : idx === current ? 'active' : 'pending';
              return (
                <li key={s} className={`notes-stage notes-stage--${status}`}>
                  <span className="notes-stage-dot" />
                  <span className="notes-stage-label">{STAGE_LABELS[s]}</span>
                </li>
              );
            })}
          </ol>
          <p className="notes-stage-message">{stageMessage}</p>
          <p className="notes-waiting-tip">{waitingTip}</p>
          <button type="button" className="notes-cancel-btn" onClick={onCancel}>
            Cancel
          </button>
        </div>
      )}

      {panelState === 'error' && (
        <div className="notes-error" role="alert">
          <p className="notes-error-title">We couldn't read that one</p>
          <p>{error ?? NOTES_ERROR_MESSAGE}</p>
          {error && isPhotoReadError(error) && <PhotoTipsChecklist />}
          <button type="button" className="notes-reset-btn" onClick={onReset}>
            Try another photo
          </button>
        </div>
      )}
    </div>
  );
}
