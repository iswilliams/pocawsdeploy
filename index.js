const AWS = require('aws-sdk');
const mysql = require('mysql');

const LOCAL_IP = process.env.LOCALIP || '192.168.1.94';

//Configuración de AWS
const config = {
  endpoint: new AWS.Endpoint(`http://${LOCAL_IP}:4566/`),
  accessKeyId: process.env.ACCESSKEYID || 'na',
  secretAccessKey: process.env.SECRETACCESSKEYID || 'na',
  region: process.env.REGION || 'REGION'
};

AWS.config.logger = console;
AWS.config.update(config);
var sqs = new AWS.SQS;

// Configuración de base de datos
const connection = mysql.createConnection({
  host: LOCAL_IP,
  user: process.env.MYSQLUSER || 'root',
  password: process.env.MYSQLPASSWORD || 'password',
  database: process.env.DATABASE || 'db'
});

const executeAsyncQuery = (sql, params) => {
  return new Promise((resolve, reject) => {
    connection.query(sql, params, (err, results) => {
      if (err) {
        reject(err);
      }
      console.log("-----Query Done!");
      resolve(results);
    });
  })
}

exports.handler = async (event, context) => {
  let jsonTransporte = undefined;

  for (let indexRecords = 0; indexRecords < event.Records.length; indexRecords++) {
    const { body } = event.Records[indexRecords];
    jsonTransporte = JSON.parse(body);

    try {
      //Recorrer transportes
      let transporte = undefined;
      for (let index = 0; index < jsonTransporte.transportes_json.length; index++) {
        transporte = jsonTransporte.transportes_json[index];
        // TODO validar que sea transporte unico antes de insertar
        const sql = `INSERT INTO db.Transporte
          (numero_transporte,
           camion_transporte,
           tipo_transporte,
           estado_transporte,
           modificacion_transporte,
           fecha_inicio_transporte,
           fk_cd)
          VALUES 
          ( '${transporte.idTransporte}',
            '${transporte.idCamion}',
            '-',
            '${transporte.estadoTransporte}',
            0,
            '${transporte.fechaHora}',
            1)`;

        // TODO validar el uso de params (si es que sirve para algo)
        const result = await executeAsyncQuery(sql, 0); //insertId

        let pallets = transporte.pallet
        //Recorrer pallets
        for (let indexPallet = 0; indexPallet < pallets.length; indexPallet++) {
          // TODO validar que sea pallet unico antes de insertar
          let pallet = pallets[indexPallet];
          const sql = `insert into db.Pallet_Transporte 
          (numero_pallet, id_ola, prioridad_pallet, tipo_pallet, remonte_pallet, 
            estado_pallet, total_capas_pallet, modificacion_pallet, impresora_pallet, fk_transporte) 
          values ('${pallet.idPallet}',
          '${pallet.idOla}',
          '${parseInt(pallet.prioridadArmadoPallet)}',
          '${pallet.tipoPallet}',
          '${parseInt(pallet.remonte)}',
          '-',
          '${parseInt(pallet.totalCapas)}',
          0,
          '-',
          '${result.insertId}')`;

          await executeAsyncQuery(sql, 0); //insertId

          //Parametros para envio de mensaje a transpaleta
          const payload = {
            idTransporte: transporte.idTransporte,
            pallet: pallet
          };
          var params = {
            MessageBody: JSON.stringify(payload),
            QueueUrl: `http://${LOCAL_IP}:4566/000000000000/transpaleta.fifo`,
            MessageGroupId: 'default',
          };
          //Generar evento en cola de traspaleta
          await sqs.sendMessage(params).promise()
            .then(data => {
              console.info("Successfully added message to queue", data);
              // context.succeed("Successfully added message to queue", data);
            })
            .catch(err => {
              console.error("Error: ", err);
              // context.succeed("Error: ", err);
            });
        }
      }
    } catch (err) {
      // TODO tirar error para que reinente
      console.error(err);
      // context.succeed("Error: ", err);
    }
  }

}
