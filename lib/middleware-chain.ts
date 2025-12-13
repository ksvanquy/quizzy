import { NextRequest, NextResponse } from 'next/server';
import { GlobalErrorHandler } from '@/lib/error-handler';
import { loggingMiddleware } from '@/lib/request-logger';
import { logger } from '@/lib/logger/logger';

/**
 * Middleware chain executor
 * Applies multiple middlewares in sequence
 */
export class MiddlewareChain {
  private middlewares: Array<
    (req: NextRequest, next: (req: NextRequest) => Promise<NextResponse>) => Promise<NextResponse>
  > = [];

  use(
    middleware: (req: NextRequest, next: (req: NextRequest) => Promise<NextResponse>) => Promise<NextResponse>
  ) {
    this.middlewares.push(middleware);
    return this;
  }

  async execute(
    request: NextRequest,
    finalHandler: (req: NextRequest) => Promise<NextResponse>
  ): Promise<NextResponse> {
    let index = -1;

    const dispatch = async (i: number): Promise<NextResponse> => {
      if (i <= index) {
        return new NextResponse('Internal middleware error', { status: 500 });
      }

      index = i;

      try {
        if (i >= this.middlewares.length) {
          return await finalHandler(request);
        }

        const middleware = this.middlewares[i];
        return await middleware(request, (req) => dispatch(i + 1));
      } catch (error) {
        logger.error('Middleware error', error as Error);
        return GlobalErrorHandler.handle(error);
      }
    };

    return dispatch(0);
  }
}

/**
 * Create a middleware chain with logging and error handling
 */
export function createApiHandler(
  handler: (request: NextRequest) => Promise<NextResponse>
) {
  return async (request: NextRequest) => {
    try {
      return await loggingMiddleware(request, handler);
    } catch (error) {
      return GlobalErrorHandler.handle(error);
    }
  };
}
