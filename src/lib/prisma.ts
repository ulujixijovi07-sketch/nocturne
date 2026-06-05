// Prisma has been replaced with static JSON data.
// See src/lib/data.ts for the data access layer.
// This stub exists so old imports don't break immediately;
// pages should be updated to use src/lib/data instead.

const noop = () => {
  throw new Error("Prisma is disabled. Use src/lib/data.ts for data access.");
};

export const prisma = new Proxy({} as any, { get: () => noop });
