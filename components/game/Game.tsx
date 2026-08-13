"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { TitleScene } from "./TitleScene";
import { StoryScene } from "./StoryScene";
import { BeachGame } from "./BeachGame";
import { MazeGame } from "./MazeGame";
import { RappelGame } from "./RappelGame";
import { InviteScene } from "./InviteScene";
import { EndingScene } from "./EndingScene";
import { MuteButton } from "./MuteButton";
import { STORIES } from "@/lib/story";
import { setMuted, startMusic, unlockAudio } from "@/lib/audio";
import type { Rsvp, SceneId } from "@/lib/types";

const EMPTY: Rsvp = { coming: null, duration: null, date: null };

export function Game() {
  const [scene, setScene] = useState<SceneId>("title");
  const [muted, setMutedState] = useState(false);
  const [rsvp, setRsvp] = useState<Rsvp>(EMPTY);

  useEffect(() => {
    const saved = window.localStorage.getItem("speleo-mute");
    if (saved === "1") {
      setMutedState(true);
      setMuted(true);
    }
  }, []);

  const toggleMute = useCallback(() => {
    setMutedState((m) => {
      const next = !m;
      window.localStorage.setItem("speleo-mute", next ? "1" : "0");
      setMuted(next);
      if (!next) {
        unlockAudio();
        startMusic();
      }
      return next;
    });
  }, []);

  const play = useCallback(() => {
    unlockAudio();
    startMusic();
    setMuted(muted);
    setScene("story-beach");
  }, [muted]);

  const story = useMemo(
    () => STORIES.find((s) => s.id === scene) ?? null,
    [scene],
  );

  return (
    <div className="shell">
      <MuteButton muted={muted} onToggle={toggleMute} />
      {scene === "title" ? <TitleScene onPlay={play} /> : null}
      {story ? (
        <StoryScene beat={story} onNext={() => setScene(story.next)} />
      ) : null}
      {scene === "beach" ? (
        <BeachGame onWin={() => setScene("story-flight")} />
      ) : null}
      {scene === "maze" ? (
        <MazeGame onWin={() => setScene("story-rappel")} />
      ) : null}
      {scene === "rappel" ? (
        <RappelGame onWin={() => setScene("invite")} />
      ) : null}
      {scene === "invite" ? (
        <InviteScene
          onDone={(value) => {
            setRsvp(value);
            setScene("ending");
          }}
        />
      ) : null}
      {scene === "ending" ? (
        <EndingScene
          rsvp={rsvp}
          onReplay={() => {
            setRsvp(EMPTY);
            setScene("title");
          }}
        />
      ) : null}
      {scene === "title" || scene === "ending" ? (
        <p className="credit">Tuiles mine · Kenney.nl (CC0)</p>
      ) : null}
    </div>
  );
}
