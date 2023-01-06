import { start } from "repl";
import { Housing } from "../models/Housing";
import { Feedback, FeedbackCreationAttributes } from "../models/Feedback";
import { Op } from "sequelize";

class FeedbackDAO {
    constructor() {}
    //

    public async createFeedback(feedback: FeedbackCreationAttributes): Promise<Feedback> {
        return await Feedback.create(feedback);
    }

    public async readLatest(): Promise<Feedback | null> {
        return await Feedback.findOne({
            where: {},
            order: [["createdAt", "DESC"]],
        });
    }

    public async getAllFeedbackForProfile(profileId: number): Promise<Feedback[]> {
        return await Feedback.findAll({ where: { profileId } });
    }

    public async getRecentFeedbackForProfile(profileId: number): Promise<Feedback[]> {
        return await Feedback.findAll({
            where: {
                profileId,
                createdAt: {
                    [Op.lt]: new Date(Date.now() - 60 * 60 * 1000),
                },
            },
        });
    }

    public async getAllFeedback(): Promise<Feedback[]> {
        return await Feedback.findAll({});
    }

    public async continueFeedbackStream(feedback: FeedbackCreationAttributes, profileId: number): Promise<number> {
        const affected = await Feedback.update(feedback, { where: { profileId } });
        return affected[0];
    }
}

export default FeedbackDAO;
