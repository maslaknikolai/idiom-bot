import { atom, useAtom } from "jotai";
import { motion } from "framer-motion";
import { useEffect, useMemo } from "react";
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
const errorAtom = atom<string | null>(null);

export default function App() {
  const [, setIdiom] = useAtom(idiomAtom);
  const [, setError] = useAtom(errorAtom);
  const [, setCurrentStepIndex] = useAtom(stepIndexAtom);

  useEffect(() => {
    fetchIdiom()

    async function fetchIdiom() {
      const initData = new URLSearchParams(window.location.search).get('initData') || Telegram.WebApp?.initData
      const groupChatId = new URLSearchParams(window.location.search).get('groupChatId') || Telegram.WebApp.initDataUnsafe.start_param;

      const response = await fetch(`${import.meta.env.VITE_API_URL || ''}/api/game-data?&groupChatId=${groupChatId}&initData=${encodeURIComponent(initData)}`);
      const data = await response.json();

      if (!response.ok) {
        setError(data.error || 'HTTP error!');
        setCurrentStepIndex(5);
      }

      setIdiom(data.idiom)
    }
  }, []);

  return (
    <div>
      <Content />
    </div>
  );
}

function Content() {
  const [idiom] = useAtom(idiomAtom);
  const [currentStepIndex, setCurrentStepIndex] = useAtom(stepIndexAtom);
  const [, setSelectedMeaningIndex] = useAtom(selectedMeaningIndexAtom);
  const [, setSelectedUsageIndex] = useAtom(selectedUsageIndexAtom);

  return (
    <div className="overflow-hidden relative flex">
      <Slide index={0} shownIndex={currentStepIndex}>
        <>
          {!idiom ? (
            <>
              <div className="p-4">
                <h1 className="text-2xl font-bold mb-4 text-center">
                  Loading...
                </h1>
              </div>
            </>
          ) : (
            <>
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
            </>
          )}
        </>
      </Slide>

      <Slide index={1} shownIndex={currentStepIndex}>
        {currentStepIndex === 1 && (
          <div className="p-4">
            <h1 className="text-2xl font-bold mb-4 text-center">
              Guess the meaning of the idiom
              "{idiom?.text}"
            </h1>

            {idiom?.meaning_options.map((option, i) => (
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
            "{idiom?.text}"
          </h1>

          {idiom?.usage_options.map((option, i) => (
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

      <Slide index={5} shownIndex={currentStepIndex}>
        {currentStepIndex === 5 && (
          <Error />
        )}
      </Slide>
    </div>
  );
}


function UploadOptionsAnswers() {
  const [selectedMeaningIndex] = useAtom(selectedMeaningIndexAtom);
  const [selectedUsageIndex] = useAtom(selectedUsageIndexAtom);
  const [,setIsSending] = useAtom(isSendingAtom);
  const [, setMeaning] = useAtom(meaningAtom);
  const [, setError] = useAtom(errorAtom);
  const [, setCurrentStepIndex] = useAtom(stepIndexAtom);

  const { groupChatId, initData } = useTelegramWebAppData()

  useEffect(() => {
    setIsSending(true);

    const t = setTimeout(() => {
      postTradeGuessesToMeaning()
    }, 1000)

    return () => clearTimeout(t);

    async function postTradeGuessesToMeaning() {
      try {
        setIsSending(true);

        const response = await fetch(`${import.meta.env.VITE_API_URL || ''}/api/trade-guesses-to-meaning?groupChatId=${groupChatId}&initData=${encodeURIComponent(initData)}`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            meaningGuessIndex: selectedMeaningIndex,
            usageGuessIndex: selectedUsageIndex,
          }),
        });

        if (!response.ok) {
          // get data.error from response
          const data = await response.json();
          setError(data.error || 'HTTP error!');
          return setCurrentStepIndex(5);
        }

        const data = await response.json();
        const meaning = data.correctMeaning;

        setMeaning(meaning);
        setCurrentStepIndex(4);
      } catch (error) {
        setCurrentStepIndex(5);
        setError('Something went wrong! Please try again later.');
      } finally {
        setIsSending(false);
      }
    }
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
      <div className="flex flex-col justify-center items-center relative h-80">
        <div className="Background absolute w-full h-full rounded-xl overflow-hidden -z-10 bg-black">
          <img src={idiom?.image_url} alt={idiom?.text} className="w-full h-full object-cover opacity-50" />
        </div>

        <h1 className="z-10 text-white text-5xl font-bold text-center drop-shadow-lg my-2">
          {idiom?.text}
        </h1>

        <p className="z-10 text-white text-2xl font-bold text-center drop-shadow-lg my-2">
          {meaning}
        </p>

        <motion.button
          className="z-10 bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded"
          onClick={() => Telegram.WebApp.close()}
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.95 }}
        >
          Cool
        </motion.button>
      </div>
    </div>
  );
}

function Error() {
  const [error] = useAtom(errorAtom);

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4 text-center">
        Sorry, something went wrong
      </h1>

      <p className="text-lg text-center">
        {error}
      </p>

      <motion.button
        className="block w-full bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded mt-4"
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => Telegram.WebApp.close()}
      >
        Close
      </motion.button>
    </div>
  );
}

function useTelegramWebAppData() {
  const initData = new URLSearchParams(window.location.search).get('initData') || Telegram.WebApp?.initData
  const groupChatId = new URLSearchParams(window.location.search).get('groupChatId') || Telegram.WebApp.initDataUnsafe.start_param;

  return useMemo(() => ({ initData, groupChatId }), [initData, groupChatId]);
}