import {
    Association,
    DataTypes,
    HasManyAddAssociationMixin,
    HasManyCountAssociationsMixin,
    HasManyCreateAssociationMixin,
    HasManyGetAssociationsMixin,
    HasManyHasAssociationMixin,
    HasManySetAssociationsMixin,
    HasManyAddAssociationsMixin,
    HasManyHasAssociationsMixin,
    HasManyRemoveAssociationMixin,
    HasManyRemoveAssociationsMixin,
    Model,
    ModelDefined,
    Optional,
    Sequelize,
    InferAttributes,
    InferCreationAttributes,
    CreationOptional,
    NonAttribute,
    ForeignKey,
} from "sequelize";

import sequelizeConnection from "../Database";

interface ReportAttributes {
    id: number;
    delivered: boolean;
    timesAccessed: number;
    accessedAt?: Date;
    createdAt?: Date;
    updatedAt?: Date;
    deletedAt?: Date;
}
export interface ReportInput extends Required<ReportAttributes> {}
export interface ReportOutput extends Required<ReportAttributes> {}

export class Report extends Model<ReportAttributes, ReportInput> implements ReportAttributes {
    public id!: number;
    // TODO: add foreign key association
    public delivered!: boolean;
    public timesAccessed!: number;
    public accessedAt?: Date;

    // timestamps!
    public readonly createdAt!: Date;
    public readonly updatedAt!: Date;
    public readonly deletedAt!: Date;

    static initModel(sequelize: Sequelize.Sequelize): typeof Report {
        return Report.init(
            {
                id: {
                    type: DataTypes.INTEGER.UNSIGNED,
                    autoIncrement: true,
                    primaryKey: true,
                },
                delivered: {
                    type: DataTypes.BOOLEAN,
                    allowNull: false,
                },
                timesAccessed: {
                    type: DataTypes.INTEGER,
                    allowNull: false,
                },
                accessedAt: {
                    type: DataTypes.DATE,
                    allowNull: true,
                },
            },
            {
                timestamps: true,
                sequelize: sequelizeConnection,
                paranoid: true,
            },
        );
    }
}
