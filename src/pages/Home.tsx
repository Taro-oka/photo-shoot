import { useEffect, useState } from "react";
import CameraCapture from "../components/Capture";

function Home() {
  const [imageUrl, setImageUrl] = useState<string>("");

  useEffect(() => {
    if (imageUrl) {
      console.log(imageUrl);
    }
  }, [imageUrl]);

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-blue-50 to-purple-100 text-gray-900 font-sans">
      <header className="bg-gradient-to-r from-indigo-500 to-blue-500 text-white p-6 text-3xl font-bold text-center shadow-md">
        ホームです
      </header>

      <main className="flex-1 p-10">
        <div className="max-w-5xl mx-auto space-y-10">
          <div>
            <h1 className="text-4xl font-extrabold text-indigo-600 mb-2">
              ようこそ！
            </h1>
            <p className="text-lg text-gray-700">
              このページは Tailwind CSS
              を活用して、シンプルかつ鮮やかにデザインされています。
            </p>
          </div>
          <CameraCapture setImageUrl={setImageUrl} />
        </div>
      </main>

      <footer className="bg-indigo-600 text-white text-center p-4 text-sm">
        © 2025 フッターです
      </footer>
    </div>
  );
}

export default Home;
