import { QueryClient, QueryFunction } from "@tanstack/react-query";

async function throwIfResNotOk(res: Response) {
  if (!res.ok) {
    const text = (await res.text()) || res.statusText;
    throw new Error(`${res.status}: ${text}`);
  }
}

export async function apiRequest(
  method: string,
  url: string,
  data?: unknown | undefined,
): Promise<Response> {
  const startTime = performance.now();
  
  try {
    logApiRequest(method, url, data);
    
    const res = await fetch(url, {
      method,
      headers: {
        "Content-Type": "application/json",
        ...(data ? {} : {}),
      },
      body: data ? JSON.stringify(data) : undefined,
      credentials: "include",
    });

    const duration = Math.round(performance.now() - startTime);
    logApiResponse(url, res, duration);

    await throwIfResNotOk(res);
    return res;
  } catch (error) {
    const duration = Math.round(performance.now() - startTime);
    logApiError(url, error as Error, duration);
    throw error;
  }
}

type UnauthorizedBehavior = "returnNull" | "throw";
export const getQueryFn: <T>(options: {
  on401: UnauthorizedBehavior;
}) => QueryFunction<T> =
  ({ on401: unauthorizedBehavior }) =>
  async ({ queryKey }) => {
    const res = await fetch(queryKey.join("/") as string, {
      credentials: "include",
    });

    if (unauthorizedBehavior === "returnNull" && res.status === 401) {
      return null;
    }

    await throwIfResNotOk(res);
    return await res.json();
  };

// Debug info pour le développement
const isDevelopment = import.meta.env?.MODE === 'development';

// Logger pour les requêtes en développement
const logApiRequest = (method: string, url: string, data?: unknown) => {
  if (isDevelopment) {
    console.group(`🌐 API ${method} ${url}`);
    if (data) {
      console.log('📤 Request data:', data);
    }
    console.groupEnd();
  }
};

const logApiResponse = (url: string, response: Response, duration: number) => {
  if (isDevelopment) {
    const status = response.ok ? '✅' : '❌';
    console.log(`${status} ${response.status} ${url} (${duration}ms)`);
  }
};

const logApiError = (url: string, error: Error, duration: number) => {
  if (isDevelopment) {
    console.error(`❌ API Error ${url} (${duration}ms):`, error);
  }
};

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      queryFn: getQueryFn({ on401: "throw" }),
      refetchInterval: false,
      refetchOnWindowFocus: true, // Permettre le refetch au focus
      staleTime: 5 * 60 * 1000, // 5 minutes au lieu de Infinity
      gcTime: 10 * 60 * 1000, // 10 minutes de cache (nouveau nom pour cacheTime)
      retry: (failureCount, error) => {
        // Ne retry que pour les erreurs réseau, pas les 4xx
        if (error instanceof Error && error.message.includes('4')) {
          return false;
        }
        return failureCount < 2; // Retry max 2 fois
      },
      retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000), // Exponential backoff
      networkMode: 'online', // Évite les requêtes en mode offline
    },
    mutations: {
      retry: false,
      onError: (error, variables, context) => {
        if (isDevelopment) {
          console.error('🚫 Mutation Error:', error, variables);
        }
      },
      networkMode: 'online', // Évite les mutations en mode offline
    },
  },
});
