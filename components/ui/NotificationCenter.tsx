import React, { useState, useRef, useEffect } from "react";
import { AnimatePresence, motion } from "motion/react";
import { useNotification, Notification } from "./NotificationContext";

/**
 * Local implementation of useOnClickOutside to avoid dependency conflicts 
 * and ensure the React instance remains consistent.
 */
function useOnClickOutside(ref: React.RefObject<HTMLElement | null>, handler: (event: MouseEvent | TouchEvent) => void) {
  useEffect(() => {
    const listener = (event: MouseEvent | TouchEvent) => {
      // Do nothing if clicking ref's element or descendent elements
      if (!ref.current || ref.current.contains(event.target as Node)) {
        return;
      }
      handler(event);
    };

    document.addEventListener("mousedown", listener);
    document.addEventListener("touchstart", listener);

    return () => {
      document.removeEventListener("mousedown", listener);
      document.removeEventListener("touchstart", listener);
    };
  }, [ref, handler]);
}

export default function NotificationCenter() {
  const { notifications, removeNotification } = useNotification();
  const [activeItem, setActiveItem] = useState<Notification | null>(null);
  const ref = useRef<HTMLDivElement>(null);
  
  // Use the local hook instead of external library
  useOnClickOutside(ref, () => setActiveItem(null));

  useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setActiveItem(null);
      }
    }
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);

  return (
    <>
      <AnimatePresence>
        {activeItem ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[200] bg-slate-900/10 backdrop-blur-xl pointer-events-none"
          />
        ) : null}
      </AnimatePresence>

      <AnimatePresence>
        {activeItem ? (
          <div className="fixed inset-0 z-[210] grid place-items-center p-4">
            <motion.div
              className="bg-white dark:bg-slate-900 flex h-fit w-full max-w-md cursor-pointer flex-col items-start gap-4 overflow-hidden border border-slate-200 dark:border-slate-800 p-6 shadow-xl"
              ref={ref}
              layoutId={`notif-${activeItem.id}`}
              style={{ borderRadius: 24 }}
            >
              <div className="flex w-full items-center gap-4">
                <motion.div 
                  layoutId={`notifLogo-${activeItem.id}`}
                  className="w-12 h-12 rounded-2xl bg-slate-50 dark:bg-slate-800 flex items-center justify-center text-xl"
                >
                  {activeItem.icon}
                </motion.div>
                <div className="flex grow items-center justify-between">
                  <div className="flex w-full flex-col gap-0.5">
                    <motion.div
                      className="text-slate-900 dark:text-white text-sm font-bold uppercase tracking-widest"
                      layoutId={`notifSource-${activeItem.id}`}
                    >
                      {activeItem.source}
                    </motion.div>
                    <motion.p
                      layoutId={`notifTitle-${activeItem.id}`}
                      className="text-slate-500 dark:text-slate-400 text-sm font-medium"
                    >
                      {activeItem.title}
                    </motion.p>
                    <motion.div
                      className="text-slate-400 flex flex-row gap-2 text-[10px] font-black uppercase tracking-wider"
                      layoutId={`notifExtras-${activeItem.id}`}
                    >
                      {activeItem.location && `${activeItem.location} | `}
                      {activeItem.timestamp}
                    </motion.div>
                  </div>
                </div>
              </div>
              <motion.p
                layout
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0, transition: { duration: 0.05 } }}
                className="text-slate-600 dark:text-slate-300 text-sm leading-relaxed"
              >
                {activeItem.description}
              </motion.p>
              <div className="w-full pt-2 flex justify-end">
                <button 
                  onClick={() => setActiveItem(null)}
                  className="text-xs font-bold text-blue-600 hover:underline"
                >
                  Dismiss
                </button>
              </div>
            </motion.div>
          </div>
        ) : null}
      </AnimatePresence>

      <div className="fixed bottom-8 right-8 z-[190] flex flex-col items-end gap-3 w-80 pointer-events-none">
        <AnimatePresence mode="popLayout">
          {notifications.map((notif) => (
            <motion.div
              layoutId={`notif-${notif.id}`}
              key={notif.id}
              initial={{ opacity: 0, x: 20, scale: 0.95 }}
              animate={{ opacity: 1, x: 0, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9, transition: { duration: 0.2 } }}
              className="group bg-white dark:bg-slate-900 w-full cursor-pointer flex flex-row items-center gap-4 border border-slate-200 dark:border-slate-800 p-4 shadow-md pointer-events-auto hover:border-blue-200 transition-all"
              onClick={() => setActiveItem(notif)}
              style={{ borderRadius: 16 }}
            >
              <motion.div 
                layoutId={`notifLogo-${notif.id}`}
                className={`w-10 h-10 shrink-0 rounded-xl flex items-center justify-center text-lg ${
                  notif.type === 'success' ? 'bg-emerald-50 text-emerald-600' :
                  notif.type === 'warning' ? 'bg-amber-50 text-amber-600' :
                  'bg-blue-50 text-blue-600'
                }`}
              >
                {notif.icon}
              </motion.div>
              <div className="flex w-full flex-col items-start justify-center gap-0.5 overflow-hidden">
                <motion.div
                  className="text-slate-900 dark:text-white text-xs font-bold uppercase tracking-widest truncate w-full"
                  layoutId={`notifSource-${notif.id}`}
                >
                  {notif.source}
                </motion.div>
                <motion.div
                  className="text-slate-500 dark:text-slate-400 text-xs font-medium truncate w-full"
                  layoutId={`notifTitle-${notif.id}`}
                >
                  {notif.title}
                </motion.div>
                <motion.div
                  className="text-slate-400 text-[9px] font-bold uppercase tracking-tighter"
                  layoutId={`notifExtras-${notif.id}`}
                >
                  {notif.timestamp}
                </motion.div>
              </div>
              <button 
                onClick={(e) => { e.stopPropagation(); removeNotification(notif.id); }}
                className="opacity-0 group-hover:opacity-100 p-1 text-slate-300 hover:text-rose-500 transition-all"
              >
                <i className="fa-solid fa-xmark text-xs"></i>
              </button>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </>
  );
}