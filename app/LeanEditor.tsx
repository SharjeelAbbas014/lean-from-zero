"use client";

import { useEffect, useMemo, useState } from "react";
import { buildLeanPlaygroundUrl } from "./lean-playground";

type LeanEditorProps = {
  code: string;
  solution?: string;
  title?: string;
};

export default function LeanEditor({ code, solution, title = "Lean lab" }: LeanEditorProps) {
  const [editorCode, setEditorCode] = useState(code);
  const [mobile, setMobile] = useState(false);
  const [iframeKey, setIframeKey] = useState(0);
  const [iframeFailed, setIframeFailed] = useState(false);
  const [expanded, setExpanded] = useState(false);

  useEffect(() => {
    setEditorCode(code);
    setIframeFailed(false);
    setExpanded(false);
  }, [code]);

  useEffect(() => {
    const query = window.matchMedia("(max-width: 768px)");
    setMobile(query.matches);
    const onChange = (event: MediaQueryListEvent) => setMobile(event.matches);
    query.addEventListener("change", onChange);
    return () => query.removeEventListener("change", onChange);
  }, []);

  const playgroundUrl = useMemo(
    () => buildLeanPlaygroundUrl(editorCode, mobile),
    [editorCode, mobile],
  );

  function reloadWith(next: string) {
    setEditorCode(next);
    setIframeFailed(false);
    setIframeKey((key) => key + 1);
  }

  return (
    <section className="lean-editor" aria-label={title}>
      <div className="lean-editor-bar">
        <span>{title}</span>
        <div className="lean-editor-actions">
          {!expanded && (
            <button type="button" onClick={() => setExpanded(true)}>
              Open Lean lab
            </button>
          )}
          {expanded && (
            <button type="button" onClick={() => reloadWith(code)}>
              Reload lab
            </button>
          )}
          {expanded && solution && (
            <button type="button" onClick={() => reloadWith(solution)}>
              Load solution
            </button>
          )}
          <a href={playgroundUrl} target="_blank" rel="noreferrer">
            Open fullscreen
          </a>
        </div>
      </div>
      <p className="lean-editor-note">
        Real Lean runs on live.lean-lang.org — this page embeds it. Edit in the frame; goals appear in the Infoview.
      </p>
      {!expanded ? (
        <button type="button" className="lean-editor-launch" onClick={() => setExpanded(true)}>
          Load interactive Lean editor for this lab
        </button>
      ) : iframeFailed ? (
        <div className="lean-editor-fallback">
          <p>The embed did not load. Open the lab directly instead.</p>
          <a href={playgroundUrl} target="_blank" rel="noreferrer">
            Open lab in Lean
          </a>
        </div>
      ) : (
        <iframe
          key={iframeKey}
          title={title}
          src={playgroundUrl}
          className="lean-editor-frame"
          loading="lazy"
          referrerPolicy="no-referrer"
          onError={() => setIframeFailed(true)}
        />
      )}
    </section>
  );
}
