// This is the single commission rule used for Stripe seller transfers and
// seller-facing invoice summaries. Amounts are rounded to cents exactly once.
const COMMISSION_PERCENTAGE = 10;

const calculateSellerBreakdown = (grossAmount) => {
  const gross = Number(grossAmount || 0);
  const commissionAmount = Number(
    (gross * (COMMISSION_PERCENTAGE / 100)).toFixed(2)
  );
  const sellerAmount = Number((gross - commissionAmount).toFixed(2));

  return { grossAmount: gross, commissionAmount, sellerAmount };
};

module.exports = {
  COMMISSION_PERCENTAGE,
  calculateSellerBreakdown,
};
