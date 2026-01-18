import { PaginationOptions } from '@/interfaces/repositories';

import { DEFAULT_PAGE_SIZE, MAX_PAGE_SIZE, MIN_PAGE_SIZE } from './constants';

/**
 * Parses pagination and ordering parameters from a request URL
 * Centralizes the logic used in various API routes to ensure consistency
 */
export function getPaginationOptions(
  url: string,
  allowedOrderFields: readonly string[],
  defaultOrderField: string = 'createdAt',
): PaginationOptions {
  const { searchParams } = new URL(url);
  const limitParam = searchParams.get('limit');
  const offsetParam = searchParams.get('offset');
  const orderParam = searchParams.get('order') || `${defaultOrderField}:desc`;

  const limit = Math.min(
    Math.max(
      parseInt(limitParam || String(DEFAULT_PAGE_SIZE), 10) || DEFAULT_PAGE_SIZE,
      MIN_PAGE_SIZE,
    ),
    MAX_PAGE_SIZE,
  );
  const offset = Math.max(parseInt(offsetParam || '0', 10) || 0, 0);

  const [orderField, orderDir] = orderParam.split(':');

  const validatedOrderField = allowedOrderFields.includes(orderField)
    ? orderField
    : defaultOrderField;

  return {
    orderBy: validatedOrderField,
    orderDir: (orderDir?.toLowerCase() as 'asc' | 'desc') || 'desc',
    limit,
    offset,
  };
}
