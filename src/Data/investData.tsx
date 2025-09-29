/**
 * Represents an investment entry.
 * @typedef {Object} InvestEntry
 * @property {string} title - The name of the investment/project.
 * @property {string} roi - The return on investment (e.g., £12.00).
 * @property {string} tier - Investment tier (Bronze, Silver, Gold).
 * @property {string} progress - Progress status of the investment.
 */

/**
 * Example array of investment data.
 * @type {InvestEntry[]}
 */
export const investData = [
  {
    // Dummy Invest entries
    title: "Fresh Avocado",
    roi: "£12.00",
    tier: "Bronze Tier",
    progress: "Completed",
  },
  {
    title: "Organic Bananas",
    roi: "£25.50",
    tier: "Silver Tier",
    progress: "this is being read from a file!",
  },
  {
    title: "Tech Startup X",
    roi: "£150.00",
    tier: "Gold Tier",
    progress: "Completed",
  },
];
