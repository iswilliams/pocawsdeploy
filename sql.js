const mysql = require('mysql');
let config = require('./config');
config = config.database

let connection = mysql.createConnection({
  host: config.host,
  user: config.user,
  password: config.password,
  database: config.database
}); 

const getIdTransporte = (transporte) => {
  return new Promise((resolve, reject) => {

    let response = {
      status : 0,
      message : '',
      data : ''
    }

    try {

      let sql = `select id_transporte 
      from Transporte 
      where numero_transporte = '${transporte.idTransporte}'`;

      connection.query(sql, (err, results) => {

        if (err) reject(err);
        if (results === undefined ) reject('Ocurrio un error al obtener el transporte')
        if (results.length == 0){

          response.status = 0
          response.message = `El transporte ${transporte.idTransporte} no existe`
          resolve(response)
        } 
        else
        {
          let idTransporte = results[0].id_transporte;
          response.status = 1
          response.data = idTransporte
          resolve(response)
        }
      });
    } catch (err){
        reject(err)
    }
  })
}

const getIdStatus = (transporte) => {
  return new Promise((resolve, reject) => {

    try {
      
      let response = {
        status : 0,
        message : '',
        data : ''
      }

      let sql = `select id_estado 
      from Estado 
      where LOWER(nombre_estado) = LOWER('${transporte.estadoTransporte}')`;

      connection.query(sql, (err, results) => {

        if (err) reject(err);
        if (results === undefined ) reject('Ocurrio un error al obtener el estado')
        else if (results.length == 0)
        {
          response.status = 0
          response.message = `El estado ${transporte.estadoTransporte} no existe`
          resolve(response)
        } 
        else 
        { 
          let idEstado = results[0].id_estado;
          response.status = 1
          response.data = idEstado
          resolve(response)
        }
      });
    } catch (err){
        reject(err)
    }
  })
}

const updateStatusTransporte = (transporte, idTransporte) => {
  return new Promise((resolve, reject) => {

    try {

      sql = `update db.Transporte 
      set estado_transporte= '${transporte.estadoTransporte}',
      modificacion_transporte = 1
      where id_transporte = '${idTransporte}'`;

      connection.query(sql, (err, results) => {
        if (err) reject(err);
        if (results.affectedRows != 1) reject('Ocurrio un error al modificar el transporte');
        resolve()
      });

    } catch (err){
    reject(err)
    }
  })
}

const insertUpdate = (idTransporte, idStatus) => {
  return new Promise((resolve, reject) => {

    try {

      let today = new Date();
      let dateTime = today.getFullYear()+'-'+(today.getMonth()+1)+'-'+today.getDate()+' '+today.getHours()+':'+today.getMinutes()+':'+today.getSeconds();

      //Consultar por el ultimo estado insertado
      sql = `select fk_estado estado_transporte from Modificacion_Transporte
      where fk_transporte = ${idTransporte}
      order by fecha_modificacion_transporte desc
      limit 1`

      connection.query(sql, (err, results) => {
        if (err) reject(err);
        if (results.length > 0)
        {
          //Validar si el estado ya esta insertado
          if(results[0].estado_transporte == idStatus ) resolve()
          else 
          {
            //Insertar modificación 
            sql = `INSERT INTO db.Modificacion_Transporte
            (fecha_modificacion_transporte,
            detalle_modificacion_transporte,
            origen_modificacion_transporte,
            tipo_modificacion_transporte,
            fk_transporte,
            fk_estado)
            VALUES
            ('${dateTime}',
            'Anulación de transporte',
            'Sap',
            'Anulacion',
            '${idTransporte}',
            '${idStatus}')`;
      
            connection.query(sql, (err, results) => {
              if (err) reject(err);
              if (results.affectedRows != 1) reject("Ocurrio un error al insertar la modificación del transporte")
              resolve()
            });
          }
        } 
      });
    } 
    catch (err){
        reject(err)
    }
  })
}

module.exports = { 
  getIdTransporte,
  insertUpdate,
  updateStatusTransporte,
  getIdStatus
}