[**launchpad**](index.md)

***

> **getPitch**(`pitchId`): `Promise`\<\{ `bronseInvMax`: `number`; `bronseTierMulti`: `string`; `BusAccountID`: `string`; `BusPitchID`: `number`; `DetailedPitch`: `string`; `dividEndPayout`: `Date`; `DividEndPayoutPeriod`: `string`; `ElevatorPitch`: `string`; `goldTierMax`: `number`; `goldTierMulti`: `string`; `InvestmentEnd`: `Date`; `InvestmentStart`: `Date`; `InvProfShare`: `number`; `pricePerShare`: `string`; `ProductTitle`: `string`; `silverInvMax`: `number`; `silverTierMulti`: `string`; `statusOfPitch`: `string`; `SuportingMedia`: `null` \| `string`; `TargetInvAmount`: `string`; \}\>

Defined in: src/app/business-portal/\[Pitchid\]/\_actions.ts:12

## Parameters

### pitchId

`number`

Unique ID to search through BusinessPitches for. It then checks if the user is the creator of the pitch.

## Returns

`Promise`\<\{ `bronseInvMax`: `number`; `bronseTierMulti`: `string`; `BusAccountID`: `string`; `BusPitchID`: `number`; `DetailedPitch`: `string`; `dividEndPayout`: `Date`; `DividEndPayoutPeriod`: `string`; `ElevatorPitch`: `string`; `goldTierMax`: `number`; `goldTierMulti`: `string`; `InvestmentEnd`: `Date`; `InvestmentStart`: `Date`; `InvProfShare`: `number`; `pricePerShare`: `string`; `ProductTitle`: `string`; `silverInvMax`: `number`; `silverTierMulti`: `string`; `statusOfPitch`: `string`; `SuportingMedia`: `null` \| `string`; `TargetInvAmount`: `string`; \}\>

pitch object if the search is successful
