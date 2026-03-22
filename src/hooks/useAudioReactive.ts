import { useCallback, useEffect, useRef, useState } from 'react';

export function useAudioReactive(enabled: boolean) {
  const analyserRef = useRef<AnalyserNode | null>(null);
  const dataRef = useRef<Uint8Array | null>(null);
  const [levels, setLevels] = useState({ bass: 0, mids: 0, highs: 0 });

  useEffect(() => {
    let stream: MediaStream | null = null;
    let audioContext: AudioContext | null = null;

    if (!enabled) return;

    navigator.mediaDevices.getUserMedia({ audio: true }).then((input) => {
      stream = input;
      audioContext = new AudioContext();
      const analyser = audioContext.createAnalyser();
      analyser.fftSize = 256;
      const source = audioContext.createMediaStreamSource(input);
      source.connect(analyser);
      analyserRef.current = analyser;
      dataRef.current = new Uint8Array(analyser.frequencyBinCount);
    }).catch(() => {
      setLevels({ bass: 0, mids: 0, highs: 0 });
    });

    return () => {
      stream?.getTracks().forEach(track => track.stop());
      audioContext?.close();
    };
  }, [enabled]);

  const sample = useCallback(() => {
    if (!enabled || !analyserRef.current || !dataRef.current) return levels;
    analyserRef.current.getByteFrequencyData(dataRef.current);
    const bass = average(dataRef.current.slice(0, 10)) / 255;
    const mids = average(dataRef.current.slice(10, 50)) / 255;
    const highs = average(dataRef.current.slice(50, 128)) / 255;
    const next = { bass, mids, highs };
    setLevels(next);
    return next;
  }, [enabled, levels]);

  return { levels, sample };
}

function average(values: Uint8Array) {
  if (!values.length) return 0;
  return values.reduce((sum, value) => sum + value, 0) / values.length;
}
