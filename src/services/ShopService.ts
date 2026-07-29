import api from "../lib/api";

export const META_SEPARATOR = "||meta:";

/** Parse an encoded metadata suffix from a description string. */
export function parseDescriptionMeta(description: string): {
  cleanDescription: string;
  meta: { series?: string; category?: string; tier?: string };
} {
  const idx = description.indexOf(META_SEPARATOR);
  if (idx === -1) return { cleanDescription: description, meta: {} };
  const clean = description.slice(0, idx);
  try {
    const parsed = JSON.parse(description.slice(idx + META_SEPARATOR.length));
    const meta: { series?: string; category?: string; tier?: string } = {};
    if (
      parsed !== null &&
      typeof parsed === "object" &&
      !Array.isArray(parsed)
    ) {
      for (const key of ["series", "category", "tier"] as const) {
        const value = (parsed as Record<string, unknown>)[key];
        if (typeof value === "string") meta[key] = value;
      }
    }
    return { cleanDescription: clean, meta };
  } catch {
    return { cleanDescription: clean, meta: {} };
  }
}

export function getItemMetadata(name: string, price: number, description = "") {
  // Check for manual overrides encoded in the description
  const { meta } = parseDescriptionMeta(description);

  const lowercaseName = name.toLowerCase();

  // Determine Series (override wins)
  let series = meta.series ?? "general";
  if (!meta.series) {
    if (
      lowercaseName.includes("tournament") ||
      lowercaseName.includes("event") ||
      lowercaseName.includes("trophy")
    ) {
      series = "tournament";
    }
  }

  // Determine Category (override wins)
  let category = meta.category ?? "decorative";
  if (!meta.category) {
    if (
      lowercaseName.includes("bottle") ||
      lowercaseName.includes("mug") ||
      lowercaseName.includes("cup") ||
      lowercaseName.includes("drink")
    ) {
      category = "drinkware";
    } else if (
      lowercaseName.includes("t-shirt") ||
      lowercaseName.includes("cap") ||
      lowercaseName.includes("apparel") ||
      lowercaseName.includes("shirt") ||
      lowercaseName.includes("pack")
    ) {
      if (lowercaseName.includes("sticker")) {
        category = "decorative";
      } else {
        category = "apparel";
      }
    }
  }

  // Determine Tier (override wins)
  let tier = meta.tier ?? "low";
  if (!meta.tier) {
    if (price >= 500000) {
      tier = "high";
    } else if (price >= 250000) {
      tier = "mid";
    }
  }

  return { series, category, tier };
}

export interface ShopItem {
  id: string;
  name: string;
  description?: string;
  price: number;
  imageUrl?: string;
  isActive?: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface InventoryItem {
  id: string;
  itemId: string;
  name: string;
  description?: string;
  price: number;
  imageUrl?: string;
  purchasedAt: string;
}

export interface PaginationInfo {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: PaginationInfo;
}

export const ShopService = {
  // Spectator and Admin endpoints
  listItems: async (
    page: number = 1,
    limit: number = 10
  ): Promise<PaginatedResponse<ShopItem>> => {
    const response = await api.get<PaginatedResponse<ShopItem>>("/shop/items", {
      params: { page, limit },
    });
    return response.data;
  },

  getItem: async (itemId: string): Promise<ShopItem> => {
    const response = await api.get<ShopItem>(`/shop/items/${itemId}`);
    return response.data;
  },

  purchaseItem: async (
    itemId: string
  ): Promise<{
    item: Partial<ShopItem>;
    balance: number;
    purchasedAt: string;
  }> => {
    const response = await api.post(`/shop/purchase`, { itemId });
    return response.data;
  },

  getInventory: async (
    page: number = 1,
    limit: number = 10
  ): Promise<PaginatedResponse<InventoryItem>> => {
    const response = await api.get<PaginatedResponse<InventoryItem>>(
      "/shop/inventory",
      {
        params: { page, limit },
      }
    );
    return response.data;
  },

  // Admin endpoints
  adminCreateItem: async (formData: FormData): Promise<{ item: ShopItem }> => {
    const response = await api.post<{ item: ShopItem }>(
      "/admin/shop/items",
      formData
    );
    return response.data;
  },

  adminUpdateItem: async (
    itemId: string,
    formData: FormData
  ): Promise<{ item: ShopItem }> => {
    const response = await api.patch<{ item: ShopItem }>(
      `/admin/shop/items/${itemId}`,
      formData
    );
    return response.data;
  },

  adminDeleteItem: async (itemId: string): Promise<{ message: string }> => {
    const response = await api.delete<{ message: string }>(
      `/admin/shop/items/${itemId}`
    );
    return response.data;
  },
};
