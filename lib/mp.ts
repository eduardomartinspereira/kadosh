import { MercadoPagoConfig, Payment } from 'mercadopago';

export const mp = new MercadoPagoConfig({
  accessToken: process.env.MP_ACCESS_TOKEN!,
});

export const payments = new Payment(mp);
