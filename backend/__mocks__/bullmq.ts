// @ts-nocheck
import { jest } from "@jest/globals";

export const Queue = jest.fn().mockImplementation(() => ({
  add: jest.fn().mockResolvedValue({ id: "mock-job-id" }) as any,
  on: jest.fn() as any,
  close: jest.fn().mockResolvedValue(undefined) as any,
}));

export const Worker = jest.fn().mockImplementation(() => ({
  on: jest.fn() as any,
  close: jest.fn().mockResolvedValue(undefined) as any,
}));

export const Job = {
  fromId: jest.fn().mockResolvedValue({
    id: "mock-job-id",
    getState: jest.fn().mockResolvedValue("completed"),
    returnvalue: { success: true },
    progress: 100,
  } as any),
};
