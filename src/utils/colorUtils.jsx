// 색상 클래스 매핑
export const getColorClass = (field, value, settings) => {
  console.log(
    `getColorClass called: field=${field}, value=${value}, settings=`,
    settings
  );

  if (!settings) {
    console.log(`No settings provided for field: ${field}`);
    return "";
  }

  const fieldSettings = settings[field];
  if (!fieldSettings) {
    console.log(`No field settings found for: ${field}`, settings);
    return "";
  }

  const highThreshold = fieldSettings.high / 100;
  const lowThreshold = fieldSettings.low / 100;
  const compareValue = value;

  console.log(
    `Thresholds for ${field}: high=${highThreshold}, low=${lowThreshold}, value=${value}`
  );

  let result = "";
  if (compareValue >= highThreshold) {
    result = field === "finalScore" ? "cell-high-score" : "cell-high";
  } else if (compareValue >= lowThreshold) {
    result = field === "finalScore" ? "cell-medium-score" : "cell-medium";
  } else {
    result = field === "finalScore" ? "cell-low-score" : "cell-low";
  }

  console.log(`Applied class: ${result} for field: ${field}`);
  return result;
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
