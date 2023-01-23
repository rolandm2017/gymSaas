let questionOne = "";
let questionTwo = "";
let questionThree = "";

export function setQuestionOne(text: string): void {
    questionOne = text;
}

export function setQuestionTwo(text: string): void {
    questionTwo = text;
}

export function setQuestionThree(text: string): void {
    questionThree = text;
}

export function getQuestions(): string[] {
    return [questionOne, questionTwo, questionThree];
}
