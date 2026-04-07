export function calculateShipping(subtotal: number): number {
  if (subtotal >= 200) return 0;
  if (subtotal >= 100) return 15;
  return 12;
}

export function shippingLabel(subtotal: number): string {
  if (subtotal >= 200) return "Free";
  return `$${calculateShipping(subtotal).toFixed(2)}`;
}
