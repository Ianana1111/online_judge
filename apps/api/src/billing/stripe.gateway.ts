import { Injectable, NotFoundException } from "@nestjs/common";
import Stripe from "stripe";
import { stripeConfig, STRIPE_API_VERSION } from "./stripe.config";
@Injectable()
export class StripeGateway {
  private instance?: Stripe;
  config() { const config = stripeConfig(); if (!config) throw new NotFoundException("Stripe is not enabled"); return config; }
  client() {
    const config = this.config();
    return this.instance ??= new Stripe(config.key, { apiVersion: STRIPE_API_VERSION, maxNetworkRetries: 2, timeout: 10000, appInfo: { name: "judge.tw", version: "1.0.0", url: "https://judge.tw" } });
  }
}
