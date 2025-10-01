import '@testing-library/jest-dom'
import { validateDates, validateMultipliers, validateMaxes, setPitchStatus } from '../app/create-pitch/utils'
import { checkBusinessAuthentication, createPitch } from '@/app/create-pitch/_actions'
import { db } from '@/db';
import { auth } from '@clerk/nextjs/server';
import { BusinessPitchs } from '@/db/schema';
import CreatePitchPage from '../app/create-pitch/page'
import { render, fireEvent, screen, waitFor } from '@testing-library/react';
import { MantineProvider } from '@mantine/core';
import userEvent from "@testing-library/user-event";

// mock dates so test passing is not day dependents
beforeAll(() => {
    jest.useFakeTimers();
    jest.setSystemTime(new Date(2025, 8, 30));
});

afterAll(() => {
    jest.useRealTimers();
});

// test create pitch util functions
describe('Create Pitch util functions', () => {


    describe('validateDates function', () => {
        it('should return that the dates are valid', () => {
            const start = new Date(2025, 9, 30);
            const end = new Date(2025, 10, 1);
            const { success, message } = validateDates(start, end);
            expect(success).toBe(true);
            expect(message).toBe('');
        });

        it('should return that the dates are valid when start date is today', () => {
            const start = new Date(2025, 8, 30);
            const end = new Date(2025, 10, 1);
            const { success, message } = validateDates(start, end);
            expect(success).toBe(true);
            expect(message).toBe('');
        });

        it('should return that start date is in the past', () => {
            const start = new Date(2025, 8, 29);
            const end = new Date(2025, 10, 1);
            const { success, message } = validateDates(start, end);
            expect(success).toBe(false);
            expect(message).toBe('Start date must be today or in the future');
        });

        it('should return that start date is after end date', () => {
            const start = new Date(2025, 10, 3);
            const end = new Date(2025, 10, 1);
            const { success, message } = validateDates(start, end);
            expect(success).toBe(false);
            expect(message).toBe('End date must be after start date');
        });

        it('should return that start date is in the past (older)', () => {
            const start = new Date(2025, 8, 28);
            const end = new Date(2025, 9, 1);
            const { success, message } = validateDates(start, end);
            expect(success).toBe(false);
            expect(message).toBe('Start date must be today or in the future');
        });
    });

    describe('validateMultipliers function', () => {
        it('should return valid multipliers', () => {
            const result = validateMultipliers("1.2", "1.3", "1.4");
            expect(result).toBe(true);
        });

        it('should return invalid multipliers', () => {
            const result = validateMultipliers("1.5", "1.3", "1.4");
            expect(result).toBe(false);
        });

        it('should return invalid multipliers for too many significant figures', () => {
            const result = validateMultipliers("1.3456", "1.3", "1.4");
            expect(result).toBe(false);
        });

        it('should return invalid multipliers when two are equal', () => {
            const result = validateMultipliers("1.3", "1.4", "1.4");
            expect(result).toBe(false);
        });
    });

    describe('validateMaxes function', () => {
        it('should return valid maxes', () => {
            const result = validateMaxes(100, 500, 1000);
            expect(result).toBe(true);
        });

        it('should return invalid maxes when second equals third', () => {
            const result = validateMaxes(100, 1000, 1000);
            expect(result).toBe(false);
        });

        it('should return invalid maxes when values are out of order', () => {
            const result = validateMaxes(1500, 900, 1000);
            expect(result).toBe(false);
        });
    });

    describe('setPitchStatus function', () => {
        it('should return open pitch status', () => {
            const date = new Date();
            const result = setPitchStatus(date);
            expect(result).toBe("Open");
        });

        it('should return pending pitch status', () => {
            const date = new Date(2025, 9, 30);
            const result = setPitchStatus(date);
            expect(result).toBe("Pending");
        });
    });
});


// Mock update call
jest.mock('@/db', () => ({
    db: {
        select: jest.fn(() => ({
            from: jest.fn(() => ({
                where: jest.fn(() => []),
            })),
        })),
        insert: jest.fn().mockReturnValue({
            values: jest.fn().mockReturnValue({
                returning: jest.fn().mockResolvedValue([{
                    BusAccountID: "123",
                    DetailedPitch: "detailed pitch",
                    DividEndPayoutPeriod: "quarterly",
                    ElevatorPitch: "elevator pitch",
                    InvProfShare: 0,
                    InvestmentEnd: new Date("2025-09-30T17:55:21.304Z"),
                    InvestmentStart: new Date("2025-09-30T17:55:21.304Z"),
                    ProductTitle: "Product title",
                    TargetInvAmount: "5000",
                    bronseInvMax: 200,
                    bronseTierMulti: "1.0",
                    dividEndPayout: new Date("2026-01-30T18:55:21.304Z"),
                    goldTierMax: 5000,
                    goldTierMulti: "1.5",
                    pricePerShare: "0",
                    silverInvMax: 500,
                    silverTierMulti: "1.2",
                    statusOfPitch: "active"
                }])
            })
        }),
        update: jest.fn().mockReturnValue({
            set: jest.fn().mockReturnValue({
                where: jest.fn().mockReturnValue({
                    returning: jest.fn().mockResolvedValue([
                        { BusPitchID: 123 }
                    ])
                })
            })
        }),
    }
}));

jest.mock('@clerk/nextjs/server', () => ({
    auth: jest.fn(),
}));

describe('check business account authentication', () => {
    it('returns false if user is not authenticated', async () => {
        (auth as unknown as jest.Mock).mockResolvedValue({ isAuthenticated: false, userId: null });

        const result = await checkBusinessAuthentication();
        expect(result).toBe(false);
    });

    it('returns true if user has a business account', async () => {
        (auth as unknown as jest.Mock).mockResolvedValue({ isAuthenticated: true, userId: "12345" });
        // get mock user data from the db
        (db.select as jest.Mock).mockReturnValueOnce({
            from: jest.fn().mockReturnValueOnce({
                where: jest.fn().mockResolvedValueOnce([{}]),
            }),
        });
        const result = await checkBusinessAuthentication();
        expect(result).toBe(true);
    });

    it('returns false if user exists but does not have a business account', async () => {
        (auth as unknown as jest.Mock).mockResolvedValue({ isAuthenticated: true, userId: "12345" });
        // get mock user data from the db
        (db.select as jest.Mock).mockReturnValueOnce({
            from: jest.fn().mockReturnValueOnce({
                where: jest.fn().mockResolvedValueOnce([]), // empty, so no record
            }),
        });
        const result = await checkBusinessAuthentication();
        expect(result).toBe(false);
    });
});

describe('create pitch in db', () => {
    const params = {
        BusAccountID: "123",
        DetailedPitch: "detailed pitch",
        DividEndPeriod: "quarterly",
        ElevatorPitch: "elevator pitch",
        InvProfShare: 0,
        InvestmentEnd: new Date("2025-09-30T17:55:21.304Z"),
        InvestmentStart: new Date("2025-09-30T17:55:21.304Z"),
        ProductTitle: "Product title",
        TargetInvAmount: "5000",
        bronseInvMax: 200,
        bronseTierMulti: "1.0",
        dividEndPayout: new Date("2025-09-30T17:55:21.304Z"),
        goldTierMax: 5000,
        goldTierMulti: "1.5",
        pricePerShare: "0",
        silverInvMax: 500,
        silverTierMulti: "1.2",
        statusOfPitch: "active"
    }

    it('returns error if user is not authenticated', async () => {
        (auth as unknown as jest.Mock).mockResolvedValue({ isAuthenticated: false, userId: null });
        const result = await createPitch(
            params.ProductTitle,
            params.statusOfPitch,
            params.ElevatorPitch,
            params.DetailedPitch,
            params.TargetInvAmount,
            params.InvestmentStart,
            params.InvestmentEnd,
            params.bronseTierMulti,
            params.bronseInvMax,
            params.silverTierMulti,
            params.silverInvMax,
            params.goldTierMulti,
            params.DividEndPeriod
        );
        expect(result).toEqual({ success: false, message: 'User not authenticated' });
    });

    it('successfully mocks create pitch', async () => {
        (auth as unknown as jest.Mock).mockResolvedValue({ isAuthenticated: true, userId: "123" });

        const result = await createPitch(
            params.ProductTitle,
            params.statusOfPitch,
            params.ElevatorPitch,
            params.DetailedPitch,
            params.TargetInvAmount,
            params.InvestmentStart,
            params.InvestmentEnd,
            params.bronseTierMulti,
            params.bronseInvMax,
            params.silverTierMulti,
            params.silverInvMax,
            params.goldTierMulti,
            params.DividEndPeriod
        );
        expect(db.insert).toHaveBeenCalledWith(BusinessPitchs);
        expect(db.insert(BusinessPitchs).values).toHaveBeenCalledWith(expect.objectContaining({
            BusAccountID: "123",
            DetailedPitch: "detailed pitch",
            DividEndPayoutPeriod: "quarterly",
            ElevatorPitch: "elevator pitch",
            InvProfShare: 0,
            InvestmentEnd: new Date("2025-09-30T17:55:21.304Z"),
            InvestmentStart: new Date("2025-09-30T17:55:21.304Z"),
            ProductTitle: "Product title",
            TargetInvAmount: "5000",
            bronseInvMax: 200,
            bronseTierMulti: "1.0",
            dividEndPayout: new Date("2026-01-30T18:55:21.304Z"),
            goldTierMax: 5000,
            goldTierMulti: "1.5",
            pricePerShare: "0",
            silverInvMax: 500,
            silverTierMulti: "1.2",
            statusOfPitch: "active"
        }));
    });
});


// mock navigation
jest.mock('next/navigation', () => ({
    useRouter: () => ({
        push: jest.fn(),
        replace: jest.fn(),
        back: jest.fn(),
        refresh: jest.fn(),
    }),
}));
// tests for succssful and failed file upload
describe("upload media component", () => {
    test("drop adds files", async () => {
        render(<MantineProvider><CreatePitchPage /></MantineProvider>);
        const dropzone = screen.getByTestId("dropzone");
        const file = new File(["file contents"], "img.png", { type: "image/png" });
        const data = {
            dataTransfer: {
                files: [file],
                items: [{ kind: "file", type: file.type, getAsFile: () => file }],
                types: ["Files"],
            },
        };

        fireEvent.drop(dropzone, data);

        expect(await screen.findByText("img.png")).toBeInTheDocument();
    });
});