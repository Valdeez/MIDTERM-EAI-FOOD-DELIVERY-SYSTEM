const resolvers = {
  Query: {
    
    users: async (_, __, { pool }) => {
        const [rows] = await pool.query('SELECT * FROM users');
        return rows;
    },
    
    user: async (_, { id }, { pool }) => {
        console.log("🚀 Server menerima request mencari ID:", id); 
        const [rows] = await pool.query('SELECT * FROM users WHERE id = ?', [id]);
        return rows[0] || null;
    }
  }, 

  Mutation: {
  
    register: async (_, { name, password, role, restaurant_id }, { pool }) => {
        const assignRole = role || 'customer';
        const [result] = await pool.query(
            'INSERT INTO users (name, password, role, restaurant_id) VALUES (?, ?, ?, ?)', 
            [name, password, assignRole, restaurant_id || null]
        );
        return { message: `User berhasil didaftarkan sebagai ${assignRole}`, user_id: result.insertId };
    },
    
    login: async (_, { name, password }, { pool }) => {
        if (!name || !password) throw new Error("Nama dan kata sandi harus diisi!");
        const [rows] = await pool.query('SELECT * FROM users WHERE name = ? AND password = ?', [name, password]);
        if (rows.length > 0) return { message: "Login berhasil", data: rows[0] };
        throw new Error("Nama atau kata sandi salah!");
    }
  } 
};

module.exports = resolvers;