import { TryCatchClassDecorator } from "../../util/tryCatchClassDecorator";
import { State, StateCreationAttributes } from "../models/State";

@TryCatchClassDecorator(Error, (err, context) => {
    console.log(context, err);
    throw err;
})
class StateDAO {
    // hopefully this isnt used much
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
