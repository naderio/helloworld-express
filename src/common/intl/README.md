# INTL (Internationalization and Localization)

## Usage

```javascript
import intl from '../common/intl';

intl.current.$t('Log in');
// return translated text

intl.current.$t('Your event "%{}" have %{} subscribers', event.title, event.subscribersCount);
// return translated text

intl.current.$t('Last connection %{}', date);
// return translated text

intl.current.number(event.subscribersCount);
// return localized number

intl.current.currency(event.subscriptionFee);
// return localized number with currency

intl.current.date(new Date());
// return localized date

intl.current.time(new Date());
// return localized time

intl.current.timestamp(new Date());
// return localized timestamp
```
