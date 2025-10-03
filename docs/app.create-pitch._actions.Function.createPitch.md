[**launchpad**](index.md)

***

> **createPitch**(`title`, `status`, `elevatorPitch`, `detailedPitch`, `targetAmount`, `startDate`, `endDate`, `bronzeMultiplier`, `bronzeMax`, `silverMultiplier`, `silverMax`, `goldMultiplier`, `dividendPayoutPeriod`): `Promise`\<\{ `message`: `string`; `success`: `boolean`; \}\>

Defined in: src/app/create-pitch/\_actions.ts:41

Create a pitch in the database

## Parameters

### title

`string`

Pitch title

### status

`string`

Pitch status (pending, open)

### elevatorPitch

`string`

Elevator pitch

### detailedPitch

`string`

Detailed pitch overview

### targetAmount

`string`

Target funding amount

### startDate

`Date`

Pitch start date

### endDate

`Date`

Pitch end date

### bronzeMultiplier

`string`

Bronze multiplier

### bronzeMax

`number`

Bronze tier maximum

### silverMultiplier

`string`

silver multiplier

### silverMax

`number`

Silver tier maximum

### goldMultiplier

`string`

Gold multiplier

### dividendPayoutPeriod

`string`

How often dividends will be paid out (monthly, yearly, etc.)

## Returns

`Promise`\<\{ `message`: `string`; `success`: `boolean`; \}\>

An object with success indicating the success of the pitch creation, and message holding either the successfully created pitch ID or an error message
