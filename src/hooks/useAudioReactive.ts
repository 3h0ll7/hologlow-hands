import { useCallback, useEffect, useRef, useState } from 'react';

interface AudioLevels {
  bass: number;
  mids: number;
  highs: number;
}

const EMPTY_LEVELS: AudioLevels = { bass: 0, mids: 0, highs: 0 };

export function useAudioReactive(enabled: boolean) {
  const analyserRef = useRef<AnalyserNode | null>(null);
  const dataRef = useRef<Uint8Array | null>(null);
  const levelsRef = useRef<AudioLevels>(EMPTY_LEVELS);
  const [levels, setLevels] = useState<AudioLevels>(EMPTY_LEVELS);

  useEffect(() => {
    let stream: MediaStream | null = null;
    let audioContext: AudioContext | null = null;
    let cancelled = false;

    if (!enabled || !navigator.mediaDevices?.getUserMedia) {
      levelsRef.current = EMPTY_LEVELS;
      setLevels(EMPTY_LEVELS);
      return;
    }

    navigator.mediaDevices.getUserMedia({ audio: true }).then((input) => {
      if (cancelled) {
        input.getTracks().forEach(track => track.stop());
        return;
      }
      stream = input;
      audioContext = new AudioContext();
      const analyser = audioContext.createAnalyser();
      analyser.fftSize = 256;
      const source = audioContext.createMediaStreamSource(input);
      source.connect(analyser);
      analyserRef.current = analyser;
      dataRef.current = new Uint8Array(analyser.frequencyBinCount);
    }).catch(() => {
      levelsRef.current = EMPTY_LEVELS;
      setLevels(EMPTY_LEVELS);
    });

    return () => {
      cancelled = true;
      analyserRef.current = null;
      dataRef.current = null;
      levelsRef.current = EMPTY_LEVELS;
      setLevels(EMPTY_LEVELS);
      stream?.getTracks().forEach(track => track.stop());
      audioContext?.close();
    };
  }, [enabled]);

  const sample = useCallback(() => {
    if (!enabled || !analyserRef.current || !dataRef.current) return levelsRef.current;
    const data = dataRef.current as Uint8Array;
    analyserRef.current.getByteFrequencyData(data as unknown as Uint8Array<ArrayBuffer>);
    const next = {
      bass: average(Array.from(data.slice(0, 10))) / 255,
      mids: average(Array.from(data.slice(10, 50))) / 255,
      highs: average(Array.from(data.slice(50, 128))) / 255,
    };
    levelsRef.current = next;
    setLevels((prev) => (
      prev.bass === next.bass && prev.mids === next.mids && prev.highs === next.highs ? prev : next
    ));
    return next;
  }, [enabled]);

  return { levels, levelsRef, sample };
}

function average(values: number[]) {
  if (!values.length) return 0;
  return values.reduce((sum, value) => sum + value, 0) / values.length;
}
