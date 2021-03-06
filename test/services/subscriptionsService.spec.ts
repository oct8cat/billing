import sinon from "sinon";
import Agenda from "agenda";
import Stripe from "stripe";
import dotenv from "dotenv";
import { EJob } from "../../src/types";

import { Subscription } from "../../src/models/Subscription";
import { Customer } from "../../src/models/Customer";
import { Charge, EChargeStatus } from "../../src/models/Charge";
import { ESubscriptionSpellPeriod, SubscriptionSpell } from "../../src/models/SubscriptionSpell";
import { ChargeAttempt, EChargeAttemptStatus } from "../../src/models/ChargeAttempt";
import { PaymentMethod, TStripePaymentMethodData } from "../../src/models/PaymentMethod";

import makeSubscriptionService from "../../src/services/subscriptionsService";
import makeChargeService from "../../src/services/chargesService";
import makeCustomerService from "../../src/services/customersService";
import makeJobsService from "../../src/services/jobsService";
import makePaymentMethodService from "../../src/services/paymentMethodsService";

dotenv.config();

const chargesService = makeChargeService(Charge, ChargeAttempt);
const customersService = makeCustomerService(Customer);
const stripe = new Stripe(process.env.STRIPE_API_KEY as string, { apiVersion: "2020-03-02" });
const paymentMethodsService = makePaymentMethodService(PaymentMethod);
const subscriptionsService = makeSubscriptionService(
  Subscription,
  SubscriptionSpell,
  chargesService,
  customersService,
  stripe,
  paymentMethodsService
);
const agenda = new Agenda();
const jobsService = makeJobsService(agenda, subscriptionsService, chargesService);

describe("services", () => {
  describe("subscriptionsService", () => {
    beforeEach(() => {
      sinon.restore();
    });

    describe("handlePendingSubscriptions", () => {
      it("Handles pending subscriptions", async () => {
        const subscriptions = [new Subscription(), new Subscription()];

        const findPendingSubscriptions = sinon
          .stub(subscriptionsService, "findPendingSubscriptions")
          .resolves(subscriptions);
        const handlePendingSubscription = sinon.stub(subscriptionsService, "handlePendingSubscription");

        await subscriptionsService.handlePendingSubscriptions();

        sinon.assert.calledOnce(findPendingSubscriptions);
        sinon.assert.callCount(handlePendingSubscription, subscriptions.length);
      });
    });

    describe("handlePendingSubscription", () => {
      it("Handles pending subscription", async () => {
        const customer = new Customer();
        const subscription = new Subscription();
        const pendingCharge = new Charge();
        const subscriptionSpell = new SubscriptionSpell({
          period: ESubscriptionSpellPeriod.MONTHLY,
        });

        sinon.stub(customersService, "findCustomer").resolves(customer);
        sinon.stub(subscriptionsService, "findSubscriptionSpell").resolves(subscriptionSpell);
        const createCharge = sinon.stub(chargesService, "createCharge").resolves(pendingCharge);
        const updateSubscription = sinon.stub(subscriptionsService, "updateSubscription");

        await subscriptionsService.handlePendingSubscription(subscription);

        sinon.assert.calledWith(createCharge, {
          subscription,
          customer,
          nextChargeAttemptAt: sinon.match.date,
          status: EChargeStatus.PENDING,
        });

        sinon.assert.calledWith(updateSubscription, subscription, {
          nextChargeAt: sinon.match.date,
          pendingCharge,
        });
      });
    });

    describe("handlePendingCharges", () => {
      it("Handles pending charges", async () => {
        const charges = [new Charge(), new Charge()];

        const findPendingCharges = sinon.stub(chargesService, "findPendingCharges").resolves(charges);
        const handlePendingCharge = sinon.stub(subscriptionsService, "handlePendingCharge");

        await subscriptionsService.handlePendingCharges(jobsService);

        sinon.assert.called(findPendingCharges);
        sinon.assert.callCount(handlePendingCharge, charges.length);
      });
    });

    describe("handlePendingCharge", () => {
      it("Handles pending charge", async () => {
        const subscription = new Subscription();
        const customer = new Customer();
        const charge = new Charge({ subscription, customer });
        const chargeAttempt = new ChargeAttempt();

        const createChargeAttempt = sinon.stub(chargesService, "createChargeAttempt").resolves(chargeAttempt);
        const scheduleJob = sinon.stub(jobsService, "scheduleJob");

        await subscriptionsService.handlePendingCharge(jobsService, charge);

        sinon.assert.calledWith(createChargeAttempt, {
          charge,
          status: EChargeAttemptStatus.PENDING,
          customer,
        });
        sinon.assert.calledWith(scheduleJob, EJob.PROCESS_PENDING_CHARGE_ATTEMPT, {
          chargeAttemptId: chargeAttempt.id,
        });
      });
    });

    describe("handlePendingChargeAttempt", () => {
      it("Handles pending charge attempt", async () => {
        const subscription = new Subscription();
        const subscriptionSpell = new SubscriptionSpell({ amount: 420, currency: "USD" });
        const customer = new Customer();
        const charge = new Charge({ subscription, customer });
        const chargeAttempt = new ChargeAttempt();
        const paymentMethodData: TStripePaymentMethodData = { paymentMethod: "paymentMethod", customer: "customer" };
        const paymentMethod = new PaymentMethod({ data: paymentMethodData });
        const stripePaymentIntent = { id: "stripePaymentIntent" } as Stripe.PaymentIntent;

        sinon.stub(chargesService, "findCharge").resolves(charge);
        sinon.stub(subscriptionsService, "findSubscription").resolves(subscription);
        sinon.stub(subscriptionsService, "findSubscriptionSpell").resolves(subscriptionSpell);
        sinon.stub(paymentMethodsService, "findPaymentMethod").resolves(paymentMethod);
        sinon.stub(stripe.paymentIntents, "create").resolves(stripePaymentIntent);
        const updateChargeAttempt = sinon.stub(chargesService, "updateChargeAttempt");
        const updateCharge = sinon.stub(chargesService, "updateCharge");
        const updateSubscription = sinon.stub(subscriptionsService, "updateSubscription");

        await subscriptionsService.handlePendingChargeAttempt(chargeAttempt);

        sinon.assert.calledWith(updateChargeAttempt, chargeAttempt, {
          status: EChargeAttemptStatus.SUCCESS,
        });
        sinon.assert.calledWith(updateCharge, charge, {
          status: EChargeStatus.SUCCESS,
          nextChargeAttemptAt: null,
          data: {
            customer: paymentMethodData.customer,
            paymentIntent: stripePaymentIntent.id,
          },
        });
        sinon.assert.calledWith(updateSubscription, subscription, {
          pendingCharge: null,
        });
      });
    });
  });
});
