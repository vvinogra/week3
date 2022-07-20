pragma circom 2.0.0;

// [assignment] implement a variation of mastermind from https://en.wikipedia.org/wiki/Mastermind_(board_game)#Variation as a circuit
include "../../node_modules/circomlib/circuits/comparators.circom";
include "../../node_modules/circomlib/circuits/bitify.circom";
include "../../node_modules/circomlib/circuits/poseidon.circom";

// Bagels
template MastermindVariation() {
    // Public inputs
    signal input pubGuess[3];

    // First element is number of "Pico"s. Seoncd is number of "Fermi"s.
    // If both numbers are zero, it's "Bagels".
    signal input pubClues[2];

    signal input pubSaltedSolutionHash;

    // Private inputs
    signal input privateSol[3];
    signal input privSalt;

    // Output
    signal output solnHashOut;

    var pubPicoCount = pubClues[0];
    var pubFermiCount = pubClues[1];

    var j = 0;
    var k = 0;
    component lessThan[6];
    component equalGuess[6];
    component equalSoln[3];
    var equalIdx = 0;

    // Create a constraint that the solution and guess digits are all less than 10.
    for (j=0; j < 3; j++) {
        lessThan[j] = LessThan(4);
        lessThan[j].in[0] <== pubGuess[j];
        lessThan[j].in[1] <== 10;
        lessThan[j].out === 1;
        lessThan[j+3] = LessThan(4);
        lessThan[j+3].in[0] <== privateSol[j];
        lessThan[j+3].in[1] <== 10;
        lessThan[j+3].out === 1;
        for (k=j+1; k < 3; k++) {
            // Create a constraint that the solution and guess digits are unique. no duplication.
            equalGuess[equalIdx] = IsEqual();
            equalGuess[equalIdx].in[0] <== pubGuess[j];
            equalGuess[equalIdx].in[1] <== pubGuess[k];
            equalGuess[equalIdx].out === 0;
            equalSoln[equalIdx] = IsEqual();
            equalSoln[equalIdx].in[0] <== privateSol[j];
            equalSoln[equalIdx].in[1] <== privateSol[k];
            equalSoln[equalIdx].out === 0;
            equalIdx += 1;
        }
    }

    // Count fermi and pico
    var fermiCount = 0;
    var picoCount = 0;

    component equalBagels[9];

    for (var i = 0; i < 3; i++) {
        for (var j = 0 ; j < 3; j++) {
            equalBagels[i*3 + j] = IsEqual();
            equalBagels[i*3 + j].in[0] <== privateSol[j];
            equalBagels[i*3 + j].in[1] <== pubGuess[i];

            picoCount += equalBagels[i*3 + j].out;
            if (j == i) {
                picoCount -= equalBagels[i*3 + j].out;
                fermiCount += equalBagels[i*3 + j].out;
            }
        }
    }

    // Create a constraint around the number of pico
    component equalPico = IsEqual();
    equalPico.in[0] <== pubPicoCount;
    equalPico.in[1] <== picoCount;

    equalPico.out === 1;

    // Create a constraint around the number of fermi
    component equalFermi = IsEqual();
    equalFermi.in[0] <== pubFermiCount;
    equalFermi.in[1] <== fermiCount;

    equalFermi.out === 1;

    // Verify that the hash of the private solution matches public solution hash
    component poseidon = Poseidon(4);
    poseidon.inputs[0] <== privSalt;
    poseidon.inputs[1] <== privateSol[0];
    poseidon.inputs[2] <== privateSol[1];
    poseidon.inputs[3] <== privateSol[2];

    solnHashOut <== poseidon.out;
    pubSaltedSolutionHash === solnHashOut;
}

component main {public [pubGuess, pubClues, pubSaltedSolutionHash]} = MastermindVariation();