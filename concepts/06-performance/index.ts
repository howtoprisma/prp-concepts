import { Request, Response } from "express";
import prisma from "./../../db";

const timingClient = prisma.$extends({
  query: {
    async $allOperations({ operation, model, args, query }) {
      const start = Date.now();
      const result = await query(args);
      const end = Date.now() - start;

      console.log(`Query took ${end}ms`);

      return result;
    },
  },
});

const simpleTiming = async () => {
  const start = Date.now();
  const users = await prisma.user.findMany();
  const end = Date.now() - start;

  console.log(`Query took ${end}ms`);

  return users;
};

const extendedClientTiming = async () => {
  return timingClient.user.findMany();
};

const handler = async (req: Request, res: Response) => {
  const users = await extendedClientTiming();

  res.json(users);
};

export default handler;
