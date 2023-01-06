import { start } from "repl";
import { Housing } from "../models/Housing";
import { Feedback, FeedbackCreationAttributes } from "../models/Feedback";

class FeedbackDAO {
    constructor() {}
    //

    public async createFeedback(feedback: FeedbackCreationAttributes): Promise<Feedback> {
        return await Feedback.create(feedback);
    }

    public async getAllFeedbackForAccount(profileId: number): Promise<Feedback[]> {
        return await Feedback.findAll({ where: { profileId } });
    }

    public async getAllFeedback(): Promise<Feedback[]> {
        return await Feedback.findAll({});
    }
}

export default FeedbackDAO;
