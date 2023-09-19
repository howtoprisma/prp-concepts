import { Request, Response } from "express";
import prisma from "../../db";

const getScopedPrisma = (subdomain: string) => {
  return prisma.$extends({
    query: {
      $allModels: {
        async findMany({ model, operation, args, query }) {
          args.where = {
            ...args.where,
            account: {
              subdomain,
            },
          };

          return query(args);
        },
      },
    },
  });
};

const handler = async (req: Request, res: Response) => {
  if (req.subdomains.length !== 1) {
    res.status(400).json({
      error: {
        message: "Invalid subdomain",
      },
    });
    return;
  }

  const scopedPrisma = getScopedPrisma(req.subdomains[0]);

  // const account = await prisma.account.findUnique({
  //   where: {
  //     subdomain: req.subdomains[0],
  //   },
  // });

  // const users = await prisma.user.findMany({
  //   where: {
  //     memberships: {
  //       some: {
  //         team: {
  //           account: {
  //             subdomain: req.subdomains[0],
  //           },
  //         },
  //       },
  //     },
  //   },
  // });

  const products = await scopedPrisma.product.findMany();

  res.json({
    products,
  });
};

export default handler;
