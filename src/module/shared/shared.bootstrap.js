import * as PermanentDataStore from '~/common/PermanentDataStoreService';

export default async () => {
  await PermanentDataStore.retrieveOrStore('APP_PARAMETER', 'VALUE');
};
