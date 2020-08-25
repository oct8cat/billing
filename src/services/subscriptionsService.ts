import assert from "assert";
import { FilterQuery } from "mongoose";
import { DateTime } from "luxon";
import { EJob } from "../types";

import { TSubscription, TSubscriptionModel } from "../models/Subscription";
import { TSubscriptionSpell, TSubscriptionSpellModel } from "../models/SubscriptionSpell";
import { TCharge } from "../models/Charge";
import { TChargeAttempt } from "../models/ChargeAttempt";

import { TChargesService } from "./chargesService";
import { TJobsService } from "./jobsService";
import { TCustomersService } from "./customersService";

export type TSubscriptionsService = {
  processPendingChargeAttempt(chargeAttempt: TChargeAttempt): Promise<void>;
  getNextChargeAt(subscriptionSpell: TSubscriptionSpell, fromDate?: Date): Date;
  handlePendingCharge(jobsService: TJobsService, charge: TCharge): Promise<void>;
  handlePendingCharges(jobsService: TJobsService): Promise<void>;
  handlePendingSubscription(subscription: TSubscription): Promise<TSubscription>;
  handlePendingSubscriptions(): Promise<void>;
  findSubscriptionSpell(filterQuery: FilterQuery<TSubscriptionSpell>): ReturnType<TSubscriptionSpellModel["findOne"]>;
  updateSubscription(
    subscription: TSubscription,
    input: Partial<Pick<TSubscription, TUpdateSubscriptionKeys>>
  ): Promise<TSubscription>;
  findPendingSubscriptions(): ReturnType<TSubscriptionModel["find"]>;
  findSubscription(filterQuery: FilterQuery<TSubscription>): ReturnType<TSubscriptionModel["findOne"]>;
};

//

export type TUpdateSubscriptionKeys = "nextChargeAt" | "pendingCharge";

//

export default (
  Subscription: TSubscriptionModel,
  SubscriptionSpell: TSubscriptionSpellModel,
  chargesService: TChargesService,
  customersService: TCustomersService
): TSubscriptionsService => ({
  async processPendingChargeAttempt(chargeAttempt) {
    await chargesService.updateChargeAttempt(chargeAttempt, { status: "success" });

    const charge = await chargesService.findCharge({ _id: chargeAttempt.charge });
    assert.ok(charge, "Charge not found");
    await chargesService.updateCharge(charge, { status: "success", nextChargeAttemptAt: null });

    const subscription = await this.findSubscription({ _id: chargeAttempt.subscription });
    assert.ok(subscription, "Subscription not found");
    await this.updateSubscription(subscription, { pendingCharge: null });
  },
  getNextChargeAt(subscriptionSpell, fromDate = new Date()) {
    const fromDateTime = DateTime.fromJSDate(fromDate);
    switch (subscriptionSpell.period) {
      case "monthly":
        return fromDateTime.plus({ month: 1 }).toJSDate();
      case "weekly":
        return fromDateTime.plus({ weeks: 1 }).toJSDate();
      default:
        throw new Error(`Invalid period: ${subscriptionSpell.period}`);
    }
  },
  async handlePendingCharge(jobsService, charge: TCharge) {
    const chargeAttempt = await chargesService.createChargeAttempt({
      charge,
      status: "pending",
      subscription: charge.subscription,
      customer: charge.customer,
    });
    const chargeAttemptId = chargeAttempt.id;
    await jobsService.scheduleJob<{ chargeAttemptId: string }>(EJob.PROCESS_PENDING_CHARGE_ATTEMPT, { chargeAttemptId });
  },
  async handlePendingCharges(jobsService) {
    const charges = await chargesService.findPendingCharges();
    await Promise.all(charges.map(this.handlePendingCharge.bind(this, jobsService)));
  },
  async handlePendingSubscription(subscription) {
    const customer = await customersService.findCustomer({ _id: subscription.customer });
    assert.ok(customer, "Customer not found");

    const subscriptionSpell = await this.findSubscriptionSpell({ _id: subscription.subscriptionSpell });
    assert.ok(subscriptionSpell, "SubscriptionSpell not found");

    const pendingCharge = await chargesService.createCharge({
      subscription,
      customer,
      nextChargeAttemptAt: new Date(),
      status: "pending",
    });
    const nextChargeAt = this.getNextChargeAt(subscriptionSpell);

    return this.updateSubscription(subscription, { pendingCharge, nextChargeAt });
  },
  async handlePendingSubscriptions() {
    const subscriptions = await this.findPendingSubscriptions(); // TODO cursor
    await Promise.all(subscriptions.map(this.handlePendingSubscription.bind(this)));
  },
  findSubscriptionSpell(filterQuery) {
    return SubscriptionSpell.findOne(filterQuery);
  },
  updateSubscription(subscription, input) {
    subscription.set(input);
    return subscription.save();
  },
  findPendingSubscriptions() {
    return Subscription.find();
  },
  findSubscription(filterQuery) {
    return Subscription.findOne(filterQuery);
  },
});
