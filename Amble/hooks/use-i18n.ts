import { useLanguageStore } from "../store/languageStore";
import { LOCALES, translate } from "../utils/i18n";

export function useI18n() {
  const language = useLanguageStore((state) => state.language);

  const t = (key: string, vars?: Record<string, string | number>) =>
    translate(key, language, vars);

  const locale = LOCALES[language];

  return { t, language, locale };
}
