export const handleFeedbackPrompt = (msg) => {
  const text = msg.toLowerCase();

  if (text.includes('rate') || text.includes('feedback') || text.includes('comment')) {
    return 'You can leave feedback in the Dashboard once your swap is accepted.';
  }

  return null;
};

