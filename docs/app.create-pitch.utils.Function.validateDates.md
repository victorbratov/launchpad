[**launchpad**](index.md)

***

> **validateDates**(`start`, `end`): `object`

Defined in: [src/app/create-pitch/utils.ts:7](https://github.com/victorbratov/launchpad/blob/76a3946e066bd4867b4d8959b0de6dc2965f2137/src/app/create-pitch/utils.ts#L7)

Validates the start and end dates, checking end is not before start, and start date is not in the past

## Parameters

### start

`Date`

start date

### end

`Date`

end date

## Returns

`object`

True or false, if the dates are valid or not

### message

> **message**: `string` = `'End date must be after start date'`

### success

> **success**: `boolean` = `false`
