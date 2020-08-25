import { FilterQuery } from "mongoose";
import { TCharge, TChargeModel } from "../models/Charge";
import { TChargeAttempt, TChargeAttemptModel } from "../models/ChargeAttempt";

export type TChargesService = {
  findCharges(filterQuery: FilterQuery<TCharge>): ReturnType<TChargeModel["find"]>;
  findCharge(filterQuery: FilterQuery<TCharge>): ReturnType<TChargeModel["findOne"]>;
  findPendingCharges(): ReturnType<TChargeModel["find"]>;
  createCharge(input: Pick<TCharge, TCreateChargeKeys>): Promise<TCharge>;
  updateCharge(charge: TCharge, input: Pick<TCharge, TUpdateChargeKeys>): Promise<TCharge>;
  //
  findChargeAttempt(filterQuery: FilterQuery<TChargeAttempt>): ReturnType<TChargeAttemptModel["findOne"]>;
  createChargeAttempt(input: Pick<TChargeAttempt, TCreateChargeAttemptKeys>): Promise<TChargeAttempt>;
  updateChargeAttempt(
    chargeAttempt: TChargeAttempt,
    input: Pick<TChargeAttempt, TUpdateChargeAttemptKeys>
  ): Promise<TChargeAttempt>;
};

//

export type TCreateChargeKeys = "subscription" | "customer" | "nextChargeAttemptAt" | "status";
export type TUpdateChargeKeys = "nextChargeAttemptAt" | "status";
export type TCreateChargeAttemptKeys = "subscription" | "customer" | "status" | "charge";
export type TUpdateChargeAttemptKeys = "status";

//

export default (Charge: TChargeModel, ChargeAttempt: TChargeAttemptModel): TChargesService => ({
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
  //
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
