import { TryCatchClassDecorator } from "../../util/tryCatchClassDecorator";
import { State, StateCreationAttributes } from "../models/State";

@TryCatchClassDecorator(Error, (err, context)  {
    console.log(context, err);
    throw err;
})
class StateDAO {
    // hopefully this isnt used much
    constructor() {
        //
    }

    public async createState (state: StateCreationAttributes)  {
        return await State.create(state);
    };

    public async getStateByName (name: string)  {
        return await State.findOne({ where: { name } });
    };
}

export default StateDAO;
