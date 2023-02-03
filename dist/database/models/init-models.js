"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
//
const Account_1 = require("./Account");
const Profile_1 = require("./Profile");
const Gym_1 = require("./Gym");
const Housing_1 = require("./Housing");
const RefreshToken_1 = require("./RefreshToken");
const ResetToken_1 = require("./ResetToken");
const Batch_1 = require("./Batch");
const Feedback_1 = require("./Feedback");
const City_1 = require("./City");
const State_1 = require("./State");
// import { Provider as _Provider } from "./Provider";
const Task_1 = require("./Task");
// logging
const Wish_1 = require("./Wish");
function initModels(sequelize) {
    const Account = Account_1.Account.initModel(sequelize);
    const RefreshToken = RefreshToken_1.RefreshToken.initModel(sequelize);
    const ResetToken = ResetToken_1.ResetToken.initModel(sequelize);
    // account's non-account related stuff
    const Profile = Profile_1.Profile.initModel(sequelize);
    const Wish = Wish_1.Wish.initModel(sequelize);
    const Feedback = Feedback_1.Feedback.initModel(sequelize);
    // city must be added before housing, gym, task, because they depend on it
    const State = State_1.State.initModel(sequelize);
    const City = City_1.City.initModel(sequelize);
    //
    const Housing = Housing_1.Housing.initModel(sequelize);
    const Gym = Gym_1.Gym.initModel(sequelize);
    // task related stuff
    const Task = Task_1.Task.initModel(sequelize);
    const Batch = Batch_1.Batch.initModel(sequelize);
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
    Account.hasOne(Profile, { foreignKey: "acctId", as: "profile" });
    Profile.belongsTo(Account, { foreignKey: "acctId", as: "account" });
    // https://sequelize.org/docs/v6/advanced-association-concepts/advanced-many-to-many/
    Profile.belongsToMany(Housing, { through: "Profile_Housings", as: "favoriteApartments" }); // note the 'as' value WORKS!
    Housing.belongsToMany(Profile, { through: "Profile_Housings", as: "favoritedBy" });
    Profile.belongsToMany(Housing, { through: "Housing_Reveals", as: "reveals" });
    Housing.belongsToMany(Profile, { through: "Housing_Reveals", as: "seer" });
    Profile.belongsToMany(Gym, { through: "Profile_Gyms", as: "gyms" });
    Gym.belongsToMany(Profile, { through: "Profile_Gyms", as: "profile" });
    Profile.hasMany(Feedback, { foreignKey: "profileId", as: "their_feedback" });
    Feedback.belongsTo(Profile, { foreignKey: "profileId", as: "feedback_from" });
    // Scraping tasks
    City.hasMany(Task, {
        foreignKey: "cityId",
        as: "scraping_tasks",
    });
    Task.belongsTo(City, {
        foreignKey: { name: "cityId", allowNull: false },
        as: "scraped_for_city",
    });
    Task.hasMany(Housing, {
        foreignKey: "taskId",
        as: "scraped_aps",
        constraints: false, // optional relationship
    });
    Housing.belongsTo(Task, {
        foreignKey: { name: "taskId", allowNull: false },
        as: "from_task",
        constraints: false, // optional relationship
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
        foreignKey: { name: "cityId", allowNull: false },
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
        constraints: false, // optional relationship
    });
    Task.belongsTo(Batch, {
        foreignKey: "batchId",
        as: "task_from_batch",
        constraints: false, // optional relationship
    });
    Batch.hasMany(Housing, {
        foreignKey: "batchId",
        as: "housings_from_this_batch",
        constraints: false, // optional relationship
    });
    Housing.belongsTo(Batch, {
        foreignKey: "batchId",
        as: "housing_from_batch",
        constraints: false, // optional relationship
    });
    // Qualifications
    // Housing.belongsToMany(Gym, { through: "Housing_Gyms", as: "housings_gyms" });
    // Gym.belongsToMany(Housing, { through: "Gyms_Housings", as: "gyms_housings" });
    // wish
    Profile.hasMany(Wish, { foreignKey: "profileId" });
    Wish.belongsTo(Profile, { foreignKey: "profileId" });
    console.log("models are init");
    return { Account, RefreshToken, ResetToken, Housing, Gym, City, Batch, Task, Wish };
}
exports.default = initModels;
