//[assignment] write your own unit test to show that your Mastermind variation circuit is working as expected
const { expect, assert } = require("chai");
const { ethers } = require("hardhat");

const BigNumber = ethers.BigNumber
const { buildPoseidon } = require('circomlibjs')

const poseidonHash = async (items) => {
    let poseidon = await buildPoseidon()
    return BigNumber.from(poseidon.F.toObject(poseidon(items)))
}

const wasm_tester = require("circom_tester").wasm;

const F1Field = require("ffjavascript").F1Field;
const Scalar = require("ffjavascript").Scalar;
exports.p = Scalar.fromString("21888242871839275222246405745257275088548364400416034343698204186575808495617");
const Fr = new F1Field(exports.p);

describe("MasterMindVariation", function () {
    this.timeout(100000000);

    it("Circuit returns correct hash to the correct guess", async function () {
        const circuit = await wasm_tester("contracts/circuits/MastermindVariation.circom");

        const privateSalt = 1
        const pubSaltedSolutionHash = await poseidonHash([privateSalt, 1, 2, 3])

        const INPUT = {
            "pubGuess": [1, 2, 3],
            "pubSaltedSolutionHash": pubSaltedSolutionHash,
            "privateSol": [1, 2, 3],
            "pubClues": [0, 3],
            "privSalt": privateSalt
        }

        const witness = await circuit.calculateWitness(INPUT, true);

        assert(Fr.eq(Fr.e(witness[0]),Fr.e(1)));
        assert(Fr.eq(Fr.e(witness[1]),Fr.e(pubSaltedSolutionHash)));
    });

    it("Circuit returns correct hash to the correct fermi guess", async function () {
        const circuit = await wasm_tester("contracts/circuits/MastermindVariation.circom");

        const privateSalt = 1
        const pubSaltedSolutionHash = await poseidonHash([privateSalt, 1, 2, 3])

        const INPUT = {
            "pubGuess": [1, 4, 5],
            "pubSaltedSolutionHash": pubSaltedSolutionHash,
            "privateSol": [1, 2, 3],
            "pubClues": [0, 1],
            "privSalt": privateSalt
        }

        const witness = await circuit.calculateWitness(INPUT, true);

        assert(Fr.eq(Fr.e(witness[0]),Fr.e(1)));
        assert(Fr.eq(Fr.e(witness[1]),Fr.e(pubSaltedSolutionHash)));
    });

    it("Circuit returns correct hash to the correct pico guess", async function () {
        const circuit = await wasm_tester("contracts/circuits/MastermindVariation.circom");

        const privateSalt = 1
        const pubSaltedSolutionHash = await poseidonHash([privateSalt, 1, 2, 3])

        const INPUT = {
            "pubGuess": [2, 3, 4],
            "pubSaltedSolutionHash": pubSaltedSolutionHash,
            "privateSol": [1, 2, 3],
            "pubClues": [2, 0],
            "privSalt": privateSalt
        }

        const witness = await circuit.calculateWitness(INPUT, true);

        assert(Fr.eq(Fr.e(witness[0]),Fr.e(1)));
        assert(Fr.eq(Fr.e(witness[1]),Fr.e(pubSaltedSolutionHash)));
    });

    it("Circuit returns correct hash to the correct combined guess", async function () {
        const circuit = await wasm_tester("contracts/circuits/MastermindVariation.circom");

        const privateSalt = 1
        const pubSaltedSolutionHash = await poseidonHash([privateSalt, 1, 2, 3])

        const INPUT = {
            "pubGuess": [3, 2, 4],
            "pubSaltedSolutionHash": pubSaltedSolutionHash,
            "privateSol": [1, 2, 3],
            "pubClues": [1, 1],
            "privSalt": privateSalt
        }

        const witness = await circuit.calculateWitness(INPUT, true);

        assert(Fr.eq(Fr.e(witness[0]),Fr.e(1)));
        assert(Fr.eq(Fr.e(witness[1]),Fr.e(pubSaltedSolutionHash)));
    });

    it("Circuit returns correct hash to the incorrect guess", async function () {
        const circuit = await wasm_tester("contracts/circuits/MastermindVariation.circom");

        const privateSalt = 1
        const pubSaltedSolutionHash = await poseidonHash([privateSalt, 1, 2, 3])

        const INPUT = {
            "pubGuess": [8, 4, 0],
            "pubSaltedSolutionHash": pubSaltedSolutionHash,
            "privateSol": [1, 2, 3],
            "pubClues": [0, 0],
            "privSalt": privateSalt
        }

        const witness = await circuit.calculateWitness(INPUT, true);

        assert(Fr.eq(Fr.e(witness[0]),Fr.e(1)));
        assert(Fr.eq(Fr.e(witness[1]),Fr.e(pubSaltedSolutionHash)));
    });

    it("Circuit returns different hash for different salt", async function () {
        const circuit = await wasm_tester("contracts/circuits/MastermindVariation.circom");

        const privateSalt_first = 1172371723721
        const pubSaltedSolutionHash_first = await poseidonHash([privateSalt_first, 1, 4, 3])

        const INPUT_FIRST = {
            "pubGuess": [1, 2, 3],
            "pubSaltedSolutionHash": pubSaltedSolutionHash_first,
            "privateSol": [1, 4, 3],
            "pubClues": [0, 2],
            "privSalt": privateSalt_first
        }

        const witness_first = await circuit.calculateWitness(INPUT_FIRST, true);

        assert(Fr.eq(Fr.e(witness_first[0]),Fr.e(1)));
        assert(Fr.eq(Fr.e(witness_first[1]),Fr.e(pubSaltedSolutionHash_first)));

        const privateSalt_second = 129391239
        const pubSaltedSolutionHash_second = await poseidonHash([privateSalt_second, 1, 4, 3])

        const INPUT_SECOND = {
            "pubGuess": [1, 2, 3],
            "pubSaltedSolutionHash": pubSaltedSolutionHash_second,
            "privateSol": [1, 4, 3],
            "pubClues": [0, 2],
            "privSalt": privateSalt_second
        }

        const witness_second = await circuit.calculateWitness(INPUT_SECOND, true);

        assert(Fr.eq(Fr.e(witness_second[0]),Fr.e(1)));
        assert(Fr.eq(Fr.e(witness_second[1]), Fr.e(pubSaltedSolutionHash_second)));

        // Hashes are not equal
        expect(Fr.e(pubSaltedSolutionHash_first)).to.not.be.eq(Fr.e(pubSaltedSolutionHash_second))
    });

    it("Circuit returns error if wrong public clues", async function () {
        const circuit = await wasm_tester("contracts/circuits/MastermindVariation.circom");

        const privateSalt = 1
        const pubSaltedSolutionHash = await poseidonHash([privateSalt, 1, 2, 3])

        const INPUT = {
            "pubGuess": [1, 2, 3],
            "pubSaltedSolutionHash": pubSaltedSolutionHash,
            "privateSol": [1, 2, 3],
            "pubClues": [0, 1],
            "privSalt": privateSalt
        }

        expect(circuit.calculateWitness(INPUT, true)).to.be.revertedWith(Error);
    });

    it("Circuit returns error if guess is wrong but clues are fine", async function () {
        const circuit = await wasm_tester("contracts/circuits/MastermindVariation.circom");

        const privateSalt = 1
        const pubSaltedSolutionHash = await poseidonHash([privateSalt, 1, 2, 3])

        const INPUT = {
            "pubGuess": [0, 0, 0],
            "pubSaltedSolutionHash": pubSaltedSolutionHash,
            "privateSol": [1, 2, 3],
            "pubClues": [0, 3],
            "privSalt": privateSalt
        }

        expect(circuit.calculateWitness(INPUT, true)).to.be.revertedWith(Error);
    });

    it("Circuit returns error if used wrong salt", async function () {
        const circuit = await wasm_tester("contracts/circuits/MastermindVariation.circom");

        const privateSalt = 1
        const pubSaltedSolutionHash = await poseidonHash([privateSalt, 1, 2, 3])

        const INPUT = {
            "pubGuess": [1, 2, 3],
            "pubSaltedSolutionHash": pubSaltedSolutionHash,
            "privateSol": [1, 2, 3],
            "pubClues": [0, 3],
            "privSalt": 0
        }

        expect(circuit.calculateWitness(INPUT, true)).to.be.revertedWith(Error);
    });

    it("Circuit returns error if used duplicated digits in guess", async function () {
        const circuit = await wasm_tester("contracts/circuits/MastermindVariation.circom");

        const privateSalt_guess = 1
        const pubSaltedSolutionHash_guess = await poseidonHash(
            [privateSalt_guess, 1, 2, 3])

        const INPUT_GUESS = {
            "pubGuess": [1, 2, 2],
            "pubSaltedSolutionHash": pubSaltedSolutionHash_guess,
            "privateSol": [1, 2, 3],
            "pubClues": [0, 2],
            "privSalt": privateSalt_guess
        }

        expect(circuit.calculateWitness(INPUT_GUESS, true)).to.be.revertedWith(Error);
    });

    it("Circuit returns error if used duplicated digits in solution", async function () {
        const circuit = await wasm_tester("contracts/circuits/MastermindVariation.circom");

        const privateSalt_solution = 1
        const pubSaltedSolutionHash_solution = await poseidonHash(
            [privateSalt_solution, 1, 2, 3])

        const INPUT_SOLUTION = {
            "pubGuess": [1, 2, 3],
            "pubSaltedSolutionHash": pubSaltedSolutionHash_solution,
            "privateSol": [1, 1, 3],
            "pubClues": [0, 2],
            "privSalt": privateSalt_solution
        }

        expect(circuit.calculateWitness(INPUT_SOLUTION, true)).to.be.revertedWith(Error);
    });

    it("Circuit returns error if guess number out of range", async function () {
        const circuit = await wasm_tester("contracts/circuits/MastermindVariation.circom");

        const privateSalt = 1
        const pubSaltedSolutionHash = await poseidonHash([privateSalt, 1, 2, 3])

        const INPUT = {
            "pubGuess": [10, 2, 3],
            "pubSaltedSolutionHash": pubSaltedSolutionHash,
            "privateSol": [1, 2, 3],
            "pubClues": [0, 1],
            "privSalt": privateSalt
        }

        expect(circuit.calculateWitness(INPUT, true)).to.be.revertedWith(Error);
    });

    it("Circuit returns error if solution number out of range", async function () {
        const circuit = await wasm_tester("contracts/circuits/MastermindVariation.circom");

        const privateSalt = 1
        const pubSaltedSolutionHash = await poseidonHash([privateSalt, 1, 99, 3])

        const INPUT = {
            "pubGuess": [1, 2, 3],
            "pubSaltedSolutionHash": pubSaltedSolutionHash,
            "privateSol": [1, 99, 3],
            "pubClues": [0, 1],
            "privSalt": privateSalt
        }

        expect(circuit.calculateWitness(INPUT, true)).to.be.revertedWith(Error);
    });

    it("Circuit returns error if used wrong salted solution hash", async function () {
        const circuit = await wasm_tester("contracts/circuits/MastermindVariation.circom");

        const privateSalt = 1
        const pubSaltedSolutionHash = await poseidonHash([privateSalt, 9, 0, 4])

        const INPUT = {
            "pubGuess": [1, 2, 3],
            "pubSaltedSolutionHash": pubSaltedSolutionHash,
            "privateSol": [1, 2, 3],
            "pubClues": [0, 3],
            "privSalt": privateSalt
        }

        expect(circuit.calculateWitness(INPUT, true)).to.be.revertedWith(Error);
    });
});