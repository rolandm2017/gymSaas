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

    public async banUser(acctId: number): Promise<boolean> {
        const success = await this.accountDAO.banUser(acctId);
        if (success > 1) throw new Error("banned multiple users via one account id");
        if (success == 1) return true;
        return false;
    }
}

export default AdminService;
