export function returnToPreviousPage(historyLength: number, goBack: () => void, goHome: () => void) {
  if (historyLength > 1) {
    goBack();
    return "previous" as const;
  }

  goHome();
  return "home" as const;
}
