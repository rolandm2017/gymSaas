import { TryCatchClassDecorator } from "../../src/util/tryCatchClassDecorator";
import { TryCatchMethodDecorator } from "../../src/util/tryCatchMethodDecorator";

describe("the try/catch decorators", () => {
    test("the class decorator works", () => {
        // arrange
        console.log = jest.fn();
        const errMsgOne = "Something went wrong!";
        const errMsgTwo = "Something else went wrong!";
        @TryCatchClassDecorator(Error, (err, context) => console.log(context, err))
        class SomeTestObject {
            throwStuff() {
                throw new Error(errMsgOne);
            }

            throwMoreStuff() {
                throw new Error(errMsgTwo);
            }
        }

        const objToTest = new SomeTestObject();
        objToTest.throwStuff();
        objToTest.throwMoreStuff();
        const expectedError = new Error(errMsgOne);
        const expectedError2 = new Error(errMsgTwo);
        expect(console.log).toBeCalledWith({}, expectedError);
        expect(console.log).toBeCalledWith({}, expectedError2);
    });
    test("the method decorator works", () => {
        // arrange
        console.log = jest.fn();
        const errMsgOne = "A problem occurred!";
        const errMsgTwo = "Another problem occurred!";

        class AnotherTestObject {
            @TryCatchMethodDecorator(Error, (err, context) => console.log(context, err))
            throwStuff() {
                throw new Error(errMsgOne);
            }

            @TryCatchMethodDecorator(Error, (err, context) => console.log(context, err))
            throwMoreStuff() {
                throw new Error(errMsgTwo);
            }
        }
        const objToTest = new AnotherTestObject();
        objToTest.throwStuff();
        objToTest.throwMoreStuff();
        const expectedError = new Error(errMsgOne);
        const expectedError2 = new Error(errMsgTwo);
        expect(console.log).toBeCalledWith({}, expectedError);
        expect(console.log).toBeCalledWith({}, expectedError2);
    });
});
