import { addOnsFor, getAddOn, getProduct, TAKEOUT_FEES, type Product, type VariantId } from './menu';

export interface CartLine {
  productId: string;
  variantId: VariantId;
  addOnIds: string[];
  quantity: number;
}

export interface PricedLine extends CartLine {
  key: string;
  product: Product;
  variantLabel: string;
  addOns: { id: string; name: string; price: number }[];
  unitPrice: number;
  lineTotal: number;
}

export const MAX_QTY = 20;

export const lineKey = (l: Pick<CartLine, 'productId' | 'variantId' | 'addOnIds'>) =>
  `${l.productId}|${l.variantId}|${[...l.addOnIds].sort().join(',')}`;

/** Prices a line strictly from the menu. Returns null for anything invalid. */
export function priceLine(l: CartLine): PricedLine | null {
  const product = getProduct(l.productId);
  if (!product) return null;
  const variant = product.variants.find((v) => v.id === l.variantId);
  if (!variant) return null;
  const allowed = new Set(addOnsFor(product).map((a) => a.id));
  const uniq = Array.from(new Set(l.addOnIds));
  if (uniq.some((id) => !allowed.has(id))) return null;
  const qty = Math.trunc(l.quantity);
  if (!(qty >= 1 && qty <= MAX_QTY)) return null;
  const addOns = uniq.map((id) => getAddOn(id)!).map(({ id, name, price }) => ({ id, name, price }));
  const unitPrice = variant.price + addOns.reduce((s, a) => s + a.price, 0);
  return {
    productId: product.id,
    variantId: variant.id,
    addOnIds: uniq,
    quantity: qty,
    key: lineKey({ productId: product.id, variantId: variant.id, addOnIds: uniq }),
    product,
    variantLabel: variant.label,
    addOns,
    unitPrice,
    lineTotal: unitPrice * qty,
  };
}

export function takeoutFees(lines: PricedLine[], serviceType: 'dine_in' | 'take_away') {
  if (serviceType !== 'take_away') return [];
  return Object.values(TAKEOUT_FEES)
    .filter((f) => lines.some((l) => f.categories.includes(l.product.category)))
    .map((f) => ({ label: f.label, price: f.price }));
}

export function summarize(lines: CartLine[], serviceType: 'dine_in' | 'take_away' = 'dine_in') {
  const priced = lines.map(priceLine).filter((x): x is PricedLine => !!x);
  const subtotal = priced.reduce((s, l) => s + l.lineTotal, 0);
  const fees = takeoutFees(priced, serviceType);
  const feeTotal = fees.reduce((s, f) => s + f.price, 0);
  return {
    lines: priced,
    subtotal,
    fees,
    feeTotal,
    total: subtotal + feeTotal,
    count: priced.reduce((s, l) => s + l.quantity, 0),
    containsAlcohol: priced.some((l) => l.product.alcoholic),
  };
}
