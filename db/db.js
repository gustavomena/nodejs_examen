const { Pool } = require("pg");

const config = {
  user: "gustavo",
  host: "localhost",
  password: "gm2816362",
  port: 5432,
  database: "bancosolar",
};

const pool = new Pool(config);

function dbError(error, message) {
  console.log("mensaje:" + message);
  console.log("database error:" + error.code);
}

const setUser = async (data) => {
  const req = {
    text: "INSERT INTO usuarios(nombre, balance) VALUES ($1, $2)",
    values: data,
  };
  try {
    const res = await pool.query(req);
    return res;
  } catch (error) {
    dbError(error, "insertando usuarios");
    return error;
  }
};
const getUsers = async () => {
  const req = {
    text: "SELECT * FROM usuarios ORDER BY id",
  };
  try {
    const res = await pool.query(req);
    return res;
  } catch (error) {
    dbError(error, "Obteniendo usuarios");
    return error;
  }
};

const updateUser = async (data, id) => {
  const req = {
    text: `UPDATE usuarios SET nombre = $1, balance = $2 WHERE id = ${id} RETURNING *`,
    values: data,
  };
  try {
    const res = await pool.query(req);
    return res;
  } catch (error) {
    dbError(error, "Actualizando usuarios");
    return error;
  }
};

const deleteUser = async (id) => {
  const req = {
    text: `DELETE FROM usuarios WHERE id = ${id}`, //ON DELETE CASCADE ACTIVADO PARA LA REFERENCIA A TRANSFERENCIAS (emisor/receptor)
  };
  try {
    const res = await pool.query(req);
    return res;
  } catch (error) {
      dbError(error,"Borrando usuarios");
    return error;
  }
};

const getTransfers = async () => {
    const query= "SELECT "
                +"t.fecha,"
                +"(SELECT u.nombre FROM usuarios as u  WHERE t.emisor = u.id) as emisor,"
                +"u.nombre as receptor,"
                +"t.monto FROM usuarios as u"
                +"INNER JOIN transferencias as t "
                +"ON t.receptor = u.id ORDER BY t.id;"
  const req = {
    rowMode: "array",
    text: query,
  };

  try {
    const res = await pool.query(req);
    return res;
  } catch (error) {
    dbError(error,"consultando transferencias");
    return error;
  }
};
const setTransfer = async (data) => {
    try {
      await pool.query("BEGIN");
      const discount = {
        text: `UPDATE usuarios SET balance = balance - ${data[2]} WHERE nombre = '${data[0]}' RETURNING*`,
      };
      const resDiscount = await pool.query(discount);
      
      const credit = {
        text: `UPDATE usuarios SET balance = balance + ${data[2]} WHERE nombre = '${data[1]}' RETURNING*`,
      };
      const resCredit = await pool.query(credit);
  
      const logTransfer = {
        text: "INSERT INTO transferencias(emisor, receptor, monto, fecha) VALUES($1, $2, $3, $4)",
        values: [
          resDiscount.rows[0].id,
          resCredit.rows[0].id,
          data[2],
          new Date(),
        ],
      };
      await pool.query(logTransfer);
      await pool.query("COMMIT");
      
      const data = [
        resDiscount.rows[0].nombre,
        acreditacion.rows[0].nombre,
        data[2],
        new Date(),
      ];
      return data;
    } catch (error) {
      await pool.query("ROLLBACK");
  dbError(error, "Procesando una transferencia");
      return error;
    }
  };
  

module.exports = {
  setUser,
  getUsers,
  updateUser,
  deleteUser,
  getTransfers,
  setTransfer
};
