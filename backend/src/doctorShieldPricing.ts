export type DoctorShieldConvictionAnswer = 'yes' | 'no';

export interface DoctorShieldCharge {
  amount: number;
  amountLabel: string;
  planKey: 'basic' | 'comprehensive';
}

export const getDoctorShieldCharge = (hasBeenConvicted: DoctorShieldConvictionAnswer): DoctorShieldCharge => {
  const amount = hasBeenConvicted === 'yes' ? 11_500 : 2_300;
  return {
    amount,
    amountLabel: `${amount.toLocaleString('en-US')} SAR`,
    planKey: hasBeenConvicted === 'yes' ? 'comprehensive' : 'basic',
  };
};

export const formatSarAmount = (amount: number) => `${amount.toLocaleString('en-US')} SAR`;
