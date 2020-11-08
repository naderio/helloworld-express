export const TIME_ZONE = Intl.DateTimeFormat().resolvedOptions().timeZone;

export function defineLocale(localeCode, defaults = {}) {
  defaults = {
    timeZone: TIME_ZONE,
    currency: 'USD',
    ...defaults,
  };

  let translations = {};

  const locale = {
    setTranslations(_translations) {
      translations = _translations;
    },

    updateTranslations(_translations) {
      translations = { ...translations, _translations };
    },

    $t(text, ...args) {
      text = translations[text] || text;
      args.forEach((arg) => {
        text = text.replace('%{}', arg);
      });
      return text;
    },

    number(value, options = {}) {
      return value.toLocaleString(localeCode, options);
    },

    // currency(value, currency = defaults.currency, options = {}) {
    //   return `${value.toLocaleString(localeCode, options)} ${currency}`;
    // },

    currency(value, currency = defaults.currency, options = {}) {
      return value.toLocaleString(localeCode, {
        style: 'currency',
        currency,
        ...options,
      });
    },

    date(value, options = {}) {
      return value.toLocaleDateString(localeCode, {
        ...options,
        timeZone: options.timeZone || defaults.timeZone,
      });
    },

    time(
      value,
      options = {
        hour: 'numeric',
        minute: 'numeric',
      },
    ) {
      return value.toLocaleTimeString(localeCode, {
        ...options,
        timeZone: options.timeZone || defaults.timeZone,
      });
    },
  };

  Object.assign(locale, {
    timestamp(value) {
      return `${locale.date(value)} ${locale.time(value)}`;
    },
  });

  return locale;
}

const intl = {};

intl.en = defineLocale('en');

intl.current = intl.en;

export default intl;
