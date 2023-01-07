import FeedbackDAO from "../../src/database/dao/feedback.dao";
import ProfileDAO from "../../src/database/dao/profile.dao";
import { app } from "../mocks/mockServer";

const feedbackDAO = new FeedbackDAO();

const profileDAO = new ProfileDAO();

beforeAll(async () => {
    await app.connectDB();
    await app.dropTable("feedback");
    await app.dropTable("profile");
});

afterAll(async () => {
    await app.closeDB();
});

describe("feedback DAO", () => {
    test("create feedback", async () => {
        // arrange
        const profile = await profileDAO.createProfileByIp("195.3.3.1");
        // act
        const feedback = await feedbackDAO.createFeedback({
            questionOne: "a?",
            questionTwo: "b?",
            questionOneAnswer: "c",
            questionTwoAnswer: "d",
            profileId: profile.profileId,
        });
        // assert
        expect(feedback.questionOne).toBe("a?");
        expect(feedback.questionOneAnswer).toBe("c");
        expect(feedback.profileId).toBe(profile.profileId);
    });
    test("read latest", async () => {
        // arrange
        const profile = await profileDAO.createProfileByIp("195.3.3.2");
        const feedback = await feedbackDAO.createFeedback({
            questionOne: "a?",
            questionTwo: "b?",
            questionOneAnswer: "c",
            questionTwoAnswer: "d",
            profileId: profile.profileId,
        });
        const feedbackTwo = await feedbackDAO.createFeedback({
            questionOne: "aa?",
            questionTwo: "bb?",
            questionOneAnswer: "cc",
            questionTwoAnswer: "dd",
        });
        const feedbackThree = await feedbackDAO.createFeedback({
            questionOne: "aaa?",
            questionTwo: "bbb?",
            questionOneAnswer: "ccc",
            questionTwoAnswer: "ddd",
        });
        // act
        const latest = await feedbackDAO.readLatest();
        // assert
        expect(latest).not.toBeNull();
        expect(latest!.feedbackId).toBeDefined();
        expect(latest!.feedbackId).toBe(feedbackThree.feedbackId);
        expect(latest!.questionOneAnswer).toBe(feedbackThree.questionOneAnswer);
    });
    test("get all feedback for profile", async () => {
        // arrange
        const profile = await profileDAO.createProfileByIp("15.33.32.14");
        const feedback = await feedbackDAO.createFeedback({
            questionOne: "a?",
            questionTwo: "b?",
            questionOneAnswer: "c",
            questionTwoAnswer: "d",
            profileId: profile.profileId,
        });
        const feedbackTwo = await feedbackDAO.createFeedback({
            questionOne: "aa?",
            questionTwo: "bb?",
            questionOneAnswer: "cc",
            questionTwoAnswer: "dd",
            profileId: profile.profileId,
        });
        const feedbackThree = await feedbackDAO.createFeedback({
            questionOne: "aaa?",
            questionTwo: "bbb?",
            questionOneAnswer: "ccc",
            questionTwoAnswer: "ddd",
            profileId: profile.profileId,
        });
        // act
        const all = await feedbackDAO.getAllFeedbackForProfile(profile.profileId);
        // assert
        expect(all.length).toBe(3);
        expect(all[0].profileId).toBe(profile.profileId);
        expect(all[1].profileId).toBe(profile.profileId);
        expect(all[2].profileId).toBe(profile.profileId);
    });
    test("get all feedback", async () => {
        // arrange
        const profile = await profileDAO.createProfileByIp("1.3.2.144");
        const feedback = await feedbackDAO.createFeedback({ questionOne: "a?", questionTwo: "b?", questionOneAnswer: "c", questionTwoAnswer: "d" });
        const feedbackTwo = await feedbackDAO.createFeedback({
            questionOne: "aa?",
            questionTwo: "bb?",
            questionOneAnswer: "cc",
            questionTwoAnswer: "dd",
        });
        const feedbackThree = await feedbackDAO.createFeedback({
            questionOne: "aaa?",
            questionTwo: "bbb?",
            questionOneAnswer: "ccc",
            questionTwoAnswer: "ddd",
        });
        const feedbackFour = await feedbackDAO.createFeedback({
            questionOne: "aaaa?",
            questionTwo: "bbbb?",
            questionOneAnswer: "cccc",
            questionTwoAnswer: "dddd",
        });
        // act
        const all = await feedbackDAO.getAllFeedback();
        // assert
        expect(all.length).toBeGreaterThanOrEqual(4);
    });
    test("continue feedback stream", async () => {
        // arrange
        const profile = await profileDAO.createProfileByIp("15.33.31.14");
        const feedback = await feedbackDAO.createFeedback({
            questionOne: "d?",
            questionTwo: "e?",
            questionOneAnswer: "f",
            questionTwoAnswer: "g",
            profileId: profile.profileId,
        });
        // act
        const updatedRows = await feedbackDAO.continueFeedbackStream({ ...feedback, largeTextAnswer: "hats" }, profile.profileId);
        // assert
        expect(updatedRows).toBe(1);
        const updatedFeedback = await feedbackDAO.getFeedbackByFeedbackId(feedback.feedbackId);
        expect(updatedFeedback).not.toBeNull();
        expect(updatedFeedback!.questionOne).toBe("d?");
        expect(updatedFeedback!.questionOneAnswer).toBe("f");
        expect(updatedFeedback?.largeTextAnswer).toBe("hats");
    });
});
