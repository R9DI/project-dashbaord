// 색상 기준 설정
export const defaultColorSettings = {
  inlinePassRate: { high: 90, low: 70 },
  elecPassRate: { high: 90, low: 70 },
  issueResponseIndex: { high: 90, low: 70 },
  wipAchievementRate: { high: 90, low: 70 },
  deadlineAchievementRate: { high: 90, low: 70 },
  finalScore: { high: 90, low: 70 },
};

// 색상 클래스 매핑
export const getColorClass = (field, value, settings) => {
  if (!settings) return "";

  const highThreshold = settings.high / 100;
  const lowThreshold = settings.low / 100;
  const compareValue = value;

  if (compareValue >= highThreshold) {
    return field === "finalScore" ? "cell-high-score" : "cell-high";
  } else if (compareValue >= lowThreshold) {
    return field === "finalScore" ? "cell-medium-score" : "cell-medium";
  } else {
    return field === "finalScore" ? "cell-low-score" : "cell-low";
  }
};
