export type Investment = {
  investorID: string;
  investmentID: string;
  pitchID: string;
  pitchName: string;
  investmentDate: string;
  investmentCost: number;
  shareAmount: number;
  tier: string;
};

export type Dividend = {
  pitchID: string;
  pitchName: string;
  investmentID: string;
  dividendAmount: number;
  dividendDate: string;
};

export type InvestorInfo = {
  investorID: number;
  name: string;
  email: string;
  bankAccNum: number;
  walletAmount: number;
};

// ------------------- MOCK DATA -------------------

export const investorInfo: InvestorInfo = {
  investorID: 123,
  name: "Jane Doe",
  email: "jane.doe@example.com",
  bankAccNum: 4567890123,
  walletAmount: 5200,
};

export const investments: Investment[] = [
  {
    investorID: "123",
    investmentID: "inv1",
    pitchID: "p1",
    pitchName: "SunDrop: Solar Irrigation",
    investmentDate: "2024-01-10",
    investmentCost: 1500,
    shareAmount: 1800,
    tier: "Silver",
  },
  {
    investorID: "123",
    investmentID: "inv2",
    pitchID: "p2",
    pitchName: "EduAI: Language Tutor",
    investmentDate: "2024-02-14",
    investmentCost: 1000,
    shareAmount: 1200,
    tier: "Bronze",
  },
  {
    investorID: "123",
    investmentID: "inv3",
    pitchID: "p3",
    pitchName: "EcoThreads: Recycled Fashion",
    investmentDate: "2024-03-02",
    investmentCost: 2000,
    shareAmount: 3000,
    tier: "Gold",
  },
  {
    investorID: "123",
    investmentID: "inv4",
    pitchID: "p4",
    pitchName: "FreshHarvest: Urban Farming",
    investmentDate: "2024-03-20",
    investmentCost: 1200,
    shareAmount: 1440,
    tier: "Silver",
  },
  {
    investorID: "123",
    investmentID: "inv5",
    pitchID: "p5",
    pitchName: "VoltRide: E-Bike Sharing",
    investmentDate: "2024-04-05",
    investmentCost: 1800,
    shareAmount: 2160,
    tier: "Silver",
  },
];

export const dividends: Dividend[] = [
  // SunDrop (p1)
  {
    pitchID: "p1",
    pitchName: "SunDrop: Solar Irrigation",
    investmentID: "inv1",
    dividendAmount: 120,
    dividendDate: "2024-03-31",
  },
  {
    pitchID: "p1",
    pitchName: "SunDrop: Solar Irrigation",
    investmentID: "inv1",
    dividendAmount: 150,
    dividendDate: "2024-06-30",
  },
  {
    pitchID: "p1",
    pitchName: "SunDrop: Solar Irrigation",
    investmentID: "inv1",
    dividendAmount: 130,
    dividendDate: "2024-09-30",
  },

  // EduAI (p2)
  {
    pitchID: "p2",
    pitchName: "EduAI: Language Tutor",
    investmentID: "inv2",
    dividendAmount: 80,
    dividendDate: "2024-03-31",
  },
  {
    pitchID: "p2",
    pitchName: "EduAI: Language Tutor",
    investmentID: "inv2",
    dividendAmount: 90,
    dividendDate: "2024-06-30",
  },

  // EcoThreads (p3)
  {
    pitchID: "p3",
    pitchName: "EcoThreads: Recycled Fashion",
    investmentID: "inv3",
    dividendAmount: 200,
    dividendDate: "2024-06-30",
  },
  {
    pitchID: "p3",
    pitchName: "EcoThreads: Recycled Fashion",
    investmentID: "inv3",
    dividendAmount: 250,
    dividendDate: "2024-09-30",
  },

  // FreshHarvest (p4)
  {
    pitchID: "p4",
    pitchName: "FreshHarvest: Urban Farming",
    investmentID: "inv4",
    dividendAmount: 100,
    dividendDate: "2024-06-30",
  },

  // VoltRide (p5)
  {
    pitchID: "p5",
    pitchName: "VoltRide: E-Bike Sharing",
    investmentID: "inv5",
    dividendAmount: 150,
    dividendDate: "2024-06-30",
  },
  {
    pitchID: "p5",
    pitchName: "VoltRide: E-Bike Sharing",
    investmentID: "inv5",
    dividendAmount: 170,
    dividendDate: "2024-09-30",
  },
];
