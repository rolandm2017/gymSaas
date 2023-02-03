"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getQuestions = exports.setQuestionThree = exports.setQuestionTwo = exports.setQuestionOne = void 0;
let questionOne = "";
let questionTwo = "";
let questionThree = "";
function setQuestionOne(text) {
    questionOne = text;
}
exports.setQuestionOne = setQuestionOne;
function setQuestionTwo(text) {
    questionTwo = text;
}
exports.setQuestionTwo = setQuestionTwo;
function setQuestionThree(text) {
    questionThree = text;
}
exports.setQuestionThree = setQuestionThree;
function getQuestions() {
    return [questionOne, questionTwo, questionThree];
}
exports.getQuestions = getQuestions;
