const ERRORS = [
  {
    // Chromium: Camera already in use
    type: "NotReadableError",
    message: "Could not start video source",
    help: "This often occurs when another app or browser is using your camera. If so, close them, then try again.",
  },
  {
    // Firefox: Camera already in use
    type: "AbortError",
    message: "Starting videoinput failed",
    help: "This often occurs when another app or browser is using your camera. If so, close them, then try again.",
  },
];

export type ICameraError = {
  type: string;
  message: string;
  help: string;
};

export const createError = (error: Error): ICameraError => {
  const knownError = ERRORS.find(
    (e) => e.type === error.name && e.message === error.message,
  );

  if (knownError) {
    return knownError;
  }

  console.debug("No known error type for the following error: ", {
    error,
    type: error.name,
    message: error.message,
  });

  return (
    knownError ?? {
      type: error.name,
      message: error.message,
      help: "",
    }
  );
};
