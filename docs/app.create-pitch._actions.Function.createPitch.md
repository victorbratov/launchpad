[**launchpad**](index.md)

***

> **createPitch**(`title`, `status`, `elevatorPitch`, `detailedPitch`, `targetAmount`, `startDate`, `endDate`, `bronzeMultiplier`, `bronzeMax`, `silverMultiplier`, `silverMax`, `goldMultiplier`, `dividendPayoutPeriod`): `Promise`\<`undefined` \| \{ `message`: `string`; `success`: `boolean`; \}\>

Defined in: [src/app/create-pitch/\_actions.ts:46](https://github.com/victorbratov/launchpad/blob/76a3946e066bd4867b4d8959b0de6dc2965f2137/src/app/create-pitch/_actions.ts#L46)

Create pitch creates a new pitch in the database with all of the relevant data

## Parameters

### title

`string`

Pitch title

### status

`string`

### elevatorPitch

`string`

Brief description of the pitch

### detailedPitch

`string`

Detialed description of the pitch

### targetAmount

`string`

The funding goal amount

### startDate

`Date`

Start date of the pitch

### endDate

`Date`

End date of the pitch

### bronzeMultiplier

`string`

Multiplier for bronze shares

### bronzeMax

`number`

Max amount the user spends to be in the bronze tier

### silverMultiplier

`string`

multiplier for silver shares

### silverMax

`number`

Max amount the user spends to be in the silver tier

### goldMultiplier

`string`

multiplier for gold shares

### dividendPayoutPeriod

`string`

## Returns

`Promise`\<`undefined` \| \{ `message`: `string`; `success`: `boolean`; \}\>
