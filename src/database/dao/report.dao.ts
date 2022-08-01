import { Report, ReportCreationAttributes } from "../models/Report";

export const getMultipleReports = (limit: number, offset?: number) => {
    return Report.findAndCountAll({ offset, limit });
};

export const getReportById = (id: number) => {
    return Report.findByPk(id);
};

export const createReport = (report: ReportCreationAttributes) => {
    return Report.create(report);
};

export const updateReport = (report: ReportCreationAttributes, id: number) => {
    return Report.update(report, { where: { id } });
};

export const deleteReport = (id: number) => {
    return Report.destroy({ where: { id } });
};
