import express, { Request, Response, NextFunction } from "express";
import { z, AnyZodObject } from "zod";

import migrations from "./concepts/01-migrations";
import transactions from "./concepts/02-transactions";
import typeSafety from "./concepts/03-type-safety";
import hardeningAccess from "./concepts/04-hardening-access";
import serverless from "./concepts/05-serverless";
import performance from "./concepts/06-performance";
import complexQueries from "./concepts/07-complex-queries";
import multiTenancy from "./concepts/08-multi-tenancy";

import prisma from "./db";

const app = express();
app.use(express.json());
app.set("subdomain offset", 1);

const validateRequest =
  (schema: AnyZodObject) =>
  async (req: Request, res: Response, next: NextFunction) => {
    console.log("the body", req.body);
    try {
      await schema.parseAsync({
        body: req.body,
        query: req.query,
        params: req.params,
      });
      return next();
    } catch (error) {
      return res.status(400).json(error);
    }
  };

app.get("/migrations", async (req: Request, res: Response) => {
  migrations(req, res);
});

app.post("/transactions", async (req: Request, res: Response) => {
  transactions(req, res);
});

const typeSafetySchema = z.object({
  body: z.object({
    accountName: z.string(),
    teamName: z.string(),
  }),
});

app.post(
  "/type-safety",
  validateRequest(typeSafetySchema),
  async (req: Request, res: Response) => {
    typeSafety(req, res);
  }
);

app.get("/hardening-access", async (req: Request, res: Response) => {
  hardeningAccess(req, res);
});

app.get("/serverless", async (req: Request, res: Response) => {
  serverless(req, res);
});

app.get("/performance", async (req: Request, res: Response) => {
  performance(req, res);
});

app.post("/complex-queries", async (req: Request, res: Response) => {
  complexQueries(req, res);
});

app.get("/multi-tenancy", async (req: Request, res: Response) => {
  multiTenancy(req, res);
});

app.get("/metrics", async (req: Request, res: Response) => {
  const metrics = await prisma.$metrics.json();
  return res.json(metrics);
});

app.listen(3000, () => {
  console.log("Server listening on port 3000");
});
