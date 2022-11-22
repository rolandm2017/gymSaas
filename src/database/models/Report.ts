// import { Sequelize, Association, DataTypes, Model, Optional } from "sequelize";

// import sequelizeConnection from "../Database";

// interface ReportAttributes {
//     id: number;
//     delivered: boolean;
//     timesAccessed: number;
//     accessedAt?: Date;
//     createdAt?: Date;
//     updatedAt?: Date;
//     deletedAt?: Date;
// }
// // export interface ReportInput extends Required<ReportAttributes> {}
// // export interface ReportOutput extends Required<ReportAttributes> {}

// export type ReportOptionalAttributes = "createdAt" | "updatedAt" | "deletedAt";
// export type ReportCreationAttributes = Optional<ReportAttributes, ReportOptionalAttributes>;

// export class Report extends Model<ReportAttributes, ReportCreationAttributes> implements ReportAttributes {
//     public id!: number;
//     // TODO: add foreign key association
//     public delivered!: boolean;
//     public timesAccessed!: number;
//     public accessedAt?: Date;
//     // TODO: add "Number of credits given" and "number of credits used" fields

//     public readonly createdAt!: Date;
//     public readonly updatedAt!: Date;
//     public readonly deletedAt!: Date;

//     static initModel(sequelize: Sequelize): typeof Report {
//         return Report.init(
//             {
//                 id: {
//                     type: DataTypes.INTEGER,
//                     autoIncrement: true,
//                     primaryKey: true,
//                 },
//                 delivered: {
//                     type: DataTypes.BOOLEAN,
//                     allowNull: false,
//                 },
//                 timesAccessed: {
//                     type: DataTypes.INTEGER,
//                     allowNull: false,
//                 },
//                 accessedAt: {
//                     type: DataTypes.DATE,
//                     allowNull: true,
//                 },
//             },
//             {
//                 timestamps: true,
//                 sequelize: sequelize,
//             },
//         );
//     }
// }
