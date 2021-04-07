const sql = require('./sql');
const { sendEventToSQS } = require('./sqs')

exports.handler = async (event, context) => {

  try {       
    let jsonTransporte = undefined;

    for (let indexRecords = 0; indexRecords < event.Records.length; indexRecords++) {
      
      const { body } = event.Records[indexRecords];
      jsonTransporte = JSON.parse(body);

      const queueName = 'input_sap'

      let response = {
        code: 0,
        type: "Anulación transporte",
        message: "",
        payload: JSON.stringify(jsonTransporte)
      } 

      try {

        //Obtener id de transporte
        let idTransporteBD; 

        let results  = await sql.getIdTransporte(jsonTransporte)

        if (results.status == 0) 
        {
          //Enviar mensaje a sap sobre transporte que no existe
          response.code = 0
          response.message = results.message
          await sendEventToSQS(response, queueName)
          context.succeed()
        }

        idTransporteBD = results.data

        //Obtener id de estado 
        results  = await sql.getIdStatus(jsonTransporte)
        
        if (results.status == 0) 
        {
          //Enviar mensaje a sap sobre estado que no existe
          response.code = 0
          response.message = results.message
          await sendEventToSQS(response, queueName)
          context.succeed()
        }

        let idEstado = results.data

        //Actualizar transporte 
        await sql.updateStatusTransporte(jsonTransporte, idTransporteBD)

        //Insertar modificación en base de datos
        await sql.insertUpdate(idTransporteBD, idEstado)
        response.code = 200
        response.message = 'El transporte se anulo correctamente'

        //Generar evento en cola de input sap
        await sendEventToSQS(response, queueName)
        context.succeed()
    
      } catch(err) {
        context.fail()
      }
  }
  } catch (err) {
    context.fail()
  } 
}