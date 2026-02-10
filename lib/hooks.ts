import useSWR from "swr";
import { fetchProduct, fetchProducts, type ApiProduct } from "./api";

/**
 * Hook to fetch and cache a single product by id.
 * 
 * - Uses fetchProduct(id) as the fetcher
 * - Cache key: `product-${id}`
 * - Does not fetch if id is undefined
 * - Disables revalidation on window focus
 * - Caches data for 10 minutes
 * - Returns: product, isLoading, error
 */
export function useProduct(id?: string) {
  const { data, error, isLoading } = useSWR(
    id ? `product-${id}` : null,
    () => (id ? fetchProduct(id) : Promise.reject(new Error("No product id provided"))),
    {
      revalidateOnFocus: false,
      dedupingInterval: 10 * 60 * 1000, // 10 minutes
    }
  );

  return {
    product: data as ApiProduct | undefined,
    isLoading,
    error: error ? (error instanceof Error ? error.message : String(error)) : null,
  };
}

/**
 * Hook to fetch and cache products by category.
 * 
 * - Fetches using fetchProducts({ category: categoryId })
 * - Cache key includes categoryId
 * - Caches for 5 minutes
 * - Does not refetch on focus
 * - Returns: products (array, defaults to []), loading, error
 */
export function useProductsByCategory(categoryId?: string) {
  const { data, error, isLoading } = useSWR(
    categoryId ? `products-category-${categoryId}` : null,
    () =>
      categoryId
        ? fetchProducts({ category: categoryId })
        : Promise.reject(new Error("No category id provided")),
    {
      revalidateOnFocus: false,
      dedupingInterval: 5 * 60 * 1000, // 5 minutes
    }
  );

  return {
    products: (data as ApiProduct[]) || [],
    loading: isLoading,
    error: error ? (error instanceof Error ? error.message : String(error)) : null,
  };
}

/**
 * Hook to fetch and cache trending/popular products.
 * 
 * - Fetches using fetchProducts({ trending: true })
 * - Cache key: `trending-products`
 * - Caches for 5 minutes
 * - Does not refetch on focus
 * - Returns: products (array, defaults to []), loading, error
 */
export function useTrendingProducts() {
  const { data, error, isLoading } = useSWR(
    "trending-products",
    () => fetchProducts({ trending: true }),
    {
      revalidateOnFocus: false,
      dedupingInterval: 5 * 60 * 1000, // 5 minutes
    }
  );

  return {
    products: (data as ApiProduct[]) || [],
    loading: isLoading,
    error: error ? (error instanceof Error ? error.message : String(error)) : null,
  };
}
