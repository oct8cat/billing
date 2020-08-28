import makeCustomersService, { TCustomersService } from "../services/customersService";

import { Customer } from "../models/Customer";

export type TCtx = {
  customersService: TCustomersService;
};

export default (): TCtx => ({
  customersService: makeCustomersService(Customer),
});
