[**launchpad**](index.md)

***

> **investInPitch**(`busPitchID`, `amount`): `Promise`\<\{ `message`: `string`; `success`: `boolean`; \}\>

Defined in: [src/app/pitches/\[id\]/\_actions.ts:83](https://github.com/victorbratov/launchpad/blob/d1815ef1a573b42ac1f231f3f3d6617bddce6dbe/src/app/pitches/[id]/_actions.ts#L83)

Handles the investment (share purchase) process for a specific business pitch.

This server action performs validation, deducts the investment amount from the investor’s wallet,
records the investment in the ledger, and credits the business account wallet (optional).

### Validations:
- Ensures the user is authenticated.
- Confirms that the pitch exists.
- Verifies that the investor account exists.
- Checks that the investor has sufficient funds.
- Prevents investments that exceed the remaining target amount for the pitch.
- Determines the appropriate investment tier and calculates corresponding shares.

### Database Effects:
1. Updates the `InvestorAccounts` table to deduct the invested amount from the user’s wallet.
2. Inserts a new entry into the `InvestmentLedger` to record the transaction.
3. (Optional) Updates the `BusinessAccount` table to increment the business wallet.

## Parameters

### busPitchID

`number`

The unique ID of the business pitch being invested in.

### amount

`number`

The amount, in USD, the investor wishes to invest.

## Returns

`Promise`\<\{ `message`: `string`; `success`: `boolean`; \}\>

A success message and investment summary if the operation completes successfully.

## Throws

If the user is unauthenticated, pitch or investor not found, insufficient funds, or investment exceeds the target.
