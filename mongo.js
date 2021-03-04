const mongoose = require("mongoose");

if (process.argv.length < 3) {
    console.log("give password as argument");
    process.exit(1);
}

const password = process.argv[2];

const url = `mongodb+srv://fullstackopen:${password}@cluster0.kpzor.mongodb.net/phonebook-app?retryWrites=true`;

mongoose.connect(url, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useFindAndModify: false,
    useCreateIndex: true,
});

const personSchema = new mongoose.Schema({
    name: String,
    number: String,
});

const Person = mongoose.model("Person", personSchema);

if (process.argv.length === 3) {
    Person.find({}).then((result) => {
        console.log("phonebook:");
        result.forEach((p) => {
            console.log(p.name, p.number);
        });
        mongoose.connection.close();
    });
}

if (process.argv.length > 3) {
    const name = process.argv[3];
    const number = process.argv[4];

    const person = new Person({
        name: name,
        number: number,
    });

    person.save().then(() => {
        console.log(`added ${name} number ${number} to phonebook`);
        mongoose.connection.close();
    });
}
