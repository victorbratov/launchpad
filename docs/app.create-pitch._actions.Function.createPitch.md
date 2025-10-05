[**launchpad**](index.md)

***

> **createPitch**(`pitch`): `Promise`\<\{ `message`: `string`; `success`: `boolean`; \}\>

Defined in: [src/app/create-pitch/\_actions.ts:48](https://github.com/victorbratov/launchpad/blob/d1815ef1a573b42ac1f231f3f3d6617bddce6dbe/src/app/create-pitch/_actions.ts#L48)

Create a pitch in the database

## Parameters

### pitch

[`Pitch`](app.create-pitch._actions.Interface.Pitch.md)

How often dividends will be paid out (monthly, yearly, etc.)

## Returns

`Promise`\<\{ `message`: `string`; `success`: `boolean`; \}\>

An object with success indicating the success of the pitch creation, and message holding either the successfully created pitch ID or an error message
