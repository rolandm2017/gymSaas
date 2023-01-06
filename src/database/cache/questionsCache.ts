let questionOne = "";
let questionTwo = "";

export function setQuestionOne(text: string): void {
    questionOne = text;
}

export function setQuestionTwo(text: string): void {
    questionTwo = text;
}

export function getQuestions(): string[] {
    return [questionOne, questionTwo];
}
