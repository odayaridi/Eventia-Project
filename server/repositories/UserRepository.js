const pool = require("../config/database");

class UserRepository{
    constructor() {
        
    }

async createUser(newUser) {
  const [result] = await pool.query(
    `
    INSERT INTO Users 
    (first_name, last_name, email, username, password, phone_number, role_id) 
    VALUES (?, ?, ?, ?, ?, ?, ?)
    `,
    [
      newUser.firstName,
      newUser.lastName,
      newUser.email,
      newUser.username,
      newUser.password,
      newUser.phoneNumber,
      newUser.roleId,
    ]
  );

  return {
    id: result.insertId,
    firstName: newUser.firstName,
    lastName: newUser.lastName,
    email: newUser.email,
    username: newUser.username,
    phoneNumber: newUser.phoneNumber,
    roleId: newUser.roleId,
  };
}


      // Check if user exists by email or username
  async findUserByEmailOrUsername(email, username) {
    const [rows] = await pool.query(
      'SELECT * FROM Users WHERE email = ? OR username = ?',
      [email, username]
    );
    return rows[0];
  }


    async findUserByPhone(phone) {
    const [rows] = await pool.query(
      'SELECT * FROM Users WHERE phone_number=  ?',
      [phone]
    );
    return rows[0];
  }


  // Find user by username
    async findUserByUsername(username) {
        const [rows] = await pool.query(
        'SELECT u.*, r.name as roleName FROM Users u JOIN Roles r ON u.role_id = r.id WHERE u.username = ? AND u.is_deleted = 0',
        [username]
        );
        return rows[0];
    }

    async findUserById(userId){
        const [result] = await pool.query('SELECT user_id FROM users u WHERE user_id = ?',[userId]);
        return result[0];
    }


     async checkPhoneNumberExistsRepo(phoneNumber) {
     const[result] = await pool.query("Select phone_number from users where phone_number = ?",
        [phoneNumber]
     );
     return result[0];
 }


}

module.exports = UserRepository;