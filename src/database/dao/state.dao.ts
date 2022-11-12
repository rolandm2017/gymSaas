import { State, StateCreationAttributes } from "../models/State";

class StateDAO {
    // hopefully thsi isnt used much
    constructor() {
        //
    }

    public createState = async (state: StateCreationAttributes) => {
        return await State.create(state);
    };

    public getStateByName = async (name: string) => {
        return await State.findOne({ where: { name } });
    };
}

export default StateDAO;
