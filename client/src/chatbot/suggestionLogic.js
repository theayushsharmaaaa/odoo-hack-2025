export const handleSkillSuggest = (msg) => {
  const text = msg.toLowerCase();

  if (text.includes('suggest') || text.includes('recommend')) {
    const suggestions = ['TypeScript', 'UI/UX Design', 'Docker', 'Public Speaking'];
    const top3 = suggestions.slice(0, 3).join(', ');
    return `Based on current demand, you could consider adding: ${top3}`;
  }

  return null;
};

