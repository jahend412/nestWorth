const { User, Account } = require("./models");

async function testDatabase() {
  try {
    // Test creating a user
    const user = await User.create({
      firstName: "John",
      lastName: "Doe",
      email: "john@example.com",
      passwordHash: "hashed_password",
    });

    console.log("User created:", user.toJSON());

    // Test creating an account
    const account = await Account.create({
      name: "Checking Account",
      type: "checking",
      balance: 1000.0,
      userId: user.id,
    });

    console.log("Account created:", account.toJSON());

    // Test relations
    const userWithAccounts = await User.findByPk(user.id, {
      include: ["accounts"],
    });

    console.log(
      "User with accounts:",
      JSON.stringify(userWithAccounts, null, 2)
    );
  } catch (error) {
    console.error("Database test failed:", error);
  }
}

testDatabase();
