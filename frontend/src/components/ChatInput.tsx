import { useCallback, useEffect, useRef, useState, type FormEvent, type KeyboardEvent } from 'react';
import {
  NotesUploadStatus,
  useNotesSimplifier,
  useNotesTooltip,
  type NotesSimplifierContext,
} from './NotesSimplifierPanel';
import type { NotesSimplifyResult } from '../types';
import { isTouchMobile } from '../utils/device';

interface ChatInputProps {
  onSend: (text: string) => void;
  disabled?: boolean;
  notesContext: NotesSimplifierContext;
  onNotesComplete?: (result: NotesSimplifyResult, fileName: string) => void;
  onRegisterNotesUpload?: (open: () => void) => void;
}

export function ChatInput({
  onSend,
  disabled,
  notesContext,
  onNotesComplete,
  onRegisterNotesUpload,
}: ChatInputProps) {
  const [text, setText] = useState('');
  const [showUploadMenu, setShowUploadMenu] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  const { showTooltip, dismissTooltip } = useNotesTooltip();

  const notes = useNotesSimplifier(notesContext, disabled, onNotesComplete);
  const inputDisabled = disabled || notes.notesBusy;

  useEffect(() => {
    onRegisterNotesUpload?.(() => {
      if (isTouchMobile()) {
        setShowUploadMenu(true);
      } else {
        notes.openFilePicker();
      }
    });
  }, [onRegisterNotesUpload, notes.openFilePicker]);

  useEffect(() => {
    if (!showUploadMenu) return;
    const onClickOutside = (e: MouseEvent | TouchEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setShowUploadMenu(false);
      }
    };
    document.addEventListener('mousedown', onClickOutside);
    document.addEventListener('touchstart', onClickOutside, { passive: true });
    return () => {
      document.removeEventListener('mousedown', onClickOutside);
      document.removeEventListener('touchstart', onClickOutside);
    };
  }, [showUploadMenu]);

  const submit = useCallback(() => {
    const trimmed = text.trim();
    if (!trimmed || inputDisabled) return;
    onSend(trimmed);
    setText('');
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
    }
  }, [text, inputDisabled, onSend]);

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    submit();
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      submit();
    }
  };

  const handleInput = () => {
    const el = textareaRef.current;
    if (!el) return;
    el.style.height = 'auto';
    el.style.height = `${Math.min(el.scrollHeight, 140)}px`;
  };

  const handleNotesButtonClick = () => {
    dismissTooltip();
    if (isTouchMobile()) {
      setShowUploadMenu((v) => !v);
      return;
    }
    notes.openFilePicker();
  };

  const handleChooseFile = () => {
    setShowUploadMenu(false);
    dismissTooltip();
    notes.openFilePicker();
  };

  const handleTakePhoto = () => {
    setShowUploadMenu(false);
    dismissTooltip();
    notes.openCamera();
  };

  return (
    <div className="input-area">
      <NotesUploadStatus
        panelState={notes.panelState}
        stage={notes.stage}
        stageMessage={notes.stageMessage}
        error={notes.error}
        fileName={notes.fileName}
        waitingTip={notes.waitingTip}
        onCancel={notes.cancel}
        onReset={notes.reset}
      />

      <form className="input-form" onSubmit={handleSubmit}>
        <div className="input-wrapper">
          <textarea
            ref={textareaRef}
            value={text}
            onChange={(e) => setText(e.target.value)}
            onInput={handleInput}
            onKeyDown={handleKeyDown}
            placeholder="Ask your doubt…"
            disabled={inputDisabled}
            rows={1}
          />
        </div>

        <div className="input-actions" ref={menuRef}>
          {showTooltip && notes.panelState === 'idle' && (
            <div className="notes-first-tooltip" role="tooltip">
              <p>📸 Photo your messy notes — we'll rewrite them for your class!</p>
              <button type="button" className="notes-tooltip-dismiss" onClick={dismissTooltip}>
                Got it
              </button>
            </div>
          )}

          <div className="notes-upload-wrap">
            <button
              type="button"
              className="notes-upload-btn"
              onClick={handleNotesButtonClick}
              disabled={inputDisabled}
              aria-label="Fix my notes — upload a photo or PDF"
              title="Upload notes (photo or PDF)"
            >
              <svg
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden
              >
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                <polyline points="14 2 14 8 20 8" />
                <line x1="12" y1="18" x2="12" y2="12" />
                <line x1="9" y1="15" x2="15" y2="15" />
              </svg>
              <span className="notes-upload-label">Fix my notes</span>
            </button>

            {showUploadMenu && (
              <div className="notes-upload-menu" role="menu">
                <button type="button" className="notes-upload-menu-item" onClick={handleTakePhoto}>
                  📷 Take photo
                </button>
                <button type="button" className="notes-upload-menu-item" onClick={handleChooseFile}>
                  📁 Choose file
                </button>
              </div>
            )}
          </div>

          <input
            ref={notes.fileInputRef}
            type="file"
            accept=".jpg,.jpeg,.png,.pdf,image/jpeg,image/png,application/pdf"
            onChange={notes.onInputChange}
            disabled={inputDisabled}
            hidden
          />
          <input
            ref={notes.cameraInputRef}
            type="file"
            accept="image/jpeg,image/png,image/jpg"
            capture="environment"
            onChange={notes.onInputChange}
            disabled={inputDisabled}
            hidden
          />

          <button
            type="submit"
            className="send-btn"
            disabled={inputDisabled || !text.trim()}
            aria-label="Send"
          >
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <line x1="22" y1="2" x2="11" y2="13" />
              <polygon points="22 2 15 22 11 13 2 9 22 2" />
            </svg>
          </button>
        </div>
      </form>

      <div className="input-hint">Press Enter to send · Shift+Enter for a new line</div>
    </div>
  );
}
