[**launchpad**](index.md)

***

> **createPitch**(`pitch`): `Promise`\<\{ `message`: `string`; `success`: `boolean`; \}\>

Defined in: [src/app/create-pitch/\_actions.ts:48](https://github.com/victorbratov/launchpad/blob/3cec89d9fa4be2794c552b4b2e488c08b6798868/src/app/create-pitch/_actions.ts#L48)

Create a pitch in the database

## Parameters

### pitch

[`Pitch`](app.create-pitch._actions.Interface.Pitch.md)

## Returns

`Promise`\<\{ `message`: `string`; `success`: `boolean`; \}\>

An object with success indicating the success of the pitch creation, and message holding either the successfully created pitch ID or an error message
