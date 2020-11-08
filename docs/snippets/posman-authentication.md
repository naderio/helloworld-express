# Postman Authentication

Following snippet should be placed in login `Tests` section in order to capture access token and user profile en environment variable

```javascript
tests['ok'] = responseCode.code === 200;

tests['Content-Type is present'] = postman.getResponseHeader('Content-Type').startsWith('application/json');

var responseJSON = JSON.parse(responseBody);

tests['have user account object'] = typeof responseJSON.userAccount === 'object' && responseJSON.userAccount;

tests['have token string'] = typeof responseJSON.accessToken === 'string';

postman.setEnvironmentVariable('ACCESS_TOKEN', responseJSON.accessToken);

postman.setEnvironmentVariable('AUDIENCE', responseJSON.audience);

postman.setEnvironmentVariable('USER_ID', responseJSON.userAccount.id);

postman.setEnvironmentVariable('USER_ROLE', responseJSON.userAccount.role);

postman.setEnvironmentVariable('USER_ACCOUNT', JSON.stringify(responseJSON.userAccount));

postman.setEnvironmentVariable('USER_PROFILE', JSON.stringify(responseJSON.userProfile));
```
