function translateText(string, targetLang) {
  return $.ajax({
    url: "/translate",
    data: { msg: string, lang: targetLang }
  });
}
