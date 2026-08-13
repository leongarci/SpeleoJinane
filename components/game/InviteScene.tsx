"use client";

import { useState } from "react";
import { PixelButton } from "./PixelButton";
import { PARCOURS } from "@/lib/parcours";
import {
  formatDateFr,
  mondayOffset,
  septemberDays,
  toIsoDate,
} from "@/lib/dates";
import type { DurationId, Rsvp } from "@/lib/types";
import { blip } from "@/lib/audio";

const WEEK = ["L", "M", "M", "J", "V", "S", "D"];

type Props = {
  onDone: (rsvp: Rsvp) => void;
};

export function InviteScene({ onDone }: Props) {
  const [step, setStep] = useState<"ask" | "duration" | "date" | "sending" | "error">(
    "ask",
  );
  const [coming, setComing] = useState<boolean | null>(null);
  const [duration, setDuration] = useState<DurationId | null>(null);
  const [day, setDay] = useState<number | null>(null);
  const [error, setError] = useState("");

  const submit = async (payload: Rsvp) => {
    setStep("sending");
    try {
      const res = await fetch("/api/rsvp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) {
        const data = (await res.json().catch(() => ({}))) as { error?: string };
        throw new Error(data.error || "Envoi impossible");
      }
      onDone(payload);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Envoi impossible");
      setStep("error");
    }
  };

  return (
    <div className="scene">
      <div
        className="scene-bg"
        style={{ backgroundImage: "url(/assets/cave-bg.png)" }}
      />
      <div className="scene-shade" />
      <div className="invite-layout">
        {step === "ask" ? (
          <>
            <div className="portrait portrait-leon">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/assets/leon-spelunker.png" alt="Léon" />
            </div>
            <div className="dialogue">
              <p>Tu as traversé l&apos;océan. Tu as exploré la mine. Tu as descendu les puits.</p>
              <p>Jinane… tu viens faire de la spéléo avec moi ?</p>
              <p className="hint">— Léon</p>
            </div>
            <div className="btn-row">
              <PixelButton
                variant="yes"
                onClick={() => {
                  blip(true);
                  setComing(true);
                  setStep("duration");
                }}
              >
                Oui
              </PixelButton>
              <PixelButton
                variant="danger"
                onClick={() => {
                  blip(false);
                  const payload: Rsvp = { coming: false, duration: null, date: null };
                  setComing(false);
                  void submit(payload);
                }}
              >
                Non
              </PixelButton>
            </div>
          </>
        ) : null}

        {step === "duration" ? (
          <>
            <h2 className="invite-h">Quelle expédition ?</h2>
            <p className="invite-lead">Parc Tellure · Sainte-Marie-aux-Mines</p>
            <div className="cards">
              {PARCOURS.map((p) => (
                <button
                  key={p.id}
                  type="button"
                  className={`card ${duration === p.id ? "card-on" : ""}`}
                  onClick={() => {
                    blip(true);
                    setDuration(p.id);
                  }}
                >
                  <span className="card-h">{p.hours}</span>
                  <span className="card-t">{p.title}</span>
                  <span className="card-s">{p.subtitle}</span>
                  <span className="card-b">{p.blurb}</span>
                </button>
              ))}
            </div>
            <PixelButton
              disabled={!duration}
              onClick={() => duration && setStep("date")}
            >
              Choisir la date
            </PixelButton>
          </>
        ) : null}

        {step === "date" ? (
          <>
            <h2 className="invite-h">Quel jour ?</h2>
            <p className="invite-lead">Septembre 2026 · 1–22 tous les jours, puis weekends</p>
            <div className="cal">
              {WEEK.map((d, i) => (
                <span key={`${d}-${i}`} className="cal-hd">
                  {d}
                </span>
              ))}
              {Array.from({ length: mondayOffset() }).map((_, i) => (
                <span key={`e-${i}`} />
              ))}
              {septemberDays().map(({ day: d, selectable }) => (
                <button
                  key={d}
                  type="button"
                  disabled={!selectable}
                  className={`cal-day ${day === d ? "cal-on" : ""} ${selectable ? "" : "cal-off"}`}
                  onClick={() => {
                    blip(true);
                    setDay(d);
                  }}
                >
                  {d}
                </button>
              ))}
            </div>
            {day ? (
              <p className="hint">{formatDateFr(String(day))}</p>
            ) : null}
            <PixelButton
              disabled={!day || !duration}
              onClick={() => {
                if (!day || !duration) return;
                void submit({
                  coming: true,
                  duration,
                  date: toIsoDate(day),
                });
              }}
            >
              Envoyer à Léon
            </PixelButton>
          </>
        ) : null}

        {step === "sending" ? (
          <div className="dialogue">
            <p>{coming === false ? "D'accord…" : "La chauve-souris part avec le message…"}</p>
          </div>
        ) : null}

        {step === "error" ? (
          <>
            <div className="dialogue">
              <p>Le message s&apos;est perdu dans la mine.</p>
              <p className="hint">{error}</p>
            </div>
            <PixelButton
              onClick={() =>
                void submit({
                  coming: coming ?? false,
                  duration,
                  date: day ? toIsoDate(day) : null,
                })
              }
            >
              Réessayer
            </PixelButton>
          </>
        ) : null}
      </div>
    </div>
  );
}
