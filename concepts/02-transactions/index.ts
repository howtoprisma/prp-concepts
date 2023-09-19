import prisma from "../../db";
import { Request, Response } from "express";
import namor from "namor";

const asIndividual = async (req: Request, res: Response) => {
  const user = await prisma.user.create({
    data: {
      firstName: req.body.firstName,
      lastName: req.body.lastName,
      email: req.body.email,
    },
  });

  const account = await prisma.account.create({
    data: {
      name: req.body.accountName,
    },
  });

  const team = await prisma.team.create({
    data: {
      name: req.body.teamName,
      accountId: account.id,
    },
  });

  const membership = await prisma.membership.create({
    data: {
      teamId: team.id,
      userId: user.id,
    },
  });

  return {
    user,
    account,
    team,
    membership,
  };
};

const asNested = async (req: Request, res: Response) => {
  const user = await prisma.user.create({
    data: {
      firstName: req.body.firstName,
      lastName: req.body.lastName,
      email: req.body.email,
      memberships: {
        create: {
          team: {
            create: {
              name: req.body.teamName,
              account: {
                create: {
                  name: req.body.accountName,
                },
              },
            },
          },
        },
      },
    },
    include: {
      memberships: {
        include: {
          team: {
            include: {
              account: true,
            },
          },
        },
      },
    },
  });

  return {
    user,
    account: user.memberships[0].team.account,
    team: user.memberships[0].team,
    membership: user.memberships[0],
  };
};

const asSequential = async (req: Request, res: Response) => {
  const [user, account] = await prisma.$transaction([
    prisma.user.create({
      data: {
        firstName: req.body.firstName,
        lastName: req.body.lastName,
        email: req.body.email,
      },
    }),
    prisma.account.create({
      data: {
        name: req.body.accountName,
      },
    }),
  ]);

  return { user, account };
};

const getRandomSubdomain = async () => {
  // simulate waiting for 2.5 seconds to get a random subdomain
  await new Promise((resolve) => setTimeout(resolve, 2500));
  return namor.generate({ words: 2 });
};

const asInteractive = async (req: Request, res: Response) => {
  return await prisma.$transaction(async (tx) => {
    const user = await tx.user.create({
      data: {
        firstName: req.body.firstName,
        lastName: req.body.lastName,
        email: req.body.email,
      },
    });

    const subdomain = await getRandomSubdomain();

    const account = await tx.account.create({
      data: {
        name: req.body.accountName,
        subdomain,
      },
    });

    const team = await tx.team.create({
      data: {
        name: req.body.teamName,
        account: {
          connect: {
            id: account.id,
          },
        },
      },
    });

    const membership = await tx.membership.create({
      data: {
        team: {
          connect: {
            id: team.id,
          },
        },
        user: {
          connect: {
            id: user.id,
          },
        },
      },
    });

    return { user, account, team, membership };
  });
};

const handler = async (req: Request, res: Response) => {
  console.log(req.body);

  const { user, account, team, membership } = await asInteractive(req, res);

  res.json({
    data: {
      user,
      account,
      team,
      membership,
    },
  });
};

export default handler;
