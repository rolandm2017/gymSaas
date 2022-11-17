//

import AccountDAO from "../database/dao/account.dao";
import { Account } from "../database/models/Account";

class AdminService {
    private accountDAO: AccountDAO;
    constructor(accountDAO: AccountDAO) {
        this.accountDAO = accountDAO;
    }

    public async makeAdmin(email: string): Promise<Account[]> {
        const numberOfAdmins = await this.accountDAO.countAdmins();
        if (numberOfAdmins === 0) {
            await this.accountDAO.createAdmin(email);
            const account = await this.accountDAO.getAccountByEmail(email);
            return account;
        } else {
            return [];
        }
    }
}

export default AdminService;
