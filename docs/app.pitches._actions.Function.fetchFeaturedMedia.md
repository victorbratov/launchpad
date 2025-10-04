[**launchpad**](index.md)

***

> **fetchFeaturedMedia**(`pitchID`): `Promise`\<`string`\>

Defined in: [src/app/pitches/\_actions.ts:51](https://github.com/victorbratov/launchpad/blob/d1815ef1a573b42ac1f231f3f3d6617bddce6dbe/src/app/pitches/_actions.ts#L51)

Fetches the featured media for a given pitch from the S3 bucket
The featured media is stored in the folder named featured in the bucket

## Parameters

### pitchID

`string`

ID of the pitch to fetch media for

## Returns

`Promise`\<`string`\>

url of the featured media, or empty string if none found
