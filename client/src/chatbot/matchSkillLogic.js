export const handleSkillMatch = (msg, allUsers, myUserId) => {
  const text = msg.toLowerCase();
  if (!text.includes('who') && !text.includes('swap')) return null;

  const matches = allUsers.filter((u) =>
    u.id !== myUserId && u.skillsOffered?.length > 0
  );

  if (matches.length === 0) {
    return 'No good matches found for now. Try updating your skills or checking later!';
  }

  const suggestions = matches
    .slice(0, 3)
    .map((u) => `• ${u.name} (Skills: ${u.skillsOffered.map(s => s.name).join(', ')})`)
    .join('\n');

  return `Here are users you might want to swap with:\n${suggestions}`;
};

