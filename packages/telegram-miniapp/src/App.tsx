import { atom, useAtom } from "jotai";
import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import { Card } from "./Card";

const idiomAtom = atom({
  id: 1,
  title: "A penny for your thoughts",
  imageUrl: "/crying_over_spilled_milk.jpg",
});

const step = atom(1);

const useImageLoader = (src: string) => {
  const [image, setImage] = useState<string | undefined>(undefined);

  useEffect(() => {
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
  const [currentStep, setCurrentStep] = useAtom(step);
  const [idiom] = useAtom(idiomAtom);
  const nextStep = () => setCurrentStep((s) => s + 1);

  const idiomImage = useImageLoader(idiom.imageUrl);
  const isImageLoaded = !!idiomImage;

  return (
    <div className="m-auto p-2 relative w-full max-w-[550px]">
      <Card isShown={isImageLoaded && currentStep === 1}>
        <>
        <div className="First h-80 flex flex-col justify-center relative">
          <div className="Background absolute w-full h-full rounded-xl overflow-hidden -z-10 bg-black">
            <img
              src={idiomImage}
              alt={idiom.title}
              className="w-full h-full object-cover opacity-50"
            />
          </div>

          <div className="Content p-2">
            <p className="pt-10">
              Ideom of the day
            </p>

            <h1 className="Idiom text-5xl leading-tight fotn-bold text-white text-center drop-shadow-lg items-center">
              {idiom.title}
            </h1>

            <div className="flex p-2 justify-end w-full">
              <motion.button
                className="button z-10"
                onClick={nextStep}
                whileHover={{
                  scale: 1.1,
                  backgroundColor: "#ff0000",
                }}
                whileTap={{ scale: 0.95 }}
              >
                Okay
              </motion.button>
            </div>
          </div>

        </div>
        </>
      </Card>

      <Card isShown={currentStep === 2}>
        <div className="flex flex-col items-center">
          <h1 className="text-2xl font-bold text-center">
            Did you know?
          </h1>
          <p className="text-lg text-center">
            This idiom is used to ask someone what they are thinking about.
          </p>
          <button
            className="button"
            onClick={nextStep}
          >
            Next
          </button>
        </div>
      </Card>
    </div>
  );
}

export default App;
