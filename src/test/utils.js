/* eslint-env jest */

import * as UserAccount from '~/module/auth/UserAccount.model';
import * as UserProfile from '~/module/auth/UserProfile.model';
import * as AuthService from '~/module/auth/AuthService';

export async function getAuthenticatedUserByEmail(email, audience) {
  const record = {};
  record.userAccount = await UserAccount.collection.findOne({ email });
  if (!record.userAccount) {
    throw new Error('User account not found');
  }
  record.accessToken = await AuthService.generateAccessToken(record.userAccount.id, audience);
  record.userProfile = await UserProfile.collection.findOne(record.userAccount._profile);
  record.userAccount = UserAccount.collection.toOwnUserAccount(record.userAccount);
  return JSON.parse(JSON.stringify(record));
}

// export async function getAuthenticatedUserByEmail(email, audience) {
//   const response = await fetch(`${CONFIG.API_ENDPOINT}/auth/login`, {
//     method: 'POST',
//     headers: {
//       'Content-Type': 'application/json',
//     },
//     body: JSON.stringify({
//       username: email,
//       password: 'password',
//     }),
//   });
//   const result = await response.json();
//   if (response.status !== 200) {
//     throw new Error(result.code);
//   }
//   return result;
// }

export function testUnauthenticatedFetch(message, fetchPromise) {
  test(message, async () => {
    const response = await fetchPromise();
    expect(response.status).toBe(401);
    const result = await response.json();
    expect(result.code).toBe('Unauthenticated');
  });
}

export function testUnauthorizedFetch(message, fetchPromise) {
  test(message, async () => {
    const response = await fetchPromise();
    expect(response.status).toBe(403);
    const result = await response.json();
    expect(result.code).toBe('Unauthorized');
  });
}
