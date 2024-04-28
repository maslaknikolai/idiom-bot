import { atom, useAtom } from "jotai";
import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import { Card } from "./Card";
import { Username } from "./Username";

type Idiom = {
    id: number,
    title: string,
    imageUrl: string,
}

const idiomAtom = atom<Idiom | null>(null);

const stepAtom = atom(1);

const useImageLoader = (src: string | undefined) => {
  const [image, setImage] = useState<string | undefined>(undefined);

  useEffect(() => {
    if (!src) {
      return;
    }

    const img = new Image();
    img.src = src;
    img.onload = () => setImage(src);
    return () => {
      img.onload = null;
    };
  }, [src]);

  return image;
}

function App() {
  const [idiom, setIdiom] = useAtom(idiomAtom);
  const [error, setError] = useState<string | null>(null);
  const idiomLoadedImage = useImageLoader(idiom?.imageUrl);

  useEffect(() => {
    fetchIdiom()

    async function fetchIdiom() {
      const initData = new URLSearchParams(window.location.search).get('initData') || Telegram.WebApp?.initData
      const groupChatId = new URLSearchParams(window.location.search).get('groupChatId') || Telegram.WebApp.initDataUnsafe.start_param;

      const response = await fetch(`${import.meta.env.VITE_API_URL || ''}/api/game-data?&groupChatId=${groupChatId}&initData=${encodeURIComponent(initData)}`);
      const data = await response.json();
      setIdiom(data.idiom)
      setError(data.error)
    }
  }, []);

  if (error) {
    return <>{error}</>;
  }

  return (
    <div className="p-2">
      <Username />

      {idiom && idiomLoadedImage && (
        <Content />
      )}
    </div>
  );
}

function Content() {
  const [idiom] = useAtom(idiomAtom);
  const [currentStep, setCurrentStep] = useAtom(stepAtom);

  if (!idiom) {
    return null;
  }

  return (
    <div className="overflow-hidden relative flex">
      <Card isShown={currentStep === 1}>
        {idiom && (
          <div className="flex flex-col justify-center items-center relative h-80">
            {idiom.imageUrl && (
              <div className="Background absolute w-full h-full rounded-xl overflow-hidden -z-10 bg-black">
                <img src={idiom.imageUrl} alt={idiom?.title} className="w-full h-full object-cover opacity-50" />
              </div>
            )}
            <p className="z-10 text-white text-lg pt-10">Idiom of the day</p>
            <h1 className="z-10 text-white text-5xl font-bold text-center drop-shadow-lg my-2">
              {idiom?.title}
            </h1>
            <motion.button
              className="z-10 bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded"
              onClick={() => setCurrentStep(currentStep + 1)}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
            >
              Okay
            </motion.button>
          </div>
        )}
      </Card>

      <Card isShown={currentStep === 2}>
        <div className="flex flex-col items-center p-4">
          <h1 className="text-2xl font-bold">Did you know?</h1>
          <p>This idiom is used to ask someone what they are thinking about.</p>
          <button className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded mt-4"
            onClick={() => setCurrentStep(currentStep + 1)}
          >
            Next
          </button>
        </div>
      </Card>
    </div>
  );
}


export default App;
