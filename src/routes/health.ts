import { Router, Request, Response } from 'express';

const healthRouter = Router();

healthRouter.get('/', (req: Request, res: Response) => {
  res.status(200).send({ status: 'OK', message: 'Service is healthy' });
});

export default healthRouter;
