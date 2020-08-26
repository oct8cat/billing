import Agenda from "agenda";
import assert from "assert";
import { EJob } from "../types";
import { TChargesService } from "./chargesService";
import { TSubscriptionsService } from "./subscriptionsService";

export type TJobsService = {
  agenda: Agenda;
  defineJobs(): void;
  scheduleJob<D>(jobName: EJob, jobData?: D): Promise<Agenda.Job<D>>;
  processPendingChargeAttempt(job: Agenda.Job<{ chargeAttemptId: string }>): Promise<void>;
};

export default (
  // @inject
  agenda: Agenda,
  subscriptionService: TSubscriptionsService,
  chargesService: TChargesService
): TJobsService => ({
  agenda,
  defineJobs() {
    agenda.define(EJob.PROCESS_PENDING_CHARGE_ATTEMPT, this.processPendingChargeAttempt.bind(this));
  },
  scheduleJob(jobName, jobData) {
    return agenda.now(jobName, jobData);
  },
  async processPendingChargeAttempt(job) {
    const chargeAttempt = await chargesService.findChargeAttempt({ _id: job.attrs.data.chargeAttemptId });
    assert.ok(chargeAttempt, "ChargeAttempt not found");
    return subscriptionService.handlePendingChargeAttempt(chargeAttempt);
  },
});
