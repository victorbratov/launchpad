import { Pitch } from "../types/pitch";

export const mockPitches: Pitch[] = [
  {
    pitcherID: "user1",
    pitchID: "p1",
    pitchName: "Solar-Powered Water Pumps",
    pitchGoal: 10000,
    currentAmount: 4200,
    pitchStart: "2024-01-01",
    pitchEnd: "2024-03-01",
    pitchImageUrl: "https://placehold.co/150x150",
    tags: ["green energy", "water", "sustainability"],
    pitchStatus: "Active", // 4200 < 10000
  },
  {
    pitcherID: "user2",
    pitchID: "p2",
    pitchName: "AI-Powered Language Tutor",
    pitchGoal: 20000,
    currentAmount: 20000,
    pitchStart: "2024-02-01",
    pitchEnd: "2024-04-01",
    pitchImageUrl: "https://placehold.co/150x150",
    tags: ["education", "AI", "language"],
    pitchStatus: "Funded", // = goal
  },
  {
    pitcherID: "user3",
    pitchID: "p3",
    pitchName: "Community Urban Garden",
    pitchGoal: 8000,
    currentAmount: 8000,
    pitchStart: "2024-02-15",
    pitchEnd: "2024-04-15",
    pitchImageUrl: "https://placehold.co/150x150",
    tags: ["community", "sustainability", "food"],
    pitchStatus: "Funded", // = goal
  },
  {
    pitcherID: "user4",
    pitchID: "p4",
    pitchName: "Recycled Fashion Startup",
    pitchGoal: 12000,
    currentAmount: 7200,
    pitchStart: "2024-01-20",
    pitchEnd: "2024-03-20",
    pitchImageUrl: "https://placehold.co/150x150",
    tags: ["fashion", "recycling", "green energy"],
    pitchStatus: "Active", // < goal
  },
  {
    pitcherID: "user5",
    pitchID: "p5",
    pitchName: "VR Science Education App",
    pitchGoal: 25000,
    currentAmount: 18000,
    pitchStart: "2024-02-01",
    pitchEnd: "2024-05-01",
    pitchImageUrl: "https://placehold.co/150x150",
    tags: ["VR", "education", "technology"],
    pitchStatus: "Active", // < goal
  },
  {
    pitcherID: "user6",
    pitchID: "p6",
    pitchName: "Electric Bike Sharing",
    pitchGoal: 30000,
    currentAmount: 30000,
    pitchStart: "2024-01-10",
    pitchEnd: "2024-04-10",
    pitchImageUrl: "https://placehold.co/150x150",
    tags: ["transportation", "green energy", "community"],
    pitchStatus: "Funded", // = goal
  },
  {
    pitcherID: "user7",
    pitchID: "p7",
    pitchName: "Indie Game Studio",
    pitchGoal: 15000,
    currentAmount: 4000,
    pitchStart: "2024-03-01",
    pitchEnd: "2024-06-01",
    pitchImageUrl: "https://placehold.co/150x150",
    tags: ["gaming", "indie", "technology"],
    pitchStatus: "Active", // < goal
  },
  {
    pitcherID: "user8",
    pitchID: "p8",
    pitchName: "Plastic-Free Packaging Solutions",
    pitchGoal: 18000,
    currentAmount: 18000,
    pitchStart: "2024-02-12",
    pitchEnd: "2024-05-12",
    pitchImageUrl: "https://placehold.co/150x150",
    tags: ["sustainability", "packaging", "green energy"],
    pitchStatus: "Funded", // = goal
  },
];
