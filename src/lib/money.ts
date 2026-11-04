const eur = new Intl.NumberFormat("es-ES", { style: "currency", currency: "EUR", maximumFractionDigits: 2 });
export const formatEUR = (n: number) => eur.format(Number(n));
