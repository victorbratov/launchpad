export type Investment = {
  investorID: string;
  investmentID: number;
  pitchID: number;
  pitchName: string;
  investmentDate: string;
  investmentCost: number;
  shareAmount: number;
  tier: string;
};

export type Dividend = {
  pitchID: number;
  pitchName: string;
  investmentID: number;
  dividendAmount: number;
  dividendDate: string;
};

export type InvestorInfo = {
  investorID: string;
  name: string;
  email: string;
  bankAccNum: number;
  walletAmount: number;
};
