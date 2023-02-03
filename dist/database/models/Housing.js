"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Housing = void 0;
const sequelize_1 = require("sequelize");
class Housing extends sequelize_1.Model {
    static initModel(sequelize) {
        return Housing.init({
            housingId: {
                type: sequelize_1.DataTypes.INTEGER,
                autoIncrement: true,
                primaryKey: true,
            },
            buildingType: {
                type: sequelize_1.DataTypes.STRING,
                allowNull: false,
            },
            agreementType: {
                type: sequelize_1.DataTypes.STRING,
                allowNull: false,
            },
            price: {
                type: sequelize_1.DataTypes.INTEGER,
                allowNull: false,
            },
            address: {
                type: sequelize_1.DataTypes.STRING,
                allowNull: false,
            },
            url: {
                type: sequelize_1.DataTypes.STRING,
                allowNull: true, // because rentCanada won't have it when its entered into the db
            },
            lat: {
                type: sequelize_1.DataTypes.DOUBLE,
                allowNull: false,
            },
            long: {
                type: sequelize_1.DataTypes.DOUBLE,
                allowNull: false,
            },
            nearAGym: {
                type: sequelize_1.DataTypes.BOOLEAN,
                allowNull: true,
            },
            source: {
                type: sequelize_1.DataTypes.STRING,
                allowNull: false,
            },
            distanceToNearestGym: {
                type: sequelize_1.DataTypes.FLOAT,
                allowNull: true,
            },
            // idAtSource is used to fill out e.g.
            // GET https://www.rentcanada.com/api/listing/38422?includeSharedLocationListings=true
            // which returns a response (duh) with the detail
            //  "listing.url": "/montreal-qc/11666-boulevard-saint-germain/38422",
            // which you put with the domain to form https://www.rentcanada.com/montreal-qc/11666-boulevard-saint-germain/38422
            idAtSource: {
                type: sequelize_1.DataTypes.INTEGER,
                allowNull: true, // because it only exists on the rentCanada entries
            },
        }, {
            timestamps: true,
            sequelize: sequelize,
        });
    }
}
exports.Housing = Housing;
