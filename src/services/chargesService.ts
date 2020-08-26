import { FilterQuery } from "mongoose";
import { TCharge, TChargeModel } from "../models/Charge";
import { TChargeAttempt, TChargeAttemptModel } from "../models/ChargeAttempt";

export type TChargesService = {
  findCharges(filterQuery: FilterQuery<TCharge>): TFindChargesQuery;
  findCharge(filterQuery: FilterQuery<TCharge>): TFindChargeQuery;
  findPendingCharges(): TFindChargesQuery;
  createCharge(input: TCreateChargeInput): Promise<TCharge>;
  updateCharge(charge: TCharge, input: TUpdateChargeInput): Promise<TCharge>;

  findChargeAttempt(filterQuery: FilterQuery<TChargeAttempt>): TFindChargeAttemptQuery;
  createChargeAttempt(input: TCreateChargeAttemptInput): Promise<TChargeAttempt>;
  updateChargeAttempt(chargeAttempt: TChargeAttempt, input: TUpdateChargeAttemptInput): Promise<TChargeAttempt>;
};

export default (
  // @inject
  Charge: TChargeModel,
  ChargeAttempt: TChargeAttemptModel
): TChargesService => ({
  findCharges(filterQuery) {
    return Charge.find(filterQuery);
  },
  findCharge(filterQuery) {
    return Charge.findOne(filterQuery);
  },
  findPendingCharges() {
    return this.findCharges({ nextChargeAttemptAt: { $lte: new Date() } });
  },
  createCharge(input) {
    return Charge.create(input);
  },
  updateCharge(charge, input) {
    charge.set(input);
    return charge.save();
  },

  findChargeAttempt(filterQuery) {
    return ChargeAttempt.findOne(filterQuery);
  },
  createChargeAttempt(input) {
    return ChargeAttempt.create(input);
  },
  updateChargeAttempt(chargeAttempt, input) {
    chargeAttempt.set(input);
    return chargeAttempt.save();
  },
});

export type TFindChargesQuery = ReturnType<TChargeModel["find"]>;

export type TFindChargeQuery = ReturnType<TChargeModel["findOne"]>;

export type TCreateChargeInput = Pick<TCharge, "subscription" | "customer" | "nextChargeAttemptAt" | "status">;

export type TUpdateChargeInput = Pick<TCharge, "nextChargeAttemptAt" | "status">;

export type TCreateChargeAttemptInput = Pick<TChargeAttempt, "subscription" | "customer" | "status" | "charge">;

export type TFindChargeAttemptQuery = ReturnType<TChargeAttemptModel["findOne"]>;

export type TUpdateChargeAttemptInput = Pick<TChargeAttempt, "status">;
