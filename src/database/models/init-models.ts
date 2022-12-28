import { Sequelize } from "sequelize";
//
import { Account as _Account } from "./Account";
import { Profile as _Profile } from "./Profile";
import { Gym as _Gym } from "./Gym";
import { Housing as _Housing } from "./Housing";
import { RefreshToken as _RefreshToken } from "./RefreshToken";
import { ResetToken as _ResetToken } from "./ResetToken";
import { Batch as _Batch } from "./Batch";

import { City as _City } from "./City";
import { State as _State } from "./State";
// import { Provider as _Provider } from "./Provider";
import { Task as _Task } from "./Task";
// logging
import { Wish as _Wish } from "./Wish";

function initModels(sequelize: Sequelize) {
    const Account = _Account.initModel(sequelize);
    const RefreshToken = _RefreshToken.initModel(sequelize);
    const ResetToken = _ResetToken.initModel(sequelize);
    // account's non-account related stuff
    const Profile = _Profile.initModel(sequelize);
    const Wish = _Wish.initModel(sequelize);
    // city must be added before housing, gym, task, because they depend on it
    const State = _State.initModel(sequelize);
    const City = _City.initModel(sequelize);
    //
    const Housing = _Housing.initModel(sequelize);
    const Gym = _Gym.initModel(sequelize);
    // task related stuff
    const Task = _Task.initModel(sequelize);
    const Batch = _Batch.initModel(sequelize);
    //

    Account.hasMany(RefreshToken, {
        foreignKey: "acctId",
        as: "their_refresh_tokens",
    });
    RefreshToken.belongsTo(Account, { as: "belongs_to_user", foreignKey: "acctId" });

    Account.hasMany(ResetToken, {
        foreignKey: "acctId",
        as: "their_reset_tokens",
    });
    ResetToken.belongsTo(Account, { as: "belongs_to_user", foreignKey: "acctId" });

    // profile stuff
    Account.hasOne(Profile, { foreignKey: "acctId", as: "their_profile" });
    Profile.belongsTo(Account, { foreignKey: "acctId", as: "profile_of" });

    // https://sequelize.org/docs/v6/advanced-association-concepts/advanced-many-to-many/
    Profile.belongsToMany(Housing, { through: "Profile_Housings", as: "chosen_housings" });
    Housing.belongsToMany(Profile, { through: "Profile_Housings", as: "housings_chosen_by" });

    Profile.belongsToMany(Gym, { through: "Profile_Gyms", as: "chosen_gyms" });
    Gym.belongsToMany(Profile, { through: "Profile_Gyms", as: "gyms_chosen_by" });

    // Scraping tasks
    City.hasMany(Task, {
        foreignKey: "cityId",
        as: "scraping_tasks",
    });
    Task.belongsTo(City, {
        foreignKey: { name: "cityId", allowNull: false }, // tasks must have a cityId // https://github.com/sequelize/sequelize/issues/2837
        as: "scraped_for_city",
    });
    Task.hasMany(Housing, {
        foreignKey: "taskId",
        as: "scraped_aps",
    });
    Housing.belongsTo(Task, {
        foreignKey: { name: "taskId", allowNull: false }, // housings must have a task
        as: "from_task",
    });
    City.hasMany(Gym, {
        foreignKey: "cityId",
        as: "city_gyms",
    });
    Gym.belongsTo(City, {
        foreignKey: "cityId",
        as: "gym_in_city",
    });

    // Places
    State.hasMany(City, {
        foreignKey: "stateId",
        as: "state_cities",
    });
    City.belongsTo(State, {
        foreignKey: "stateId",
        as: "city_is_in",
    });
    State.hasMany(Housing, { foreignKey: "stateId" });
    Housing.hasOne(State, { foreignKey: "stateId" });

    City.hasMany(Housing, {
        foreignKey: "cityId",
        as: "scraped_apartments",
    });
    Housing.belongsTo(City, {
        foreignKey: { name: "cityId", allowNull: false }, // housings must have a city
        as: "belongs_to_city",
    });
    City.hasMany(Gym, {
        foreignKey: "cityId",
        as: "gyms_for_city",
    });
    Gym.belongsTo(City, {
        foreignKey: "cityId",
        as: "gym_is_in_city",
    });

    // Batch relationships
    Batch.hasMany(Task, {
        foreignKey: "batchId",
        as: "tasks_for_this_batch",
    });
    Task.hasOne(Batch, {
        foreignKey: "batchId",
        as: "task_from_batch",
    });
    Batch.hasMany(Housing, {
        foreignKey: "batchId",
        as: "housings_from_this_batch",
    });
    Housing.hasOne(Batch, {
        foreignKey: "batchId",
        as: "housing_from_batch",
    });

    return { Account, RefreshToken, ResetToken, Housing, Gym, City, Batch, Task, Wish };
}

export default initModels;
