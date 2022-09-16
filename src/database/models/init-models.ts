import { Sequelize } from "sequelize";
import { Account as _Account } from "./Account";
import { Gym as _Gym } from "./Gym";
import { Housing as _Housing } from "./Housing";
import { Report as _Report } from "./Report";

import { City as _City } from "./City";
import { Provider as _Provider } from "./Provider";
import { Task as _Task } from "./Task";

function initModels(sequelize: Sequelize) {
    const Account = _Account.initModel(sequelize);
    const Report = _Report.initModel(sequelize);
    const Housing = _Housing.initModel(sequelize);
    const Gym = _Gym.initModel(sequelize);

    const City = _City.initModel(sequelize);
    const Provider = _Provider.initModel(sequelize);
    const Task = _Task.initModel(sequelize);

    // Account
    Account.hasMany(Report);

    // Report
    Report.hasMany(Housing);
    Report.hasMany(Gym);

    // Housing
    Housing.belongsTo(Report);
    Housing.belongsTo(City);

    // Gym
    Gym.belongsTo(Report);
    Gym.belongsTo(City);

    // City
    City.hasMany(Housing);
    City.hasMany(Gym);

    //Provider
    Provider.hasMany(Task);

    //Task
    Task.belongsTo(Provider);

    return { Account, Report, Housing, Gym, City, Provider, Task };
}

export default initModels;
