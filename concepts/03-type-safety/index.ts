import { Request, Response } from "express";
import { Prisma } from "@prisma/client";

import prisma from "../../db";

const validateTeamData = (accountName: string, teamName: string) => {
  return Prisma.validator<Prisma.TeamCreateInput>()({
    name: teamName,
    account: {
      create: {
        name: accountName,
      },
    },
  });
};

const validateTeamDataSelector = (accountName: string, teamName: string) => {
  return Prisma.validator(
    prisma,
    "team",
    "create",
    "data"
  )({
    name: teamName,
    account: {
      create: {
        name: accountName,
      },
    },
  });
};

const handler = async (req: Request, res: Response) => {
  const accountName: string = req.body.accountName;
  const teamName: string = req.body.teamName;

  const team = await prisma.team.create({
    data: validateTeamDataSelector(accountName, teamName),
  });

  res.json({ team });
};

export default handler;
