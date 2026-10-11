"use client";

import * as React from "react";

import Image from "next/image";
import { CameraIcon, UploadIcon } from "lucide-react";

import { cn } from "@/lib/utils";
import { getFaceLandmarker, type NormalizedLandmark } from "@/lib/face/mediapipe";

type AnalyzerStatus = "idle" | "loading" | "ready" | "analyzing" | "error" | "no-face";

interface BaseAnalyzerProps {
  title: string;
  description: string;
  badges: string[];
  onAnalyze: (
    landmarks: NormalizedLandmark[],
    imageData: ImageData,
    width: number,
    height: number,
  ) => void;
  children?: React.ReactNode;
}

export function FaceAnalyzer({
  title,
  description,
  badges,
  onAnalyze,
  children,
}: BaseAnalyzerProps) {
  const fileInputRef = React.useRef<HTMLInputElement>(null);
  const videoRef = React.useRef<HTMLVideoElement>(null);
  const canvasRef = React.useRef<HTMLCanvasElement>(null);
  const [status, setStatus] = React.useState<AnalyzerStatus>("loading");
  const [errorMessage, setErrorMessage] = React.useState<string>("");
  const [previewUrl, setPreviewUrl] = React.useState<string | null>(null);
  const [useCamera, setUseCamera] = React.useState(false);
  const [mediaStream, setMediaStream] = React.useState<MediaStream | null>(null);

  // Load MediaPipe on mount
  React.useEffect(() => {
    let cancelled = false;
    getFaceLandmarker()
      .then(() => {
        if (!cancelled) setStatus("ready");
      })
      .catch((err) => {
        console.error(err);
        if (!cancelled) {
          setStatus("error");
          setErrorMessage("Failed to load face detection model.");
        }
      });
    return () => {
      cancelled = true;
    };
  }, []);

  // Cleanup camera on unmount
  React.useEffect(() => {
    return () => {
      if (mediaStream) {
        mediaStream.getTracks().forEach((t) => t.stop());
      }
    };
  }, [mediaStream]);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    await analyzeFile(file);
  };

  const analyzeFile = async (file: File) => {
    if (!file.type.startsWith("image/")) {
      setStatus("error");
      setErrorMessage("Please upload an image file.");
      return;
    }

    setStatus("analyzing");
    setPreviewUrl(URL.createObjectURL(file));
    setUseCamera(false);

    try {
      const img = new window.Image();
      img.src = URL.createObjectURL(file);
      await new Promise((resolve, reject) => {
        img.onload = resolve;
        img.onerror = reject;
      });

      const canvas = document.createElement("canvas");
      const maxDim = 800;
      let w = img.width;
      let h = img.height;
      if (w > maxDim || h > maxDim) {
        if (w > h) {
          h = Math.round((h * maxDim) / w);
          w = maxDim;
        } else {
          w = Math.round((w * maxDim) / h);
          h = maxDim;
        }
      }
      canvas.width = w;
      canvas.height = h;
      const ctx = canvas.getContext("2d")!;
      ctx.drawImage(img, 0, 0, w, h);

      const landmarker = await getFaceLandmarker();
      const result = landmarker.detect(canvas);

      if (!result.faceLandmarks || result.faceLandmarks.length === 0) {
        setStatus("no-face");
        return;
      }

      const imageData = ctx.getImageData(0, 0, w, h);
      onAnalyze(result.faceLandmarks[0], imageData, w, h);
      setStatus("ready");
    } catch (err) {
      console.error(err);
      setStatus("error");
      setErrorMessage("Failed to analyze the image. Please try another photo.");
    }
  };

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "user", width: { ideal: 640 }, height: { ideal: 640 } },
      });
      setMediaStream(stream);
      setUseCamera(true);
      setPreviewUrl(null);
      // Wait for video to be ready
      setTimeout(() => {
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          videoRef.current.play();
        }
      }, 100);
    } catch (err) {
      console.error(err);
      setStatus("error");
      setErrorMessage("Could not access camera. Please allow camera access.");
    }
  };

  const captureAndAnalyze = async () => {
    if (!videoRef.current || !mediaStream) return;

    setStatus("analyzing");

    const video = videoRef.current;
    const canvas = document.createElement("canvas");
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const ctx = canvas.getContext("2d")!;
    ctx.drawImage(video, 0, 0);

    // Stop camera
    mediaStream.getTracks().forEach((t) => t.stop());
    setMediaStream(null);
    setPreviewUrl(canvas.toDataURL());

    try {
      const landmarker = await getFaceLandmarker();
      const result = landmarker.detect(canvas);

      if (!result.faceLandmarks || result.faceLandmarks.length === 0) {
        setStatus("no-face");
        return;
      }

      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      onAnalyze(result.faceLandmarks[0], imageData, canvas.width, canvas.height);
      setStatus("ready");
    } catch (err) {
      console.error(err);
      setStatus("error");
      setErrorMessage("Failed to analyze the photo. Please try again.");
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file) analyzeFile(file);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const reset = () => {
    setStatus("ready");
    setPreviewUrl(null);
    setErrorMessage("");
    setUseCamera(false);
    if (mediaStream) {
      mediaStream.getTracks().forEach((t) => t.stop());
      setMediaStream(null);
    }
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  return (
    <div
      className={cn(
        "mx-auto mt-8 max-w-4xl scroll-mt-6 rounded-[28px] border bg-[color-mix(in_oklch,var(--canvas),var(--ink)_3%)] p-4 sm:p-6",
      )}
    >
      <div className="mb-6 text-center">
        <h2 className="text-2xl font-bold sm:text-3xl">{title}</h2>
        <p className="mt-2 text-[var(--muted-ink)]">{description}</p>
        <ul className="mt-4 flex flex-wrap justify-center gap-2">
          {badges.map((badge) => (
            <li key={badge} className="badge-brand">
              {badge}
            </li>
          ))}
        </ul>
      </div>

      <canvas ref={canvasRef} className="hidden" />

      {/* Upload / camera area */}
      {status === "loading" ? (
        <div className="flex flex-col items-center justify-center rounded-2xl border-2 border-dashed border-[var(--muted-ink)]/30 px-8 py-16 text-center">
          <div className="sparkle-spinner size-8" />
          <p className="mt-4 font-medium">Loading face analyzer…</p>
          <p className="mt-1 text-sm text-[var(--muted-ink)]">
            Preparing AI model (first load may take a few seconds)
          </p>
        </div>
      ) : status === "error" ? (
        <div className="flex flex-col items-center justify-center rounded-2xl border-2 border-dashed border-[var(--debit)]/50 px-8 py-16 text-center">
          <p className="font-medium text-[var(--debit-text)]">Something went wrong</p>
          <p className="mt-1 text-sm text-[var(--muted-ink)]">{errorMessage}</p>
          <button
            onClick={reset}
            className="pill pill-brand mt-5 px-5 py-2 text-sm"
          >
            Try again
          </button>
        </div>
      ) : status === "no-face" ? (
        <div className="flex flex-col items-center justify-center rounded-2xl border-2 border-dashed border-[var(--pop-orange)]/50 px-8 py-16 text-center">
          <p className="font-medium">No face detected</p>
          <p className="mt-1 text-sm text-[var(--muted-ink)]">
            Please use a clear front-facing photo with good lighting.
          </p>
          <button
            onClick={reset}
            className="pill pill-brand mt-5 px-5 py-2 text-sm"
          >
            Try another photo
          </button>
        </div>
      ) : useCamera ? (
        <div className="flex flex-col items-center gap-4">
          <div className="relative w-full max-w-md overflow-hidden rounded-2xl border">
            <video
              ref={videoRef}
              className="aspect-square w-full object-cover"
              playsInline
              muted
            />
          </div>
          <div className="flex gap-3">
            <button
              onClick={captureAndAnalyze}
              disabled={status === "analyzing"}
              className="pill pill-brand px-6 py-2.5 text-sm font-medium"
            >
              {status === "analyzing" ? "Analyzing…" : "Capture & Analyze"}
            </button>
            <button
              onClick={reset}
              className="pill px-6 py-2.5 text-sm"
            >
              Cancel
            </button>
          </div>
        </div>
      ) : previewUrl ? (
        <div className="flex flex-col items-center gap-4">
          <div className="relative w-full max-w-md overflow-hidden rounded-2xl border">
            <Image
              src={previewUrl}
              alt="Uploaded photo"
              width={500}
              height={500}
              className="w-full object-cover"
              unoptimized
            />
          </div>
          <div className="flex gap-3">
            <button
              onClick={reset}
              className="pill px-6 py-2.5 text-sm"
            >
              Try another photo
            </button>
          </div>
        </div>
      ) : (
        <div
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          className="flex flex-col items-center justify-center rounded-2xl border-2 border-dashed border-[var(--muted-ink)]/30 px-8 py-12 text-center transition-colors hover:border-[var(--brand)]/50"
        >
          <div className="flex size-14 items-center justify-center rounded-2xl bg-[var(--brand)]/10">
            <UploadIcon className="size-6 text-[var(--brand)]" />
          </div>
          <p className="mt-4 font-medium">Drop your photo here</p>
          <p className="mt-1 text-sm text-[var(--muted-ink)]">
            or choose an option below
          </p>
          <div className="mt-6 flex flex-wrap justify-center gap-3">
            <button
              onClick={() => fileInputRef.current?.click()}
              className="pill pill-brand px-5 py-2.5 text-sm font-medium"
            >
              <UploadIcon className="mr-1.5 size-4" />
              Upload Photo
            </button>
            <button
              onClick={startCamera}
              className="pill px-5 py-2.5 text-sm"
            >
              <CameraIcon className="mr-1.5 size-4" />
              Use Camera
            </button>
          </div>
          <p className="mt-4 text-xs text-[var(--muted-ink)]">
            JPG, PNG, or WebP · Runs in your browser · Photo never leaves your device
          </p>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp"
            onChange={handleFileChange}
            className="hidden"
          />
        </div>
      )}

      {/* Result area */}
      {children}
    </div>
  );
}
