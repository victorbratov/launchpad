import { BusinessPitch } from '@/db/types'

export const mockS3Utils = {
  fetchFeaturedMedia: jest.fn(),
  fetchAllMedia: jest.fn(),
}

export const mockDbActions = {
  updateAdvertCount: jest.fn(),
  getAdvertisementPitches: jest.fn(),
  getLatestPitchVersion: jest.fn(),
}

export function createMockPitch(overrides: Partial<BusinessPitch> = {}): BusinessPitch {
  return {
    instance_id: "test-instance-1",
    pitch_id: "test-pitch-1",
    version: 1,
    business_account_id: "test-business-1",
    created_at: new Date("2023-01-01T00:00:00Z"),
    status: "draft",
    product_title: "Test Product",
    elevator_pitch: "A short pitch for testing.",
    detailed_pitch: "This is a detailed pitch used for snapshot testing.",
    supporting_media: null,
    target_investment_amount: 100000,
    raised_amount: 5000,
    investor_profit_share_percent: 10,
    start_date: new Date("2023-02-01T00:00:00Z"),
    end_date: new Date("2023-12-31T23:59:59Z"),
    bronze_multiplier: 1.1,
    silver_multiplier: 1.2,
    gold_multiplier: 1.3,
    silver_threshold: 20000,
    gold_threshold: 30000,
    dividend_payout_period: "quarterly",
    next_payout_date: new Date("2023-05-01T00:00:00Z"),
    tags: ["AI", "tech"],
    adverts_available: 100,
    total_advert_clicks: 10,
    ...overrides,
  }
}

export function resetAllMocks() {
  mockS3Utils.fetchFeaturedMedia.mockResolvedValue(null)
  mockS3Utils.fetchAllMedia.mockResolvedValue([])
  mockDbActions.updateAdvertCount.mockResolvedValue(undefined)
  mockDbActions.getAdvertisementPitches.mockResolvedValue([])
  mockDbActions.getLatestPitchVersion.mockResolvedValue(undefined)
}
