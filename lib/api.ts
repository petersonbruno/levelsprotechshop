const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000/";

// Helper function to get auth headers
function getAuthHeaders(includeContentType: boolean = true): HeadersInit {
  const token = typeof window !== "undefined" ? localStorage.getItem("levelsproshop_auth") : null;
  const headers: HeadersInit = {};
  
  if (includeContentType) {
    headers["Content-Type"] = "application/json";
  }
  
  if (token) {
    try {
      const authData = JSON.parse(token);
      if (authData.token) {
        headers["Authorization"] = `Token ${authData.token}`;
      }
    } catch (e) {
      // Invalid token format, ignore
    }
  }
  
  return headers;
}

// Normalize image URL - converts relative URLs to absolute URLs
export function normalizeImageUrl(url: string | undefined | null): string {
  if (!url) return "";
  
  // If already absolute URL, return as is
  if (url.startsWith("http://") || url.startsWith("https://")) {
    return url;
  }
  
  // If relative URL (starts with /), prepend API base URL
  if (url.startsWith("/")) {
    const baseUrl = API_BASE_URL.endsWith("/") ? API_BASE_URL.slice(0, -1) : API_BASE_URL;
    return `${baseUrl}${url}`;
  }
  
  // Otherwise, assume it's relative and prepend API base URL
  const baseUrl = API_BASE_URL.endsWith("/") ? API_BASE_URL : `${API_BASE_URL}/`;
  return `${baseUrl}${url}`;
}

export type ApiProduct = {
  id: string;
  name: string;
  category: string;
  price: string;
  specs: string[];
  warranty: string;
  image_urls: string[];
  created_at?: string;
  updated_at?: string;
};

export type ApiResponse<T> = {
  success: boolean;
  data: T;
  message?: string;
  error?: string;
  details?: string;
};

export type ProductsListResponse = {
  products: ApiProduct[];
  count: number;
  limit: number;
  offset: number;
  total_pages: number;
};

// Fetch all products with optional filters
export async function fetchProducts(params?: {
  category?: string;
  search?: string;
  limit?: number;
  offset?: number;
  sort?: string;
  trending?: boolean;
}): Promise<ApiProduct[]> {
  try {
    const queryParams = new URLSearchParams();
    if (params?.category) queryParams.append("category", params.category);
    if (params?.search) queryParams.append("search", params.search);
    if (params?.limit) queryParams.append("limit", params.limit.toString());
    if (params?.offset) queryParams.append("offset", params.offset.toString());
    if (params?.sort) queryParams.append("sort", params.sort);
    if (params?.trending !== undefined) queryParams.append("trending", params.trending ? "true" : "false");

    const url = `${API_BASE_URL}api/products/${queryParams.toString() ? `?${queryParams.toString()}` : ""}`;
    const response = await fetch(url);

    if (!response.ok) {
      throw new Error(`Failed to fetch products: ${response.statusText}`);
    }

    const data: ApiResponse<ProductsListResponse> = await response.json();
    
    if (!data.success) {
      throw new Error(data.error || "Failed to fetch products");
    }

    return data.data.products;
  } catch (error) {
    console.error("Error fetching products:", error);
    throw error;
  }
}

// Fetch a single product by ID
export async function fetchProduct(id: string): Promise<ApiProduct> {
  try {
    const response = await fetch(`${API_BASE_URL}api/products/${id}/`);

    if (!response.ok) {
      throw new Error(`Failed to fetch product: ${response.statusText}`);
    }

    const data: ApiResponse<ApiProduct> = await response.json();
    
    if (!data.success) {
      throw new Error(data.error || "Failed to fetch product");
    }

    return data.data;
  } catch (error) {
    console.error("Error fetching product:", error);
    throw error;
  }
}

// Create a new product
export async function createProduct(product: {
  name: string;
  category: string;
  price: string;
  specs: string[];
  warranty?: string;
  images_data?: string[]; // Base64 encoded images
}): Promise<ApiProduct> {
  try {
    const formData = new FormData();
    formData.append("name", product.name);
    formData.append("category", product.category);
    formData.append("price", product.price);
    formData.append("specs", JSON.stringify(product.specs));
    if (product.warranty) {
      formData.append("warranty", product.warranty);
    }

    // If images_data is provided, use JSON format
    if (product.images_data && product.images_data.length > 0) {
      const jsonBody = {
        name: product.name,
        category: product.category,
        price: product.price,
        specs: product.specs,
        warranty: product.warranty || "3 Months",
        images_data: product.images_data,
      };

      const response = await fetch(`${API_BASE_URL}api/products/`, {
        method: "POST",
        headers: getAuthHeaders(),
        body: JSON.stringify(jsonBody),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || errorData.details || `Failed to create product: ${response.statusText}`);
      }

      const data: ApiResponse<ApiProduct> = await response.json();
      
      if (!data.success) {
        throw new Error(data.error || data.details || "Failed to create product");
      }

      return data.data;
    } else {
      throw new Error("At least one image is required");
    }
  } catch (error) {
    console.error("Error creating product:", error);
    throw error;
  }
}

// Update a product (full update)
export async function updateProduct(
  id: string,
  product: {
    name: string;
    category: string;
    price: string;
    specs: string[];
    warranty?: string;
    images_data?: string[]; // Base64 encoded images
  }
): Promise<ApiProduct> {
  try {
    if (product.images_data && product.images_data.length > 0) {
      const jsonBody = {
        name: product.name,
        category: product.category,
        price: product.price,
        specs: product.specs,
        warranty: product.warranty || "3 Months",
        images_data: product.images_data,
      };

      const response = await fetch(`${API_BASE_URL}api/products/${id}/`, {
        method: "PUT",
        headers: getAuthHeaders(),
        body: JSON.stringify(jsonBody),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || errorData.details || `Failed to update product: ${response.statusText}`);
      }

      const data: ApiResponse<ApiProduct> = await response.json();
      
      if (!data.success) {
        throw new Error(data.error || data.details || "Failed to update product");
      }

      return data.data;
    } else {
      throw new Error("At least one image is required");
    }
  } catch (error) {
    console.error("Error updating product:", error);
    throw error;
  }
}

// Delete a product
export async function deleteProduct(id: string): Promise<void> {
  try {
    const response = await fetch(`${API_BASE_URL}api/products/${id}/`, {
      method: "DELETE",
      headers: getAuthHeaders(),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || errorData.details || `Failed to delete product: ${response.statusText}`);
    }
  } catch (error) {
    console.error("Error deleting product:", error);
    throw error;
  }
}

// Fetch dashboard products (products created by the authenticated user)
export async function fetchDashboard(params?: {
  category?: string;
  search?: string;
  limit?: number;
  offset?: number;
  sort?: string;
}): Promise<ApiProduct[]> {
  try {
    const queryParams = new URLSearchParams();
    if (params?.category) queryParams.append("category", params.category);
    if (params?.search) queryParams.append("search", params.search);
    if (params?.limit) queryParams.append("limit", params.limit.toString());
    if (params?.offset) queryParams.append("offset", params.offset.toString());
    if (params?.sort) queryParams.append("sort", params.sort);

    const url = `${API_BASE_URL}api/dashboard/${queryParams.toString() ? `?${queryParams.toString()}` : ""}`;
    const response = await fetch(url, {
      headers: getAuthHeaders(false),
    });

    if (!response.ok) {
      if (response.status === 401) {
        throw new Error("Authentication required. Please login again.");
      }
      throw new Error(`Failed to fetch dashboard: ${response.statusText}`);
    }

    const data: ApiResponse<ProductsListResponse> = await response.json();
    
    if (!data.success) {
      throw new Error(data.error || "Failed to fetch dashboard");
    }

    return data.data.products;
  } catch (error) {
    console.error("Error fetching dashboard:", error);
    throw error;
  }
}

