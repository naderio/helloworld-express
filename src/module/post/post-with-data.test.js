import { setupWithData } from '~/test/setup';

import * as Post from './Post.model';

describe('Post unit test with data', () => {
  setupWithData();

  describe('Post', () => {
    test('find', async () => {
      const records = await Post.collection.find();
      expect(records).toBeInstanceOf(Array);
      expect(records.length).toBe(0);
    });
  });
});
