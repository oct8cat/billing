import assert from "assert";
import { FilterQuery } from "mongoose";
import { DateTime } from "luxon";
import { EJob } from "../types";
import { TSubscription, TSubscriptionModel } from "../models/Subscription";
import { TSubscriptionSpell, TSubscriptionSpellModel } from "../models/SubscriptionSpell";
import { EChargeStatus, TCharge } from "../models/Charge";
import { EChargeAttemptStatus, TChargeAttempt } from "../models/ChargeAttempt";
import { TChargesService } from "./chargesService";
import { TJobsService } from "./jobsService";
import { TCustomersService } from "./customersService";

export type TSubscriptionsService = {
  findPendingSubscriptions(): TFindSubscriptionsQuery;
  findSubscription(filterQuery: FilterQuery<TSubscription>): TFindSubscriptionQuery;
  updateSubscription(subscription: TSubscription, input: TUpdateSubscriptionInput): Promise<TSubscription>;

  findSubscriptionSpell(filterQuery: FilterQuery<TSubscriptionSpell>): TFindSubscriptionSpellQuery;

  handlePendingSubscriptions(): Promise<void>;
  handlePendingSubscription(subscription: TSubscription): Promise<TSubscription>;
  handlePendingCharges(jobsService: TJobsService): Promise<void>;
  handlePendingCharge(jobsService: TJobsService, charge: TCharge): Promise<void>;
  handlePendingChargeAttempt(chargeAttempt: TChargeAttempt): Promise<void>;

  getNextChargeAt(subscriptionSpell: TSubscriptionSpell, fromDate?: Date): Date;
};

export default (
  // @inject
  Subscription: TSubscriptionModel,
  SubscriptionSpell: TSubscriptionSpellModel,
  chargesService: TChargesService,
  customersService: TCustomersService
): TSubscriptionsService => ({
  findPendingSubscriptions() {
    return Subscription.find({ nextChargeAt: { $lte: new Date() } });
  },
  findSubscription(filterQuery) {
    return Subscription.findOne(filterQuery);
  },
  updateSubscription(subscription, input) {
    subscription.set(input);
    return subscription.save();
  },

  findSubscriptionSpell(filterQuery) {
    return SubscriptionSpell.findOne(filterQuery);
  },

  async handlePendingSubscriptions() {
    const subscriptions = await this.findPendingSubscriptions(); // TODO cursor
    await Promise.all(subscriptions.map(this.handlePendingSubscription.bind(this)));
  },
  async handlePendingSubscription(subscription) {
    const customer = await customersService.findCustomer({
      _id: subscription.customer,
    });
    assert.ok(customer, "Customer not found");

    const subscriptionSpell = await this.findSubscriptionSpell({
      _id: subscription.subscriptionSpell,
    });
    assert.ok(subscriptionSpell, "SubscriptionSpell not found");

    const pendingCharge = await chargesService.createCharge({
      subscription,
      customer,
      nextChargeAttemptAt: new Date(),
      status: EChargeStatus.PENDING,
    });
    const nextChargeAt = this.getNextChargeAt(subscriptionSpell);

    return this.updateSubscription(subscription, {
      pendingCharge,
      nextChargeAt,
    });
  },
  async handlePendingCharges(jobsService) {
    const charges = await chargesService.findPendingCharges();
    await Promise.all(charges.map(this.handlePendingCharge.bind(this, jobsService)));
  },
  async handlePendingCharge(jobsService, charge: TCharge) {
    const chargeAttempt = await chargesService.createChargeAttempt({
      charge,
      status: EChargeAttemptStatus.PENDING,
      subscription: charge.subscription,
      customer: charge.customer,
    });
    const chargeAttemptId = chargeAttempt.id;
    await jobsService.scheduleJob<{ chargeAttemptId: string }>(EJob.PROCESS_PENDING_CHARGE_ATTEMPT, {
      chargeAttemptId,
    });
  },
  async handlePendingChargeAttempt(chargeAttempt) {
    await chargesService.updateChargeAttempt(chargeAttempt, {
      status: EChargeAttemptStatus.SUCCESS,
    });

    const charge = await chargesService.findCharge({
      _id: chargeAttempt.charge,
    });
    assert.ok(charge, "Charge not found");
    await chargesService.updateCharge(charge, {
      status: EChargeStatus.SUCCESS,
      nextChargeAttemptAt: null,
    });

    const subscription = await this.findSubscription({
      _id: chargeAttempt.subscription,
    });
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
});

export type TFindSubscriptionsQuery = ReturnType<TSubscriptionModel["find"]>;

export type TFindSubscriptionQuery = ReturnType<TSubscriptionModel["findOne"]>;

export type TUpdateSubscriptionInput = Partial<Pick<TSubscription, "nextChargeAt" | "pendingCharge">>;

export type TFindSubscriptionSpellQuery = ReturnType<TSubscriptionSpellModel["findOne"]>;
