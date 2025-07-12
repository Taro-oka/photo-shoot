import { useRef, useState } from "react";
import Button from "./Button";

type Props = {
  setImageUrl?: (imageUrl: string) => void;
};

function CameraCapture({ setImageUrl }: Props) {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
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
    if (video && canvas) {
      const videoWidth = video.clientWidth;
      const videoHeight = video.clientHeight;

      const nativeVideoWidth = video.videoWidth;
      const nativeVideoHeight = video.videoHeight;

      const videoAspectRatio = nativeVideoWidth / nativeVideoHeight;
      const containerAspectRatio = videoWidth / videoHeight;

      let sx, sy, sWidth, sHeight;
      if (videoAspectRatio > containerAspectRatio) {
        sHeight = nativeVideoHeight;
        sWidth = nativeVideoHeight * containerAspectRatio;
        sx = (nativeVideoWidth - sWidth) / 2;
        sy = 0;
      } else {
        sWidth = nativeVideoWidth;
        sHeight = nativeVideoWidth / containerAspectRatio;
        sx = 0;
        sy = (nativeVideoHeight - sHeight) / 2;
      }

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

        const imageDataUrl = canvas.toDataURL("image/png");
        setPhoto(imageDataUrl);
        if (setImageUrl) {
          setImageUrl(imageDataUrl);
        }
        stopCamera();
      }
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
          <video
            ref={videoRef}
            autoPlay
            playsInline
            muted
            className="w-full max-w-2xl aspect-video rounded-xl object-cover shadow-lg border border-gray-300 transform -scale-x-100"
          />
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
            className="w-full max-w-md rounded-xl aspect-video object-cover shadow-lg border border-gray-300"
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
