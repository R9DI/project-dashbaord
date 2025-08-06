// 색상 클래스 매핑
export const getColorClass = (field, value, settings) => {
  if (!settings) return "";

  const fieldSettings = settings[field];
  if (!fieldSettings) return "";

  const highThreshold = fieldSettings.high / 100;
  const lowThreshold = fieldSettings.low / 100;
  const compareValue = value;

  if (compareValue >= highThreshold) {
    return field === "finalScore" ? "cell-high-score" : "cell-high";
  } else if (compareValue >= lowThreshold) {
    return field === "finalScore" ? "cell-medium-score" : "cell-medium";
  } else {
    return field === "finalScore" ? "cell-low-score" : "cell-low";
  }
};

// 색상 기준 설명
export const colorSettingsDescription = {
  inlinePassRate: "Inline 합격률",
  elecPassRate: "Elec 합격률",
  issueResponseIndex: "Issue 대응지수",
  wipAchievementRate: "WIP 실적 달성률",
  deadlineAchievementRate: "과제 납기달성률",
  finalScore: "Final Score",
};
