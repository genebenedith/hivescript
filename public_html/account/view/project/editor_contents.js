var editorContents = `// Start coding here
function greet(name) {
    console.log("Hello, " + name + "!");
}

function addNumbers(a, b) {
    return a + b;
}

var fruits = ['apple', 'banana', 'orange'];

for (var i = 0; i < fruits.length; i++) {
    console.log("I like " + fruits[i] + "s.");
}

// Uncomment the line below to see the greeting
// greet('John');

// Uncomment the line below to see the result of adding two numbers
// var sum = addNumbers(5, 7);
// console.log("The sum is: " + sum);

// More lines to reach a total of 75 lines
function square(x) {
    return x * x;
}

function displaySquare(value) {
    console.log("The square of " + value + " is: " + square(value));
}

// Uncomment the line below to display the square of a number
// displaySquare(4);

// Creating an object
var person = {
    name: 'Alice',
    age: 30,
    profession: 'Engineer'
};

console.log(person.name + " is " + person.age + " years old and works as an " + person.profession + ".");
`;