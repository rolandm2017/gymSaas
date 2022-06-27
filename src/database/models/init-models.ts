import { Sequelize } from "sequelize";
import { Account as _Account } from "./Account";
import { Gym as _Gym } from "./Gym";
import { Housing as _Housing } from "./Housing";
import { Report as _Report } from "./Report";

function initModels(sequelize: Sequelize) {
    const Account = _Account.initModel(sequelize);
    const Report = _Report.initModel(sequelize);
    const Housing = _Housing.initModel(sequelize);
    const Gym = _Gym.initModel(sequelize);

    return { Account, Report, Housing, Gym };
}

export default initModels;
