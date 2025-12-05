export function calculateScore(
  answers: Array<{ isCorrect: boolean; pointsEarned: number }>,
  totalPoints: number
): { score: number; percentage: number } {
  const score = answers.reduce((sum, answer) => sum + (answer.pointsEarned || 0), 0);
  const percentage = totalPoints > 0 ? (score / totalPoints) * 100 : 0;
  return { score, percentage };
}

export function formatTime(seconds: number): string {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = seconds % 60;

  if (hours > 0) {
    return `${hours}h ${minutes}m ${secs}s`;
  }
  return `${minutes}m ${secs}s`;
}

export function validateEmail(email: string): boolean {
  const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return regex.test(email);
}
