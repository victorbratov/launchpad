[**launchpad**](index.md)

***

> **createPitch**(`pitch`): `Promise`\<\{ `message`: `string`; `success`: `boolean`; \}\>

Defined in: [src/app/create-pitch/\_actions.ts:46](https://github.com/victorbratov/launchpad/blob/ba912ff5e4884ef55d41a8ab239f2bb8e81f8ecb/src/app/create-pitch/_actions.ts#L46)

Create a pitch in the database

## Parameters

### pitch

[`Pitch`](app.create-pitch._actions.Interface.Pitch.md)

## Returns

`Promise`\<\{ `message`: `string`; `success`: `boolean`; \}\>

An object with success indicating the success of the pitch creation, and message holding either the successfully created pitch ID or an error message
