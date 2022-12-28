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
        // act
        objToTest.throwStuff();
        objToTest.throwMoreStuff();
        // assert
        const expectedError = new Error(errMsgOne);
        const expectedErrorTwo = new Error(errMsgTwo);
        expect(console.log).toBeCalledWith({}, expectedError);
        expect(console.log).toBeCalledWith({}, expectedErrorTwo);
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
        // act
        objToTest.throwStuff();
        objToTest.throwMoreStuff();
        // assert
        const expectedError = new Error(errMsgOne);
        const expectedErrorTwo = new Error(errMsgTwo);
        expect(console.log).toBeCalledWith({}, expectedError);
        expect(console.log).toBeCalledWith({}, expectedErrorTwo);
    });
    test("you can throw in the class decorator handler func", () => {
        // arrange
        const errMsgOne = "Something went wrong!";
        const errMsgTwo = "Not intended error";

        @TryCatchClassDecorator(Error, (err, context) => {
            throw err;
        })
        class YeOleTestObject {
            throwSomeStuff() {
                throw new Error(errMsgOne);
            }

            yeOleThrower() {
                throw new Error(errMsgTwo);
            }
        }

        const objToTest = new YeOleTestObject();
        // act, assert
        const expectedError = new Error(errMsgOne);
        const expectedErrorTwo = new Error(errMsgTwo);

        // thrower();
        expect(objToTest.throwSomeStuff).toThrow(expectedError);
        expect(objToTest.yeOleThrower).toThrow(expectedErrorTwo);
    });
    test("you can throw in the method decorator handler func", () => {
        // arrange
        console.log = jest.fn();
        const errMsgTwo = "A problem occurred!";
        const errMsgThree = "This is unexpected.";

        class ThyTestObject {
            // @TryCatchMethodDecorator(Error, (err, context) => console.log(context, err))
            @TryCatchMethodDecorator(Error, (err, context) => {
                throw err;
            })
            throwOtherStuff() {
                throw new Error(errMsgTwo);
            }

            throwMoreStuff() {
                throw new Error(errMsgThree);
            }
        }

        const objToTestTwo = new ThyTestObject();
        // act, assert
        const expectedErrorTwo = new Error(errMsgTwo);
        const expectedErrorThree = new Error(errMsgThree);

        expect(objToTestTwo.throwOtherStuff).toThrow(expectedErrorTwo);
        expect(objToTestTwo.throwMoreStuff).toThrow(expectedErrorThree);
    });
});
