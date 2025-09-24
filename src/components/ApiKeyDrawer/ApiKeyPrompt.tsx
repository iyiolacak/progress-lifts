"use client";

import React, {
  useEffect,
  useState,
  useCallback,
  useRef,
  FormEvent,
} from "react";
import { Drawer, DrawerContent, DrawerTitle } from "@/components/ui/drawer";
import { useSfx } from "@/lib/sfx";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";
import ApiKeyForm from "./ApiKeyForm";
import Image from "next/image";
import { useAppSettings } from "@/localdb/store/appPreferences";
import { useTranslations } from "next-intl";

export interface ApiKeyPromptProps {
  forceOpen?: boolean;
  onClose?: () => void;
  disableAutoOpen?: boolean;
  hideDefaultChrome?: boolean;
}

export const ApiKeyPrompt: React.FC<ApiKeyPromptProps> = ({
  forceOpen,
  onClose,
  disableAutoOpen,
  hideDefaultChrome,
}) => {
  const t = useTranslations("Drawer.ApiKeyPrompt");
  const { play } = useSfx();
  const { hasApiKey, onboardingStatus, setOnboardingStatus } = useAppSettings();

  const [open, setOpen] = useState(false);
  const [showPane, setShowPane] = useState(false);
  const [showVideo, setShowVideo] = useState(false);
  const [inputValue, setInputValue] = useState("");
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Open drawer logic
  useEffect(() => {
    if (forceOpen) setOpen(true);
    else if (!disableAutoOpen && !hasApiKey() && onboardingStatus !== "done")
      setOpen(true);
  }, [forceOpen, disableAutoOpen, hasApiKey, onboardingStatus]);

  // Autofocus
  useEffect(() => {
    if (open) inputRef.current?.focus();
  }, [open]);

  // Delayed pane reveal
  useEffect(() => {
    if (open) {
      const timeout = setTimeout(() => setShowPane(true), 2000);
      return () => clearTimeout(timeout);
    } else {
      setShowPane(false);
    }
  }, [open]);

  const wait = () => new Promise((resolve) => setTimeout(resolve, 1000));

  const close = useCallback(
    (skip = false) => {
      if (skip) setOnboardingStatus("skipped");
      setShowVideo(false);
      setOpen(false);
      onClose?.();
      play("click");
    },
    [onClose, play, setOnboardingStatus]
  );

  const handleSuccess = useCallback(() => {
    toast.success(t("successToast"));
    setOnboardingStatus("done");
    play("game_start");
    close();
  }, [t, setOnboardingStatus, play, close]);

  const embedUrl = "https://www.youtube.com/embed/bK5MQr6CXc8?autoplay=1";

  // Simple fade animation (optionally add slight scale for micro-polish)
  const fadeVariants = {
    hidden: { opacity: 0, scale: 0.99 },
    visible: {
      opacity: 1,
      scale: 1,
      transition: { duration: 0.33, ease: "easeOut" },
    },
  };

  // When closing: first hide child, then Drawer

  return (
    <Drawer open={open} onOpenChange={setOpen}>
      <DrawerContent className="w-full h-screen md:px-12 py-3 m-0 bg-background overflow-hidden">
      <DrawerTitle className="text-center text-2xl font-semibold">
      </DrawerTitle>
        <div className="flex flex-col md:flex-row h-full w-full">
          {/* IMAGE/VIDEO PANE */}
          <AnimatePresence>
            {showPane && (
              <motion.div
                key="image-pane"
                initial="hidden"
                animate="visible"
                variants={fadeVariants}
                className={`
                  flex flex-1 items-center group justify-center
                  relative overflow-hidden cursor-pointer py-3
                  mb-4 md:mb-0 md:mr-4
                  max-h-[160px] px-3 md:max-h-none
                  rounded-2xl
                  ${showVideo ? "z-40" : "z-20"}
                `}
                onClick={() => setShowVideo(true)}
                tabIndex={0}
                aria-label="See video guide on getting your API key"
                role="button"
              >
                {!showVideo ? (
                  <div className="w-full h-full min-h-[180px] relative rounded-2xl overflow-hidden">
                    <Image
                      src="/pictures/get_api_key.png"
                      alt="How to get an API key"
                      className="w-full h-full rounded-2xl object-cover"
                      width={480}
                      height={320}
                      priority
                    />
                    <div className="absolute inset-0 rounded-2xl bg-black/30 bg-opacity-40 flex items-center justify-center">
                      <p className="text-white group-hover:underline text-nowrap text-lg md:text-2xl font-medium drop-shadow">
                        {t("tap-to-api-tutorial")}
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="absolute inset-0 flex items-center justify-center z-50 bg-black/90 rounded-2xl">
                    <motion.div
                      key={embedUrl}
                      initial={{ scale: 0.97, opacity: 0.6 }}
                      animate={{ scale: 1, opacity: 1 }}
                      className="w-full h-full max-w-full aspect-video rounded-xl overflow-hidden shadow-xl flex items-center justify-center"
                    >
                      <iframe
                        src={embedUrl}
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        allowFullScreen
                        className="w-full h-full rounded-xl"
                        title="OpenAI API Key Tutorial Video"
                        aria-label="OpenAI API Key Tutorial Video"
                        tabIndex={0}
                        frameBorder="0"
                      />
                    </motion.div>
                    <button
                      className="absolute top-2 right-2 bg-black/60 hover:bg-black/80 text-white rounded-full p-2 z-50"
                      aria-label="Close video"
                      onClick={(e) => {
                        e.stopPropagation();
                        setShowVideo(false);
                      }}
                    >
                      ×
                    </button>
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>

          {/* FORM PANE */}
          <div className="flex flex-col flex-1 justify-center items-center p-4 md:p-8 overflow-auto">
            <ApiKeyForm onSuccess={handleSuccess} />
          </div>
        </div>
      </DrawerContent>
    </Drawer>
  );
};

export default ApiKeyPrompt;
