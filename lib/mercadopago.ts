import { MercadoPagoConfig, Payment } from 'mercadopago';

if (!process.env.MP_ACCESS_TOKEN) {
  throw new Error('MP_ACCESS_TOKEN não configurado');
}

const config = new MercadoPagoConfig({
  accessToken: process.env.MP_ACCESS_TOKEN!,
});

export const payments = new Payment(config);
export default config;
