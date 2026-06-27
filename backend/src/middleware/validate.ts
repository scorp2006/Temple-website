import { NextFunction, Request, Response } from 'express';
import { AnyZodObject, ZodError } from 'zod';

// Validates req.body / req.query / req.params against a Zod schema.
// On success, replaces them with the parsed (typed, coerced) values.
export const validate =
  (schema: AnyZodObject) =>
  (req: Request, _res: Response, next: NextFunction) => {
    try {
      const parsed = schema.parse({
        body: req.body,
        query: req.query,
        params: req.params,
      });
      if (parsed.body) req.body = parsed.body;
      // query/params are read-only getters in Express 5; assign defensively
      if (parsed.query) Object.assign(req.query, parsed.query);
      if (parsed.params) Object.assign(req.params, parsed.params);
      next();
    } catch (err) {
      if (err instanceof ZodError) return next(err);
      next(err);
    }
  };
