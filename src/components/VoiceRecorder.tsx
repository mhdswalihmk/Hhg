import React, { useState, useRef, useEffect } from 'react';
import { Mic, Square, Trash2, Play, Pause, RefreshCw } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface VoiceRecorderProps {
  onRecordingComplete: (base64Audio: string) => void;
  onCancel: () => void;
}

export const VoiceRecorder: React.FC<VoiceRecorderProps> = ({ onRecordingComplete, onCancel }) => {
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [base64Audio, setBase64Audio] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [permissionError, setPermissionError] = useState<string | null>(null);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const audioPlaybackRef = useRef<HTMLAudioElement | null>(null);
  const visualIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const [waveHeights, setWaveHeights] = useState<number[]>(new Array(15).fill(4));

  // Handle timer
  useEffect(() => {
    if (isRecording) {
      timerRef.current = setInterval(() => {
        setRecordingTime((prev) => {
          if (prev >= 60) {
            // Auto stop at 60 seconds
            stopRecording();
            return 60;
          }
          return prev + 1;
        });
      }, 1000);

      // Simulate wave visualizer
      visualIntervalRef.current = setInterval(() => {
        setWaveHeights(
          Array.from({ length: 15 }, () => Math.floor(Math.random() * 32) + 6)
        );
      }, 120);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
      if (visualIntervalRef.current) clearInterval(visualIntervalRef.current);
      setWaveHeights(new Array(15).fill(4));
    }

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
      if (visualIntervalRef.current) clearInterval(visualIntervalRef.current);
    };
  }, [isRecording]);

  // Handle playback events
  useEffect(() => {
    if (audioUrl) {
      audioPlaybackRef.current = new Audio(audioUrl);
      const audio = audioPlaybackRef.current;

      const handleEnded = () => setIsPlaying(false);
      audio.addEventListener('ended', handleEnded);

      return () => {
        audio.removeEventListener('ended', handleEnded);
        audio.pause();
      };
    }
  }, [audioUrl]);

  const startRecording = async () => {
    audioChunksRef.current = [];
    setAudioUrl(null);
    setBase64Audio(null);
    setPermissionError(null);

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = async () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        const url = URL.createObjectURL(audioBlob);
        setAudioUrl(url);

        // Convert to Base64 for database upload
        const reader = new FileReader();
        reader.readAsDataURL(audioBlob);
        reader.onloadend = () => {
          const base64data = reader.result as string;
          setBase64Audio(base64data);
        };

        // Stop all stream tracks to release microphone
        stream.getTracks().forEach((track) => track.stop());
      };

      mediaRecorder.start(100); // chunk interval
      setIsRecording(true);
      setRecordingTime(0);
    } catch (err: any) {
      console.error('Microphone access denied:', err);
      setPermissionError('Microphone permission denied. Please allow microphone in settings.');
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  };

  const togglePlayback = () => {
    if (!audioPlaybackRef.current) return;
    if (isPlaying) {
      audioPlaybackRef.current.pause();
      setIsPlaying(false);
    } else {
      audioPlaybackRef.current.play();
      setIsPlaying(true);
    }
  };

  const handleSave = () => {
    if (base64Audio) {
      onRecordingComplete(base64Audio);
    }
  };

  const handleReset = () => {
    setAudioUrl(null);
    setBase64Audio(null);
    setIsPlaying(false);
    setRecordingTime(0);
    if (audioPlaybackRef.current) {
      audioPlaybackRef.current.pause();
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="flex flex-col items-center justify-center bg-brand-slate p-6 rounded-2xl border border-brand-gold/20 shadow-xl max-w-sm mx-auto">
      <h3 className="font-display text-lg font-semibold text-brand-sand mb-2 flex items-center gap-2">
        <Mic className="text-brand-gold w-5 h-5 animate-pulse" />
        Record Voice Note
      </h3>
      <p className="text-xs text-gray-400 mb-6 text-center">
        Share your voice with close friends privately. Max 60 seconds.
      </p>

      {permissionError && (
        <div className="bg-red-900/40 text-red-300 text-xs p-3 rounded-lg border border-red-500/30 mb-4 text-center">
          {permissionError}
        </div>
      )}

      {/* Visualizer and Time */}
      <div className="w-full bg-brand-charcoal border border-gray-800 rounded-xl py-4 px-6 flex flex-col items-center justify-center mb-6">
        <div className="text-3xl font-mono text-brand-gold mb-3 font-semibold">
          {formatTime(recordingTime)}
        </div>

        {/* Bouncing Audio Waves */}
        <div className="flex items-center gap-1.5 h-12">
          {waveHeights.map((height, idx) => (
            <motion.div
              key={idx}
              className={`w-1 rounded-full ${isRecording ? 'bg-brand-gold' : 'bg-gray-700'}`}
              animate={{ height }}
              transition={{ type: 'spring', stiffness: 300, damping: 20 }}
            />
          ))}
        </div>
      </div>

      {/* Control Buttons */}
      <div className="flex items-center justify-center gap-6 w-full">
        {!audioUrl && !isRecording && (
          <button
            onClick={startRecording}
            className="w-16 h-16 rounded-full bg-brand-gold hover:bg-brand-gold-dark text-brand-charcoal flex items-center justify-center shadow-lg transition-colors scale-100 hover:scale-105 active:scale-95 duration-200"
            id="start-rec-btn"
          >
            <Mic className="w-7 h-7" />
          </button>
        )}

        {isRecording && (
          <button
            onClick={stopRecording}
            className="w-16 h-16 rounded-full bg-red-600 hover:bg-red-700 text-white flex items-center justify-center shadow-lg animate-pulse scale-100 hover:scale-105 active:scale-95 duration-200"
            id="stop-rec-btn"
          >
            <Square className="w-7 h-7 fill-white" />
          </button>
        )}

        {audioUrl && (
          <div className="flex items-center gap-4 w-full justify-around animate-fade-in">
            {/* Playback */}
            <button
              onClick={togglePlayback}
              className="w-12 h-12 rounded-full bg-gray-800 border border-gray-700 hover:bg-gray-700 text-brand-gold flex items-center justify-center transition-colors"
            >
              {isPlaying ? <Square className="w-5 h-5 fill-brand-gold" /> : <Play className="w-5 h-5 ml-0.5 fill-brand-gold" />}
            </button>

            {/* Reset / Redo */}
            <button
              onClick={handleReset}
              className="w-12 h-12 rounded-full bg-gray-800 border border-gray-700 hover:bg-gray-700 text-gray-400 hover:text-white flex items-center justify-center transition-colors"
              title="Record Again"
            >
              <RefreshCw className="w-5 h-5" />
            </button>

            {/* Accept / Done */}
            <button
              onClick={handleSave}
              className="flex-1 py-3 px-4 rounded-xl bg-brand-gold hover:bg-brand-gold-dark text-brand-charcoal font-semibold text-sm transition-colors text-center shadow-md shadow-brand-gold/20"
            >
              Attach Audio
            </button>
          </div>
        )}
      </div>

      <button
        onClick={onCancel}
        disabled={isRecording}
        className="mt-6 text-xs text-gray-500 hover:text-gray-300 transition-colors flex items-center gap-1.5 disabled:opacity-50"
      >
        <Trash2 className="w-3.5 h-3.5" />
        Cancel recording
      </button>
    </div>
  );
};
