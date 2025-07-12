export const handleFAQ = (msg) => {
  const text = msg.toLowerCase();

  if (text.includes('how') && text.includes('swap')) {
    return 'To request a swap, browse users and click "Request Swap".';
  }

  if (text.includes('profile') || text.includes('edit')) {
    return 'You can edit your profile under the "Profile" tab after login.';
  }

  if (text.includes('feedback')) {
    return 'After a successful swap, you’ll see a "Leave Feedback" button.';
  }

  return null;
};

