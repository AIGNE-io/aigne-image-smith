import { LRUCache } from 'lru-cache';

import { authClient } from './auth';

const userCache = new LRUCache({
  max: 500,
  ttl: 1000 * 60 * 60 * 24,
});

export const searchUsers = async (options: { search: string }) => {
  const { search = '' } = options || {};
  const { users } = await authClient.getUsers({
    query: {
      search,
      approved: true,
    },
    paging: {
      pageSize: 50,
    },
  });
  return users.map((x: any) => ({
    avatar: x.avatar,
    fullName: x.fullName,
    did: x.did,
    locale: x.locale,
  }));
};
