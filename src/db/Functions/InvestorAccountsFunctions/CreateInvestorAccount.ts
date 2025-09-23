

    // +++++++++++ just exacuting a normal my sql code ++++++++++

// import {db} from "../../../db";

// async function getBusinessAccounts() {
//   const result = await db.execute(`
//     SELECT * FROM "BusinessAccount";
//   `);

//   console.log(result.rows); // all rows from the table
// }

// getBusinessAccounts();



import { db } from "../../../db";
import { BusinessAccount } from "../../schema";

async function getBusinessAccounts() {
  const allAccounts = await db.select().from(BusinessAccount);

  console.log(allAccounts);
}

getBusinessAccounts();
