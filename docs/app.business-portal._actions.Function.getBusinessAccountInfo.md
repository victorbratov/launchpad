[**launchpad**](index.md)

***

> **getBusinessAccountInfo**(): `Promise`\<\{ `email`: `string`; `name`: `string`; `wallet`: `string`; \}\>

Defined in: [src/app/business-portal/\_actions.ts:13](https://github.com/victorbratov/launchpad/blob/d14315d3bd6634bc1c0e4507f8ad0551e9221cbc/src/app/business-portal/_actions.ts#L13)

Get the information about the business account of the current user

## Returns

`Promise`\<\{ `email`: `string`; `name`: `string`; `wallet`: `string`; \}\>

Business account information including name, email and wallet balance

## Throws

Error if the user is not authenticated
