# TPE-MS-Transporte

## Anulación de transporte

### Documentación

La función Anulación de transporte ejecuta los siguientes pasos :

##### 1. Recibe un mensaje de la cola anulacion_transporte con el siguiente json:

```
    {
        "idTransporte": "1970049",
        "estadoTransporte": "ANULADO"
    }
```
##### 2. Valida la existencia del transporte

##### 3. Obtiene el Id del transporte correspondiente en base de datos

##### 4. Actualiza en la tabla transporte las siguientes columnas

    ```
    estado_transporte = estado de transporte indicado en el json de entrada
    modificacion_transporte = 1 que indica que el transporte tiene una modificación
    ```
##### 5. Obtiene el ID del estado de transporte correspondiente

##### 6. Valida si la modificación ya fue insertada, en caso contrario la inserta

##### 7. Inserta la modificación de transporte en la tabla Modificacion_Transporte

    ```
    fecha_modificacion_transporte = Fecha y hora actual
    detalle_modificacion_transporte = 'Anulación de transporte'
    origen_modificacion_transporte = 'Sap'
    tipo_modificacion_transporte = 'Anulacion'
    fk_transporte = Id de transporte
    fk_estado = Id de estado correspondiente
    ```

##### 8. Genera un evento a la cola input_sap con la siguiente respuesta
```
    {
        code: 200,
        type: "Anulación transporte",
        message: "El transporte se anulo correctamente",
        payload: {
            "idTransporte": "1970049",
            "estadoTransporte": "ANULADO"
        }
    }
```

#### Demo

`npm install`

`npm run deployinit`

`npm run demo`

`npm statuscolas`

#### Test
`npm run test`

Hello! :) 2
