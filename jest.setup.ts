import '@testing-library/jest-dom'
import React from 'react'

jest.mock('next/image', () => ({
  __esModule: true,
  default: (props: any) => {
    return React.createElement('img', props)
  },
}))

jest.mock('next/link', () => ({
  __esModule: true,
  default: ({ children, href, ...props }: any) => {
    return React.createElement('a', { href, ...props }, children)
  },
}))

jest.mock('@/lib/s3_utils', () => ({
  fetchFeaturedMedia: jest.fn().mockResolvedValue(null),
  fetchAllMedia: jest.fn().mockResolvedValue([]),
}))

jest.mock('@/app/actions', () => ({
  updateAdvertCount: jest.fn(),
  getAdvertisementPitches: jest.fn(),
  getLatestPitchVersion: jest.fn(),
}))

jest.mock('dotenv', () => ({
  config: jest.fn(),
}))

jest.mock('@neondatabase/serverless', () => ({
  Pool: jest.fn().mockImplementation(() => ({
    query: jest.fn().mockResolvedValue({ rows: [], rowCount: 0 }),
    end: jest.fn().mockResolvedValue(undefined),
  })),
}))

jest.mock('drizzle-orm/neon-serverless', () => ({
  drizzle: jest.fn(() => ({
    select: jest.fn().mockReturnThis(),
    from: jest.fn().mockReturnThis(),
    where: jest.fn().mockReturnThis(),
    insert: jest.fn().mockReturnThis(),
    values: jest.fn().mockReturnThis(),
    update: jest.fn().mockReturnThis(),
    set: jest.fn().mockReturnThis(),
    delete: jest.fn().mockReturnThis(),
    execute: jest.fn().mockResolvedValue([]),
    transaction: jest.fn().mockImplementation((callback) => callback({
      select: jest.fn().mockReturnThis(),
      from: jest.fn().mockReturnThis(),
      where: jest.fn().mockReturnThis(),
      insert: jest.fn().mockReturnThis(),
      values: jest.fn().mockReturnThis(),
      update: jest.fn().mockReturnThis(),
      set: jest.fn().mockReturnThis(),
      delete: jest.fn().mockReturnThis(),
    })),
  })),
}))

jest.mock('@/db', () => ({
  db: {
    select: jest.fn().mockReturnThis(),
    from: jest.fn().mockReturnThis(),
    where: jest.fn().mockReturnThis(),
    insert: jest.fn().mockReturnThis(),
    values: jest.fn().mockReturnThis(),
    update: jest.fn().mockReturnThis(),
    set: jest.fn().mockReturnThis(),
    delete: jest.fn().mockReturnThis(),
    execute: jest.fn().mockResolvedValue([]),
    transaction: jest.fn().mockImplementation((callback) => callback({
      select: jest.fn().mockReturnThis(),
      from: jest.fn().mockReturnThis(),
      where: jest.fn().mockReturnThis(),
      insert: jest.fn().mockReturnThis(),
      values: jest.fn().mockReturnThis(),
      update: jest.fn().mockReturnThis(),
      set: jest.fn().mockReturnThis(),
      delete: jest.fn().mockReturnThis(),
    })),
  }
}))

jest.mock('@/app/business-portal/_actions', () => ({
  depositFunds: jest.fn().mockResolvedValue(undefined),
  makeAdPayment: jest.fn().mockResolvedValue(undefined),
  declareProfits: jest.fn().mockResolvedValue(undefined),
}))

jest.mock('@clerk/nextjs', () => ({
  SignedIn: ({ children }: any) => children,
  SignedOut: ({ children }: any) => children,
  SignInButton: ({ children }: any) => children,
  SignUpButton: ({ children }: any) => children,
  UserButton: () => React.createElement('div', { 'data-testid': 'user-button' }, 'User Button'),
}))

jest.mock('lucide-react', () => ({
  Menu: () => React.createElement('div', { 'data-testid': 'menu-icon' }, 'Menu'),
  MenuIcon: () => React.createElement('div', { 'data-testid': 'menu-icon' }, 'Menu'),
}))

jest.mock('embla-carousel-react', () => ({
  useEmblaCarousel: jest.fn(() => [
    React.createElement('div', { 'data-testid': 'carousel' }, 'Carousel'),
    {
      scrollTo: jest.fn(),
      selectedScrollSnap: jest.fn(() => 0),
      on: jest.fn(),
    }
  ]),
}))

jest.mock('events', () => ({
  on: jest.fn(),
}))

process.env.NEXT_PUBLIC_BUCKET_URL = 'https://mock-bucket.s3.amazonaws.com'
process.env.DATABASE_URL = 'postgresql://mock:mock@localhost:5432/mock'
