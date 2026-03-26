// @ts-nocheck
import { jest } from "@jest/globals";

const RedisMock = jest.fn().mockImplementation(() => ({
  on: jest.fn() as any,
  get: jest.fn().mockResolvedValue(null) as any,
  set: jest.fn().mockResolvedValue("OK") as any,
  del: jest.fn().mockResolvedValue(1) as any,
  quit: jest.fn().mockResolvedValue("OK") as any,
  status: "ready",
}));

export default RedisMock;
