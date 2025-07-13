import { useRef, useState, useEffect } from "react";
import Button from "./Button";

type Props = {
  setImageUrl?: (imageUrl: string) => void;
};

function CameraCapture({ setImageUrl }: Props) {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const overlayCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const [photo, setPhoto] = useState<string | null>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [requestedStart, setRequestedStart] = useState(false);
  const [cameraStarted, setCameraStarted] = useState(false);
  const [cameraFailed, setCameraFailed] = useState(false);

  const startCamera = async () => {
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: true,
      });

      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
        videoRef.current.muted = true;
        await videoRef.current.play();
      }

      setStream(mediaStream);
      setCameraStarted(true);
    } catch (err) {
      console.error("カメラの起動に失敗しました:", err);
      setCameraStarted(false);
      setCameraFailed(true);
    }
  };

  const stopCamera = () => {
    if (stream) {
      stream.getTracks().forEach((track) => track.stop());
      setStream(null);
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
    setCameraStarted(false);
  };

  const takePhoto = () => {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    if (!video || !canvas) return;

    const { sx, sy, sWidth, sHeight } = getCropDimensions(video);

    canvas.width = sWidth;
    canvas.height = sHeight;

    const ctx = canvas.getContext("2d");
    if (ctx) {
      ctx.translate(canvas.width, 0);
      ctx.scale(-1, 1);

      ctx.drawImage(
        video,
        sx,
        sy,
        sWidth,
        sHeight,
        0,
        0,
        canvas.width,
        canvas.height
      );

      ctx.setTransform(1, 0, 0, 1, 0, 0);
      drawDecoration(ctx, canvas.width, canvas.height); //同じ装飾を追加

      const imageDataUrl = canvas.toDataURL("image/png");
      setPhoto(imageDataUrl);
      setImageUrl?.(imageDataUrl);
      stopCamera();
    }
  };

  const retake = () => {
    setPhoto(null);
    setRequestedStart(true);
    setCameraStarted(false);
    setTimeout(() => {
      startCamera();
    }, 100);
  };

  const cancelCamera = () => {
    stopCamera();
    setRequestedStart(false);
  };

  const getCropDimensions = (
    video: HTMLVideoElement
  ): { sx: number; sy: number; sWidth: number; sHeight: number } => {
    const videoWidth = video.videoWidth;
    const videoHeight = video.videoHeight;
    const displayWidth = video.clientWidth;
    const displayHeight = video.clientHeight;

    const videoAspectRatio = videoWidth / videoHeight;
    const containerAspectRatio = displayWidth / displayHeight;

    let sx, sy, sWidth, sHeight;
    if (videoAspectRatio > containerAspectRatio) {
      sHeight = videoHeight;
      sWidth = videoHeight * containerAspectRatio;
      sx = (videoWidth - sWidth) / 2;
      sy = 0;
    } else {
      sWidth = videoWidth;
      sHeight = videoWidth / containerAspectRatio;
      sx = 0;
      sy = (videoHeight - sHeight) / 2;
    }

    return { sx, sy, sWidth, sHeight };
  };

  // canvasにデコレーションを描画する(デコレーションのバリエーションを増やすならここの関数のバリエーションを増やす)
  const drawDecoration = (
    ctx: CanvasRenderingContext2D,
    width: number,
    height: number
  ) => {
    const centerX = width / 2;
    const centerY = height / 2;
    const rays = 12;

    ctx.strokeStyle = "rgba(255, 0, 0, 0.5)";
    ctx.lineWidth = 2;

    for (let i = 0; i < rays; i++) {
      const angle = (i * Math.PI * 2) / rays;
      const x = centerX + Math.cos(angle) * width;
      const y = centerY + Math.sin(angle) * height;
      ctx.beginPath();
      ctx.moveTo(centerX, centerY);
      ctx.lineTo(x, y);
      ctx.stroke();
    }
  };

  useEffect(() => {
    let frameId: number;

    const drawOverlay = () => {
      const canvas = overlayCanvasRef.current;
      const video = videoRef.current;
      if (!canvas || !video) return;

      const ctx = canvas.getContext("2d");
      if (!ctx) return;

      const { sWidth, sHeight } = getCropDimensions(video);
      canvas.width = sWidth;
      canvas.height = sHeight;

      ctx.clearRect(0, 0, canvas.width, canvas.height);
      drawDecoration(ctx, canvas.width, canvas.height);

      frameId = requestAnimationFrame(drawOverlay);
    };

    if (requestedStart && !photo) {
      drawOverlay();
    }

    return () => cancelAnimationFrame(frameId);
  }, [requestedStart, photo]);

  return (
    <div className="flex flex-col items-center justify-center bg-gray-50 px-4 py-8">
      <h1 className="text-2xl font-semibold mb-6 text-gray-800">カメラ撮影</h1>

      {!photo && !requestedStart && (
        <Button
          onClick={async () => {
            setRequestedStart(true);
            await new Promise((resolve) => setTimeout(resolve, 100));
            startCamera();
          }}
          className="bg-green-600 text-white hover:bg-green-700"
        >
          カメラを起動する
        </Button>
      )}

      {!photo && requestedStart && (
        <div className="flex flex-col items-center gap-4 w-full">
          <div className="relative w-full max-w-2xl aspect-video">
            <video
              ref={videoRef}
              autoPlay
              playsInline
              muted
              className="w-full h-full object-cover rounded-xl border border-gray-300 transform -scale-x-100"
            />
            <canvas
              ref={overlayCanvasRef}
              className="absolute top-0 left-0 w-full h-full pointer-events-none"
            />
          </div>

          {cameraFailed ? (
            <p className="text-gray-500">カメラの起動に失敗しました。</p>
          ) : cameraStarted ? (
            <div className="flex gap-4">
              <Button
                onClick={takePhoto}
                className="bg-blue-600 text-white hover:bg-blue-700"
              >
                撮影する
              </Button>
              <Button
                onClick={cancelCamera}
                className="bg-red-600 text-white hover:bg-red-700"
              >
                撮影をやめる
              </Button>
            </div>
          ) : (
            <p className="text-gray-500">カメラを起動中...</p>
          )}
        </div>
      )}

      {photo && (
        <div className="flex flex-col items-center gap-4">
          <img
            src={photo}
            alt="撮影した画像"
            className="w-full max-w-md rounded-xl  shadow-lg border border-gray-300"
          />
          <Button
            onClick={retake}
            className="bg-gray-700 text-white hover:bg-gray-800"
          >
            もう一度撮影する
          </Button>
        </div>
      )}

      <canvas ref={canvasRef} className="hidden" />
    </div>
  );
}

export default CameraCapture;
