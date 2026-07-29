import { useEffect, useState, useCallback, useRef } from "react";
import {
  ShoppingBag,
  Plus,
  Edit3,
  Trash2,
  Coins,
  Upload,
  Loader2,
  X,
  RefreshCw,
  Gift,
} from "lucide-react";
import {
  ShopService,
  type ShopItem,
  getItemMetadata,
  parseDescriptionMeta,
  META_SEPARATOR,
} from "../../services/ShopService";
import { useToast } from "../../hooks/useToast";
import { ToastContainer } from "../ui/toast";
import { cn } from "../../lib/utils";

const DEFAULT_ITEMS = [
  {
    name: "Site logo sticker pack",
    description:
      "Decorate your laptop or gear with this sticker pack containing diverse sizes of our official website logo.",
    price: 50000,
  },
  {
    name: "Site enamel pin",
    description:
      "A high-quality metallic enamel pin styled with our signature crest to showcase your spectator status.",
    price: 100000,
  },
  {
    name: "Site keychain",
    description:
      "Heavy-duty custom metal keychain built to last, featuring engraved branding.",
    price: 120000,
  },
  {
    name: "Site water bottle",
    description:
      "Insulated stainless steel water bottle. Keeps your beverage ice cold for up to 24 hours.",
    price: 300000,
  },
  {
    name: "Site ceramic mug",
    description:
      "Premium ceramic mug styled with custom matte finish. Perfect for morning brews.",
    price: 250000,
  },
  {
    name: "Site t-shirt",
    description:
      "100% organic cotton graphic tee featuring our custom track design. Comfortable and stylish.",
    price: 500000,
  },
  {
    name: "Site cap",
    description:
      "Adjustable premium dad-hat featuring custom embroidery and vintage washes.",
    price: 400000,
  },
  {
    name: "Tournament badge/pin (per event)",
    description:
      "Limited collector's badge commemorating the grand finale of this championship series.",
    price: 100000,
  },
  {
    name: "Tournament poster (event artwork)",
    description:
      "Premium silk-screen printed wall poster capturing high-octane racing moments.",
    price: 150000,
  },
  {
    name: "Tournament water bottle (branded)",
    description:
      "Tournament branded double-wall vacuum flask with special tournament engravings.",
    price: 350000,
  },
  {
    name: "Tournament t-shirt (branded)",
    description:
      "Exclusive tournament apparel sporting the official lineup graphics of the competitors.",
    price: 600000,
  },
  {
    name: "Tournament winner's mini trophy replica",
    description:
      "1:10 scale detailed pewter replica model of the prestigious grand tournament cup.",
    price: 800000,
  },
];

type MetaOverride = {
  series: string;
  category: string;
  tier: string;
};

export default function ShopManagement() {
  const [items, setItems] = useState<ShopItem[]>([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [isSeeding, setIsSeeding] = useState(false);

  // Form Modal States
  const [isOpenModal, setIsOpenModal] = useState(false);
  const [editingItem, setEditingItem] = useState<ShopItem | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    price: "",
    description: "",
    isActive: true,
  });
  // Separate metadata overrides (stored encoded in description on submit)
  const [metaOverride, setMetaOverride] = useState<MetaOverride>({
    series: "auto",
    category: "auto",
    tier: "auto",
  });
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [filePreview, setFilePreview] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toasts, addToast } = useToast();

  const fetchItems = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await ShopService.listItems(page, 10);
      setItems(res.data);
      setTotalPages(res.pagination.totalPages);
    } catch (err: any) {
      addToast(
        err?.response?.data?.message || "Failed to load shop items",
        "error"
      );
    } finally {
      setIsLoading(false);
    }
  }, [page, addToast]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchItems();
  }, [fetchItems]);

  const handleOpenCreate = () => {
    setEditingItem(null);
    setFormData({ name: "", price: "", description: "", isActive: true });
    setMetaOverride({ series: "auto", category: "auto", tier: "auto" });
    setSelectedFile(null);
    setFilePreview(null);
    setIsOpenModal(true);
  };

  const handleOpenEdit = (item: ShopItem) => {
    setEditingItem(item);
    // Decode description to separate clean text and meta overrides
    const { cleanDescription, meta } = parseDescriptionMeta(
      item.description ?? ""
    );
    setFormData({
      name: item.name,
      price: item.price.toString(),
      description: cleanDescription,
      isActive: item.isActive !== false, // treat undefined (active-only endpoint) as true
    });
    setMetaOverride({
      series: meta.series ?? "auto",
      category: meta.category ?? "auto",
      tier: meta.tier ?? "auto",
    });
    setSelectedFile(null);
    setFilePreview(item.imageUrl || null);
    setIsOpenModal(true);
  };

  const MAX_IMAGE_BYTES = 5 * 1024 * 1024;
  const ALLOWED_IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp"];

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {
      addToast("Please select a JPG, PNG, or WebP image.", "error");
      if (fileInputRef.current) fileInputRef.current.value = "";
      return;
    }

    if (file.size > MAX_IMAGE_BYTES) {
      addToast("Image size must be 5MB or smaller.", "error");
      if (fileInputRef.current) fileInputRef.current.value = "";
      return;
    }

    setSelectedFile(file);
    const reader = new FileReader();
    reader.onloadend = () => {
      setFilePreview(reader.result as string);
    };
    reader.onerror = () => addToast("Failed to preview image.", "error");
    reader.readAsDataURL(file);
  };

  /** Build the description with optional meta suffix. */
  const buildDescription = (): string => {
    // Sanitize any user-entered META_SEPARATOR out of the base description
    const base = formData.description.split(META_SEPARATOR)[0].trim();
    const hasMeta =
      metaOverride.series !== "auto" ||
      metaOverride.category !== "auto" ||
      metaOverride.tier !== "auto";
    if (!hasMeta) return base;
    const metaObj: Record<string, string> = {};
    if (metaOverride.series !== "auto") metaObj.series = metaOverride.series;
    if (metaOverride.category !== "auto")
      metaObj.category = metaOverride.category;
    if (metaOverride.tier !== "auto") metaObj.tier = metaOverride.tier;
    return base + META_SEPARATOR + JSON.stringify(metaObj);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      addToast("Please enter a name.", "error");
      return;
    }
    const priceNum = parseInt(formData.price, 10);
    if (isNaN(priceNum) || priceNum < 0) {
      addToast("Please enter a valid price.", "error");
      return;
    }

    setIsSubmitting(true);
    try {
      const data = new FormData();
      data.append("name", formData.name.trim());
      data.append("price", priceNum.toString());
      data.append("description", buildDescription());

      if (selectedFile) {
        data.append("image", selectedFile);
      }

      if (editingItem) {
        // Only send isActive on update — createShopItemSchema doesn't accept it
        data.append("isActive", formData.isActive.toString());
        await ShopService.adminUpdateItem(editingItem.id, data);
        addToast("Shop item updated successfully", "success");
      } else {
        await ShopService.adminCreateItem(data);
        addToast("Shop item created successfully", "success");
      }

      setIsOpenModal(false);
      fetchItems();
    } catch (err: any) {
      addToast(err?.response?.data?.message || "Operation failed", "error");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (itemId: string) => {
    if (
      !confirm(
        "Are you sure you want to deactivate/soft-delete this item? It will no longer show up in the shop."
      )
    ) {
      return;
    }
    try {
      await ShopService.adminDeleteItem(itemId);
      addToast("Item deactivated successfully", "success");
      fetchItems();
    } catch (err: any) {
      addToast(
        err?.response?.data?.message || "Failed to deactivate item",
        "error"
      );
    }
  };

  const handleSeedDefaults = async () => {
    if (
      !confirm(
        "Seed all 12 default reward shop items? Duplicates will be skipped automatically."
      )
    ) {
      return;
    }
    setIsSeeding(true);

    const results = await Promise.allSettled(
      DEFAULT_ITEMS.map((item) => {
        const data = new FormData();
        data.append("name", item.name);
        data.append("description", item.description);
        data.append("price", item.price.toString());
        return ShopService.adminCreateItem(data);
      })
    );

    const successCount = results.filter((r) => r.status === "fulfilled").length;
    const errors = results.filter(
      (r): r is PromiseRejectedResult =>
        r.status === "rejected" && r.reason?.response?.status !== 409
    );

    setIsSeeding(false);
    if (successCount > 0) {
      addToast(`Seeded ${successCount} default items!`, "success");
    } else if (errors.length > 0) {
      addToast("Failed to seed items. Please check network/auth.", "error");
    } else {
      addToast("Default items already exist in the catalog.", "info");
    }
    fetchItems();
  };

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto min-h-full flex flex-col font-body">
      <ToastContainer toasts={toasts} />

      {/* Header Panel */}
      <div className="border-b border-[#064E3B]/10 pb-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-xl font-black font-headline text-[#064E3B] flex items-center gap-2">
            <ShoppingBag className="w-5 h-5" /> Shop Catalog Management
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Oversee active rewards, upload merchandise images, configure prices,
            or seed the official tournament merchandise list.
          </p>
        </div>

        <div className="flex gap-2 shrink-0">
          <button
            onClick={handleSeedDefaults}
            disabled={isSeeding}
            className="border border-[#064E3B]/20 text-[#064E3B] hover:bg-[#064E3B]/5 text-xs font-bold px-3 py-2 rounded-xl flex items-center gap-1.5 transition-all disabled:opacity-50"
          >
            {isSeeding ? (
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
            ) : (
              <RefreshCw className="w-3.5 h-3.5" />
            )}
            <span>Seed Defaults</span>
          </button>
          <button
            onClick={handleOpenCreate}
            className="bg-[#064E3B] text-white hover:bg-[#043E2F] text-xs font-bold px-3 py-2 rounded-xl flex items-center gap-1.5 transition-all shadow-sm"
          >
            <Plus className="w-4 h-4" />
            <span>Create Item</span>
          </button>
        </div>
      </div>

      {/* Items list table */}
      {isLoading ? (
        <div className="flex-1 flex flex-col items-center justify-center py-20">
          <Loader2 className="w-8 h-8 text-[#064E3B] animate-spin mb-2" />
          <p className="text-slate-500 text-xs">Loading catalog...</p>
        </div>
      ) : items.length === 0 ? (
        <div className="flex-1 flex flex-col items-center justify-center py-20 bg-white border border-dashed rounded-2xl">
          <ShoppingBag className="w-10 h-10 text-slate-300 mb-2" />
          <p className="text-slate-500 text-xs font-semibold">
            Catalog is empty
          </p>
          <p className="text-slate-400 text-[10px] mt-1">
            Create your first shop item or click "Seed Defaults" to populate.
          </p>
        </div>
      ) : (
        <div className="bg-white border rounded-2xl overflow-hidden shadow-sm flex-1 flex flex-col">
          <div className="overflow-x-auto flex-1">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b text-[10px] uppercase font-bold text-slate-400 tracking-wider">
                  <th className="px-6 py-4">Item Details</th>
                  <th className="px-6 py-4">Category &amp; Series</th>
                  <th className="px-6 py-4 text-right">Price</th>
                  <th className="px-6 py-4 text-center">Status</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y text-xs">
                {items.map((item) => {
                  // Single parse: cleanDescription for display, getItemMetadata handles overrides internally
                  const { cleanDescription } = parseDescriptionMeta(
                    item.description ?? ""
                  );
                  const meta = getItemMetadata(
                    item.name,
                    item.price,
                    item.description ?? ""
                  );
                  // Items from GET /shop/items are active-only; isActive may be undefined
                  const isActive = item.isActive !== false;

                  return (
                    <tr key={item.id} className="hover:bg-slate-50/50">
                      <td className="px-6 py-4 flex items-center gap-3">
                        <div className="w-12 h-12 rounded-lg bg-slate-100 border overflow-hidden flex items-center justify-center shrink-0">
                          {item.imageUrl ? (
                            <img
                              src={item.imageUrl}
                              alt={item.name}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <Gift className="w-6 h-6 text-[#064E3B]/20" />
                          )}
                        </div>
                        <div className="max-w-sm">
                          <div className="font-extrabold text-slate-800 line-clamp-1">
                            {item.name}
                          </div>
                          <div className="text-[10px] text-slate-400 line-clamp-1 mt-0.5">
                            {cleanDescription || "No description"}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex flex-wrap gap-1.5 items-center">
                          <span className="capitalize px-2 py-0.5 bg-slate-100 text-slate-600 rounded text-[10px] font-semibold">
                            {meta.category}
                          </span>
                          <span className="capitalize px-2 py-0.5 bg-indigo-50 text-indigo-600 rounded text-[10px] font-semibold">
                            {meta.series}
                          </span>
                          <span className="uppercase px-1.5 py-0.2 bg-rose-50 text-rose-600 rounded text-[9px] font-bold">
                            {meta.tier}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-right font-black font-label text-[#064E3B]">
                        <span className="flex items-center justify-end gap-1">
                          <Coins className="w-3.5 h-3.5 text-[#EAB308]" />{" "}
                          {item.price.toLocaleString()}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <span
                          className={cn(
                            "px-2.5 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider",
                            isActive
                              ? "bg-emerald-50 text-emerald-800"
                              : "bg-slate-100 text-slate-400"
                          )}
                        >
                          {isActive ? "Active" : "Inactive"}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex justify-end gap-2">
                          <button
                            onClick={() => handleOpenEdit(item)}
                            className="p-1.5 text-slate-500 hover:text-[#064E3B] hover:bg-slate-100 rounded-lg transition-all"
                            title="Edit Item"
                          >
                            <Edit3 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDelete(item.id)}
                            className="p-1.5 text-slate-500 hover:text-rose-600 hover:bg-slate-100 rounded-lg transition-all"
                            title="Deactivate Item"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex justify-center items-center gap-2 py-4 border-t">
              <button
                disabled={page === 1}
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                className="px-3 py-1 bg-white border rounded-lg text-xs font-bold disabled:opacity-50"
              >
                Previous
              </button>
              <span className="text-xs font-label text-slate-500">
                Page {page} of {totalPages}
              </span>
              <button
                disabled={page === totalPages}
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                className="px-3 py-1 bg-white border rounded-lg text-xs font-bold disabled:opacity-50"
              >
                Next
              </button>
            </div>
          )}
        </div>
      )}

      {/* Create / Edit Modal */}
      {isOpenModal && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="shop-modal-title"
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
        >
          <div className="bg-white rounded-3xl border shadow-2xl p-6 w-full max-w-lg max-h-[90vh] overflow-y-auto animate-in zoom-in-95 duration-200">
            <div className="flex justify-between items-start mb-4">
              <h3
                id="shop-modal-title"
                className="font-extrabold text-slate-800 text-base"
              >
                {editingItem ? "Edit Shop Item" : "Create New Shop Item"}
              </h3>
              <button
                aria-label="Close modal"
                onClick={() => setIsOpenModal(false)}
                className="p-1 hover:bg-slate-100 rounded-full"
              >
                <X className="w-4 h-4 text-slate-400" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Item Name */}
              <div>
                <label className="text-[10px] uppercase font-bold text-slate-400 block mb-1">
                  Item Name
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Site T-shirt"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData((p) => ({ ...p, name: e.target.value }))
                  }
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-xs outline-none focus:border-[#064E3B] transition-colors"
                />
              </div>

              {/* Price + Active */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-[10px] uppercase font-bold text-slate-400 block mb-1">
                    Price (Points)
                  </label>
                  <input
                    type="number"
                    required
                    min="0"
                    step="1"
                    placeholder="e.g. 100000"
                    value={formData.price}
                    onChange={(e) =>
                      setFormData((p) => ({ ...p, price: e.target.value }))
                    }
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-xs outline-none focus:border-[#064E3B] transition-colors"
                  />
                </div>

                {/* Only show Active toggle on edit — create always defaults to active */}
                {editingItem && (
                  <div className="flex items-center">
                    <label className="flex items-center gap-2 cursor-pointer mt-4">
                      <input
                        type="checkbox"
                        checked={formData.isActive}
                        onChange={(e) =>
                          setFormData((p) => ({
                            ...p,
                            isActive: e.target.checked,
                          }))
                        }
                        className="rounded border-slate-300 text-[#064E3B] focus:ring-[#064E3B]"
                      />
                      <span className="text-xs font-bold text-slate-600">
                        Active (Visible in Shop)
                      </span>
                    </label>
                  </div>
                )}
              </div>

              {/* Description */}
              <div>
                <label className="text-[10px] uppercase font-bold text-slate-400 block mb-1">
                  Description
                </label>
                <textarea
                  placeholder="Provide details about size, material, etc..."
                  value={formData.description}
                  onChange={(e) =>
                    setFormData((p) => ({ ...p, description: e.target.value }))
                  }
                  rows={3}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs outline-none focus:border-[#064E3B] transition-colors resize-none"
                />
              </div>

              {/* Metadata overrides – Series / Category / Tier */}
              <div className="border border-slate-200 rounded-xl p-3 space-y-3 bg-slate-50/50">
                <p className="text-[9px] uppercase font-bold text-slate-400 tracking-wider">
                  Metadata Overrides{" "}
                  <span className="normal-case font-normal text-slate-400">
                    (Auto = inferred from name &amp; price)
                  </span>
                </p>
                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <label className="text-[10px] font-bold text-slate-500 block mb-1">
                      Series
                    </label>
                    <select
                      value={metaOverride.series}
                      onChange={(e) =>
                        setMetaOverride((p) => ({
                          ...p,
                          series: e.target.value,
                        }))
                      }
                      className="w-full bg-white border border-slate-200 rounded-lg px-2 py-1.5 text-[10px] outline-none focus:border-[#064E3B] transition-colors"
                    >
                      <option value="auto">Auto</option>
                      <option value="general">General</option>
                      <option value="tournament">Tournament</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-slate-500 block mb-1">
                      Category
                    </label>
                    <select
                      value={metaOverride.category}
                      onChange={(e) =>
                        setMetaOverride((p) => ({
                          ...p,
                          category: e.target.value,
                        }))
                      }
                      className="w-full bg-white border border-slate-200 rounded-lg px-2 py-1.5 text-[10px] outline-none focus:border-[#064E3B] transition-colors"
                    >
                      <option value="auto">Auto</option>
                      <option value="decorative">Decorative</option>
                      <option value="drinkware">Drinkware</option>
                      <option value="apparel">Apparel</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-slate-500 block mb-1">
                      Tier
                    </label>
                    <select
                      value={metaOverride.tier}
                      onChange={(e) =>
                        setMetaOverride((p) => ({ ...p, tier: e.target.value }))
                      }
                      className="w-full bg-white border border-slate-200 rounded-lg px-2 py-1.5 text-[10px] outline-none focus:border-[#064E3B] transition-colors"
                    >
                      <option value="auto">Auto</option>
                      <option value="low">Low</option>
                      <option value="mid">Mid</option>
                      <option value="high">High</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Image Upload */}
              <div>
                <label className="text-[10px] uppercase font-bold text-slate-400 block mb-1">
                  Item Image
                </label>
                <div
                  onClick={() => fileInputRef.current?.click()}
                  className="border border-dashed rounded-xl p-4 flex flex-col items-center justify-center cursor-pointer hover:bg-slate-50 transition-colors relative h-36 overflow-hidden"
                >
                  {filePreview ? (
                    <>
                      <img
                        src={filePreview}
                        alt="Preview"
                        className="w-full h-full object-contain"
                      />
                      <div className="absolute inset-0 bg-black/40 opacity-0 hover:opacity-100 flex items-center justify-center text-white transition-opacity font-bold text-xs">
                        Change Image
                      </div>
                    </>
                  ) : (
                    <>
                      <Upload className="w-8 h-8 text-slate-300 mb-1" />
                      <span className="text-[10px] font-bold text-slate-400">
                        Click to upload jpg, png, or webp
                      </span>
                      <span className="text-[9px] text-slate-350">
                        Max size 5MB
                      </span>
                    </>
                  )}
                  <input
                    type="file"
                    ref={fileInputRef}
                    accept="image/jpeg,image/png,image/webp"
                    onChange={handleFileChange}
                    className="hidden"
                  />
                </div>
              </div>

              {/* Submit / Cancel */}
              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setIsOpenModal(false)}
                  className="flex-1 border py-2.5 rounded-xl font-bold text-xs text-slate-500 hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex-1 bg-[#064E3B] text-white py-2.5 rounded-xl font-bold text-xs hover:bg-[#043E2F] flex items-center justify-center gap-1.5 disabled:opacity-50"
                >
                  {isSubmitting && (
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  )}
                  <span>{editingItem ? "Save Changes" : "Create Item"}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
