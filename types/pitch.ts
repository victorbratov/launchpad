// types/pitch.ts
export type Pitch = {
  pitcherID: string;
  pitchID: string;
  pitchName: string;
  pitchStatus: string;
  pitchGoal: number;
  currentAmount: number;
  pitchStart: string;
  pitchEnd: string;
  pitchImageUrl: string | null;
  tags: string[];
};


//setting a data type for the pitches fetched from database
  export type Pitches = {
    BusPitchID: number;
    BusAccountID: string;
    statusOfPitch: string;
    ProductTitle: string;
    ElevatorPitch: string;
    DetailedPitch: string;
    SuportingMedia: string | null;
    FeaturedImage?: string | null;
    TargetInvAmount: string;
    InvestmentStart: string;
    InvestmentEnd: string;
    InvProfShare: number;
    pricePerShare: string;
    bronseTierMulti: string;
    bronseInvMax: number;
    silverTierMulti: string;
    silverInvMax: number;
    goldTierMulti: string;
    goldTierMax: number;
    dividEndPayout: string;
    DividEndPayoutPeriod: string;
    Tags: string[] | null;
  };

  export type Investment = {
    busPitchID: number;
    totalAmount: number;
  };
