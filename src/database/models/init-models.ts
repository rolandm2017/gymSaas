import { Sequelize } from "sequelize";
import { Account as _Account } from "./Account";
import { Gym as _Gym } from "./Gym";
import { Housing as _Housing } from "./Housing";
import { Report as _Report } from "./Report";
import { RefreshToken as _RefreshToken } from "./RefreshToken";
import { ResetToken as _ResetToken } from "./ResetToken";

function initModels(sequelize: Sequelize) {
    const Account = _Account.initModel(sequelize);
    const RefreshToken = _RefreshToken.initModel(sequelize);
    const ResetToken = _ResetToken.initModel(sequelize);
    const Report = _Report.initModel(sequelize);
    const Housing = _Housing.initModel(sequelize);
    const Gym = _Gym.initModel(sequelize);

    Account.hasMany(RefreshToken, {
        as: "owner",
        foreignKey: "owner_id",
    });
    RefreshToken.belongsTo(Account, { as: "refresh_token", foreignKey: "refresh_token" });

    Account.hasMany(ResetToken, {
        as: "owner",
        foreignKey: "owner_id",
    });
    ResetToken.belongsTo(Account, { as: "refresh_token", foreignKey: "refresh_token" });

    Account.hasMany(Report);
    Report.hasOne(Account);

    // todo: make city model. city has many gyms, has many apartments

    return { Account, RefreshToken, ResetToken, Report, Housing, Gym };
}

export default initModels;
