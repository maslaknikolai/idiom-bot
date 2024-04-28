import { atom, useAtom } from "jotai";
import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import { Slide } from "./Card";

type Idiom = {
    id: number,
    text: string,
    image_url: string,
    meaning_options: string[],
    usage_options: string[],
}

const idiomAtom = atom<Idiom | null>(null);

const stepIndexAtom = atom(0);
const selectedMeaningIndexAtom = atom<number | null>(null);
const selectedUsageIndexAtom = atom<number | null>(null);
const isSendingAtom = atom(false);
const meaningAtom = atom<string | null>(null);

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

export default function App() {
  const [idiom, setIdiom] = useAtom(idiomAtom);
  const [error, setError] = useState<string | null>(null);
  const idiomLoadedImage = useImageLoader(idiom?.image_url);

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
    <div>
      {idiom && idiomLoadedImage && (
        <Content />
      )}
    </div>
  );
}

function Content() {
  const [idiom] = useAtom(idiomAtom);
  const [currentStepIndex, setCurrentStepIndex] = useAtom(stepIndexAtom);
  const [, setSelectedMeaningIndex] = useAtom(selectedMeaningIndexAtom);
  const [, setSelectedUsageIndex] = useAtom(selectedUsageIndexAtom);

  if (!idiom) {
    return null;
  }

  return (
    <div className="overflow-hidden relative flex">
      <Slide index={0} shownIndex={currentStepIndex}>
        {currentStepIndex === 0 && idiom && (
          <div className="p-4">
            <div className="flex flex-col justify-center items-center relative h-80">
              <div className="Background absolute w-full h-full rounded-xl overflow-hidden -z-10 bg-black">
                <img src={idiom.image_url} alt={idiom.text} className="w-full h-full object-cover opacity-50" />
              </div>
              <p className="z-10 text-white text-lg pt-10">Idiom of the day</p>
              <h1 className="z-10 text-white text-5xl font-bold text-center drop-shadow-lg my-2">
                {idiom.text}
              </h1>
              <motion.button
                className="z-10 bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded"
                onClick={() => setCurrentStepIndex(currentStepIndex + 1)}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
              >
                Okay
              </motion.button>
            </div>
          </div>
        )}
      </Slide>

      <Slide index={1} shownIndex={currentStepIndex}>
        {currentStepIndex === 1 && (
          <div className="p-4">
            <h1 className="text-2xl font-bold mb-4 text-center">
              Guess the meaning of the idiom
              "{idiom.text}"
            </h1>

            {idiom.meaning_options.map((option, i) => (
              <motion.button
                className="block w-full mb-2 z-10 bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded"
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => {
                  setSelectedMeaningIndex(i);
                  setCurrentStepIndex(currentStepIndex + 1);
                }}
              >
                {option}
              </motion.button>
            ))}
          </div>
        )}
      </Slide>

      <Slide index={2} shownIndex={currentStepIndex}>
        <div className="p-4">
          <h1 className="text-2xl font-bold mb-4 text-center">
            Guess the correct usage of the idiom
            "{idiom.text}"
          </h1>

          {idiom.usage_options.map((option, i) => (
            <motion.button
              className="block w-full mb-2 z-10 bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded"
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => {
                setSelectedUsageIndex(i);
                setCurrentStepIndex(currentStepIndex + 1);
              }}
            >
              {option}
            </motion.button>
          ))}
        </div>
      </Slide>

      <Slide index={3} shownIndex={currentStepIndex}>
        {currentStepIndex === 3 && (
          <UploadOptionsAnswers />
        )}
      </Slide>

      <Slide index={4} shownIndex={currentStepIndex}>
        {currentStepIndex === 4 && (
          <Meaning />
        )}
      </Slide>
    </div>
  );
}


function UploadOptionsAnswers() {
  const [selectedMeaningIndex, setSelectedMeaningIndex] = useAtom(selectedMeaningIndexAtom);
  const [selectedUsageIndex, setSelectedUsageIndex] = useAtom(selectedUsageIndexAtom);
  const [,setIsSending] = useAtom(isSendingAtom);
  const [, setMeaning] = useAtom(meaningAtom);
  const [, setCurrentStepIndex] = useAtom(stepIndexAtom);

  useEffect(() => {
    setIsSending(true);

    const t = setTimeout(() => {
      console.log("Sending data to the server", selectedMeaningIndex, selectedUsageIndex);

      setIsSending(false);
      setSelectedMeaningIndex(null);
      setSelectedUsageIndex(null);

      setMeaning("It's a phrase that means something else than the literal meaning of the words.");
      setCurrentStepIndex(4)
    }, 3000)

    return () => clearTimeout(t);
  }, []);

    return (
      <div className="flex items-center justify-center min-h-[500px]">
        <motion.div
          className="w-[50px] h-[50px] bg-red-500"
          animate={{
            scale: [1, 2, 2, 1, 1],
            rotate: [0, 0, 180, 180, 0],
            borderRadius: ["10%", "10%", "50%", "50%", "10%"],
            filter: ["blur(0px)", "blur(0px)", "blur(100px)", "blur(100px)", "blur(0px)"]
          }}
          transition={{
            duration: 2,
            ease: "easeInOut",
            times: [0, 0.2, 0.5, 0.8, 1],
            repeat: Infinity,
            repeatDelay: 1
          }}
        />
      </div>
    )
}

function Meaning() {
  const [idiom] = useAtom(idiomAtom);
  const [meaning] = useAtom(meaningAtom);

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4 text-center">
        {idiom?.text}
      </h1>

      {meaning && (
        <p className="text-lg text-center">{meaning}</p>
      )}
    </div>
  );
}