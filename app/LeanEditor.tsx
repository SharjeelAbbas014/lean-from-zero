"use client";

import { useEffect, useMemo, useState } from "react";
import { buildLeanPlaygroundUrl } from "./lean-playground";

type LeanEditorProps = {
  code: string;
  title?: string;
};

export default function LeanEditor({ code, title = "Lean lab" }: LeanEditorProps) {
  const [editorCode, setEditorCode] = useState(code);
  const [mobile, setMobile] = useState(false);
  const [iframeKey, setIframeKey] = useState(0);
  const [iframeFailed, setIframeFailed] = useState(false);

  useEffect(() => {
    setEditorCode(code);
    setIframeFailed(false);
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

  return (
    <section className="lean-editor" aria-label={title}>
      <div className="lean-editor-bar">
        <span>{title}</span>
        <div className="lean-editor-actions">
          <button type="button" onClick={() => { setEditorCode(code); setIframeKey((k) => k + 1); }}>
            Reload lab
          </button>
          <button
            type="button"
            onClick={() => window.open(playgroundUrl, "_blank", "noopener,noreferrer")}
          >
            Open fullscreen
          </button>
        </div>
      </div>
      <p className="lean-editor-note">
        Real Lean runs on live.lean-lang.org — this page embeds it. Edit below the fold in the editor; goals appear in the Infoview.
      </p>
      {iframeFailed ? (
        <div className="lean-editor-fallback">
          <p>The embed did not load. Open the lab directly instead.</p>
          <a href={playgroundUrl} target="_blank" rel="noreferrer">Open lab in Lean</a>
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
