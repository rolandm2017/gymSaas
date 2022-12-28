import ProfileDAO from "../database/dao/profile.dao";

class ProfileService {
    private profileDAO: ProfileDAO;
    constructor(profileDAO: ProfileDAO) {
        //
        this.profileDAO = profileDAO;
    }

    public async recordPickPublic(ipAddress: string, housingId: number) {
        return await this.profileDAO.recordPickPublic(ipAddress, housingId);
    }

    public async getAllPicks(acctId: number) {
        //
    }
}

export default ProfileService;
