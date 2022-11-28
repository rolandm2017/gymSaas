import { SEED_USERS, ADMIN_ACCT_PASSWORD } from "../../src/seed/seedUsers";

const email = SEED_USERS[0].email;
const password = ADMIN_ACCT_PASSWORD;

export const adminCredentials = {
    email,
    password,
};
