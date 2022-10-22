export const emails: string[] = ["a@gmail.com", "b@gmail.com", "c@gmail.com", "d@gmail.com", "e@gmail.com"];

export const passwords: string[] = ["hats888*I", "hats777&U", "hats666^Y", "hats555%T", "hats444$R"];

// all missing something
export const badPasswords: string[] = ["hatshats", "HATSHATS", "243509432", "hatsHATS234", "hats234@#$", "HATS234@#$"];

export const tooShortPassword: string = "short";

export const FAKE_ACCOUNT = {
    id: 9999,
    email: "foobarbazman@gmail.com",
    passwordHash: "9n3p9maefadf",
    isVerified: true,
    verificationToken: "asdfadf",
    verified: 1000,
    updated: 1000,
    role: "User",
    passwordReset: 999,
};
