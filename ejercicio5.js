/**
 * * api/v1/scholarship-programme
 */

'use strict'; // modo estricto, previene errores cómunes

const url = require('node:url');
const { createServer } = require('node:http');
const { existsSync } = require('node:fs'); // función asincrona (al mismo tiempo) que devuelve si un archivo existe en el fs
const { readFile, writeFile } = require('node:fs/promises');
const { resolve, join } = require('node:path');
const { randomUUID } = require('node:crypto');
const { type } = require('node:os');
const { measureMemory } = require('node:vm');
//
const hostname = '127.0.0.1';
const port = 3000;

/**
 * * Managing routes
 */
/**
 *
 * @param {object} req request (solicitud HTTP) contiene información de la solicitud, encabezado, método HTTP, URL
 * @param {object} res response  (respuesta HTTP) establece encabezados,códigos de estado y envia datos de respuesta.
 */
async function handler(req, res) {
  try {
    /**
     * @param {Array} body // Se utiliza para guardar los datos de la solicitud HTTP
     */
    let body = [];
    const { headers, method } = req; // desestructura nuestro objeto req para obtener los method y los headers y los guarda en variables con el mismo nombre
    /**
     * @param pathname url.parse función proporcioanda por el módulo URL de Node.js que analiza una URL y devuelve un objeto con sus componentes en este caso req.url es la propiedad que contiene la URL de la solicitud.
     * @param query True es para que también se analicen los parámetros de la cadena de consulta (query string) y se incluya en el objeto resultante  */
    let { pathname, query } = url.parse(req.url, true);
    /**
     *@param {string} fileName Constante que almacena nuestro nombre de nuestro archivo el cuál usaremos durante nuestro procesos.
     */
    const fileName = 'registros.json';
    query = JSON.parse(JSON.stringify(query));
    /**
     * @param {function}
     * Función que nos permite leer nuestro archivo filename. Si no lo encuentra nos regresa un 503 (servicio no disponible)
     */
    const json = await read(fileName);
    if (!json) {
      // En caso de no poder leer nuestro archivo
      res.statusCode = 503;
      res.setHeader('Content-Type', 'application/json');
      return res.end(`{ "mensaje": "No fue posible obtener los datos almacenados" }`);
    }

    /**
     * *Maneja nuestras solicitudes HTTP
     */
    switch (method) {
      // En caso de obtener el método get con /becarios
      case 'GET':
        switch (pathname) {
          // Switch dependiendo de nuestro pathname
          case '/becarios': {
            const result = intern.get({ json, query });
            res.statusCode = result.code; // status = OK (200)
            res.setHeader('Content-Type', 'application/json'); //Pone el header en JSON para que podamos imprimir nuestro JSON
            return res.end(
              JSON.stringify({
                mensaje: `${result.menssage}`,
                registros: result.data,
              })
            ); // Mandamos nuestro JSON con .lenght muestra el cuantos becarios registrados tenemos y sus respectivos registros.
          }

          // En caso de que sea becarios/programas
          case '/programas': {
            const result = program.get({ json, query });
            res.statusCode = result.code;
            res.setHeader('Content-Type', 'application/json');
            return res.end(
              JSON.stringify({
                mensaje: `${result.message}`,
                registros: result.data,
              })
            );
          }
          case '/pasantias': {
            const result = internship.get({ json, query });
            res.statusCode = result.code;
            res.setHeader('Content-Type', 'application/json');
            return res.end(
              JSON.stringify({
                mensaje: `${result.message}`,
                registros: result.data,
              })
            );
          }

          default:
            res.statusCode = 404;
            res.setHeader('Content-Type', 'application/json');
            return res.end(`{ "mensaje": "El recurso solicitado no existe" }`);
        }
        break;

      // En caso de que nuestro método sea POST
      case 'POST':
        switch (pathname) {
          // Si en nuestro pathname nos encontramos con registrar
          case '/becarios/registrar':
            {
              // Cuando se recibe un evento de datos ('data') significa que hay información entrante en la solicitud. Esto puede ser parte de un cuerpo de solicitud POST, que puede ser grande y enviarse en fragmentos (chunks). Usamos el método req.on para escuchar eventos de datos y manejar los chunks de datos entrantes.
              req
                .on('data', (chunk) => {
                  try {
                    body.push(chunk); // Cada chunk de datos recibidos se agrega a un array llamado 'body'.
                  } catch (err) {
                    // En caso de error un 500 (erorr del servidor) y terminamos la operación.
                    res.statusCode = 500;
                    res.setHeader('Content-Type', 'application/json');
                    res.end(`{ "mensaje": "Ocurrió un problema al leer los datos de la solicitud" }`);
                  }
                })
                // Cuando recibe el evento 'end' significa que se han recibido todos los datos. En este punto el servidor ya tiene todos los datos del cuerpo de la solicitud POST. Usa req.on para esuchar este evento.
                .on('end', async () => {
                  try {
                    // Concatena todos los chunks de datos recibidos utilizando buffer.concat() luego lo conviente en una cadena de texto con toString()
                    body = Buffer.concat(body).toString();
                    // Intenta analizar la cadena para crear un objeto usando JSON. parse
                    body = JSON.parse(body);

                    /**
                     * @param {function} result Ejecuta una función async (create) que contiene información sobre el resultado de la operación. Código de estado, mensaje de texto de error u éxito y demás datos relevantes.
                     */
                    const result = await intern.create({ json, body, fileName });

                    res.statusCode = result.code; // Código de respuesta recibido de nuestro objeto result.
                    res.setHeader('Content-Type', 'application/json');
                    res.end(`{ "mensaje": "${result.message}" }`); // Objeto que regresamos. Con éxito o fallo de la ejecución de nuestra función
                  } catch (err) {
                    console.log(err);
                    res.statusCode = 500;
                    res.setHeader('Content-Type', 'application/json');
                    res.end(`{ "mensaje": Ocurrió un problema al obtener los datos de la solicitud }`);
                  }
                })
                .on('error', (err) => {
                  // Maneja el evento de 'error' se estable el código en 500 y se envia mensaje de erorr.
                  console.log(err);
                  res.statusCode = 500;
                  res.setHeader('Content-Type', 'application/json');
                  res.end(`{ "mensaje": Ocurrió un problema al procesar la solicitud }`);
                });
            }
            break;
          case '/programas/registrar':
            {
              // Cuando se recibe un evento de datos ('data') significa que hay información entrante en la solicitud. Esto puede ser parte de un cuerpo de solicitud POST, que puede ser grande y enviarse en fragmentos (chunks). Usamos el método req.on para escuchar eventos de datos y manejar los chunks de datos entrantes.
              req
                .on('data', (chunk) => {
                  try {
                    body.push(chunk); // Cada chunk de datos recibidos se agrega a un array llamado 'body'.
                  } catch (err) {
                    // En caso de error un 500 (erorr del servidor) y terminamos la operación.
                    res.statusCode = 500;
                    res.setHeader('Content-Type', 'application/json');
                    res.end(`{ "mensaje": "Ocurrió un problema al leer los datos de la solicitud" }`);
                  }
                })
                // Cuando recibe el evento 'end' significa que se han recibido todos los datos. En este punto el servidor ya tiene todos los datos del cuerpo de la solicitud POST. Usa req.on para esuchar este evento.
                .on('end', async () => {
                  try {
                    // Concatena todos los chunks de datos recibidos utilizando buffer.concat() luego lo conviente en una cadena de texto con toString()
                    body = Buffer.concat(body).toString();
                    // Intenta analizar la cadena para crear un objeto usando JSON. parse
                    body = JSON.parse(body);

                    /**
                     * @param {function} result Ejecuta una función async (create) que contiene información sobre el resultado de la operación. Código de estado, mensaje de texto de error u éxito y demás datos relevantes.
                     */
                    const result = await program.create({ json, body, fileName });

                    res.statusCode = result.code; // Código de respuesta recibido de nuestro objeto result.
                    res.setHeader('Content-Type', 'application/json');
                    res.end(`{ "mensaje": "${result.message}" }`); // Objeto que regresamos. Con éxito o fallo de la ejecución de nuestra función
                  } catch (err) {
                    console.log(err);
                    res.statusCode = 500;
                    res.setHeader('Content-Type', 'application/json');
                    res.end(`{ "mensaje": Ocurrió un problema al obtener los datos de la solicitud }`);
                  }
                })
                .on('error', (err) => {
                  // Maneja el evento de 'error' se estable el código en 500 y se envia mensaje de erorr.
                  console.log(err);
                  res.statusCode = 500;
                  res.setHeader('Content-Type', 'application/json');
                  res.end(`{ "mensaje": Ocurrió un problema al procesar la solicitud }`);
                });
            }
            break;

          case 'pasantias/registrar': {
            // Cuando se recibe un evento de datos ('data') significa que hay información entrante en la solicitud. Esto puede ser parte de un cuerpo de solicitud POST, que puede ser grande y enviarse en fragmentos (chunks). Usamos el método req.on para escuchar eventos de datos y manejar los chunks de datos entrantes.
            req
              .on('data', (chunk) => {
                try {
                  body.push(chunk); // Cada chunk de datos recibidos se agrega a un array llamado 'body'.
                } catch (err) {
                  // En caso de error un 500 (erorr del servidor) y terminamos la operación.
                  res.statusCode = 500;
                  res.setHeader('Content-Type', 'application/json');
                  res.end(`{ "mensaje": "Ocurrió un problema al leer los datos de la solicitud" }`);
                }
              })
              // Cuando recibe el evento 'end' significa que se han recibido todos los datos. En este punto el servidor ya tiene todos los datos del cuerpo de la solicitud POST. Usa req.on para esuchar este evento.
              .on('end', async () => {
                try {
                  // Concatena todos los chunks de datos recibidos utilizando buffer.concat() luego lo conviente en una cadena de texto con toString()
                  body = Buffer.concat(body).toString();
                  // Intenta analizar la cadena para crear un objeto usando JSON. parse
                  body = JSON.parse(body);

                  /**
                   * @param {function} result Ejecuta una función async (create) que contiene información sobre el resultado de la operación. Código de estado, mensaje de texto de error u éxito y demás datos relevantes.
                   */
                  const result = await intern.create({ json, body, fileName });

                  res.statusCode = result.code; // Código de respuesta recibido de nuestro objeto result.
                  res.setHeader('Content-Type', 'application/json');
                  res.end(`{ "mensaje": "${result.message}" }`); // Objeto que regresamos. Con éxito o fallo de la ejecución de nuestra función
                } catch (err) {
                  console.log(err);
                  res.statusCode = 500;
                  res.setHeader('Content-Type', 'application/json');
                  res.end(`{ "mensaje": Ocurrió un problema al obtener los datos de la solicitud }`);
                }
              })
              .on('error', (err) => {
                // Maneja el evento de 'error' se estable el código en 500 y se envia mensaje de erorr.
                console.log(err);
                res.statusCode = 500;
                res.setHeader('Content-Type', 'application/json');
                res.end(`{ "mensaje": Ocurrió un problema al procesar la solicitud }`);
              });
          }

          default:
            res.statusCode = 202;
            res.setHeader('Content-Type', 'application/json');
            return res.end(`{ "mensaje": "Building..." }`);
        }
        break;
      case 'PATCH': {
        const [, type, ...arr_pathname] = pathname.split('/');

        switch (type) {
          case 'becarios':
            {
              const [action, id] = arr_pathname;

              switch (action) {
                case 'editar':
                  {
                    req
                      .on('data', (chunk) => {
                        try {
                          body.push(chunk); // Cada chunk de datos recibidos se agrega a un array llamado 'body'.
                        } catch (err) {
                          // En caso de error un 500 (erorr del servidor) y terminamos la operación.
                          res.statusCode = 500;
                          res.setHeader('Content-Type', 'application/json');
                          res.end(`{ "mensaje": "Ocurrió un problema al leer los datos de la solicitud" }`);
                        }
                      })
                      // Cuando recibe el evento 'end' significa que se han recibido todos los datos. En este punto el servidor ya tiene todos los datos del cuerpo de la solicitud POST. Usa req.on para esuchar este evento.
                      .on('end', async () => {
                        try {
                          // Concatena todos los chunks de datos recibidos utilizando buffer.concat() luego lo conviente en una cadena de texto con toString()
                          body = Buffer.concat(body).toString();
                          // Intenta analizar la cadena para crear un objeto usando JSON. parse
                          body = JSON.parse(body);

                          /**
                           * @param {function} result Ejecuta una función async (create) que contiene información sobre el resultado de la operación. Código de estado, mensaje de texto de error u éxito y demás datos relevantes.
                           */
                          const result = await intern.update({ json, body, id, fileName });

                          res.statusCode = result.code; // Código de respuesta recibido de nuestro objeto result.
                          res.setHeader('Content-Type', 'application/json');
                          res.end(`{ "mensaje": "${result.message}" }`); // Objeto que regresamos. Con éxito o fallo de la ejecución de nuestra función
                        } catch (err) {
                          console.log(err);
                          res.statusCode = 500;
                          res.setHeader('Content-Type', 'application/json');
                          res.end(`{ "mensaje": Ocurrió un problema al obtener los datos de la solicitud }`);
                        }
                      })
                      .on('error', (err) => {
                        // Maneja el evento de 'error' se estable el código en 500 y se envia mensaje de erorr.
                        console.log(err);
                        res.statusCode = 500;
                        res.setHeader('Content-Type', 'application/json');
                        res.end(`{ "mensaje": Ocurrió un problema al procesar la solicitud }`);
                      });
                  }
                  break;
                //
                case 'programas': {
                  const [action, id] = arr_pathname;
                  switch (action) {
                    case 'editar':
                      {
                        req
                          .on('data', (chunk) => {
                            try {
                              body.push(chunk); // Cada chunk de datos recibidos se agrega a un array llamado 'body'.
                            } catch (err) {
                              // En caso de error un 500 (erorr del servidor) y terminamos la operación.
                              res.statusCode = 500;
                              res.setHeader('Content-Type', 'application/json');
                              res.end(`{ "mensaje": "Ocurrió un problema al leer los datos de la solicitud" }`);
                            }
                          })
                          // Cuando recibe el evento 'end' significa que se han recibido todos los datos. En este punto el servidor ya tiene todos los datos del cuerpo de la solicitud POST. Usa req.on para esuchar este evento.
                          .on('end', async () => {
                            try {
                              // Concatena todos los chunks de datos recibidos utilizando buffer.concat() luego lo conviente en una cadena de texto con toString()
                              body = Buffer.concat(body).toString();
                              // Intenta analizar la cadena para crear un objeto usando JSON. parse
                              body = JSON.parse(body);

                              /**
                               * @param {function} result Ejecuta una función async (create) que contiene información sobre el resultado de la operación. Código de estado, mensaje de texto de error u éxito y demás datos relevantes.
                               */
                              const result = await program.update({ json, body, id, fileName });

                              res.statusCode = result.code; // Código de respuesta recibido de nuestro objeto result.
                              res.setHeader('Content-Type', 'application/json');
                              res.end(`{ "mensaje": "${result.message}" }`); // Objeto que regresamos. Con éxito o fallo de la ejecución de nuestra función
                            } catch (err) {
                              console.log(err);
                              res.statusCode = 500;
                              res.setHeader('Content-Type', 'application/json');
                              res.end(`{ "mensaje": Ocurrió un problema al obtener los datos de la solicitud }`);
                            }
                          })
                          .on('error', (err) => {
                            // Maneja el evento de 'error' se estable el código en 500 y se envia mensaje de erorr.
                            console.log(err);
                            res.statusCode = 500;
                            res.setHeader('Content-Type', 'application/json');
                            res.end(`{ "mensaje": Ocurrió un problema al procesar la solicitud }`);
                          });
                      }
                      break;

                    default:
                      res.statusCode = 202;
                      res.setHeader('Content-Type', 'application/json');
                      return res.end(`{ "mensaje": "El recurso solicitado no existe" }`);
                      break;
                  }
                }
                case 'pasantias':
                  {
                    const [action, id] = arr_pathname;
                    switch (action) {
                      case 'editar':
                        {
                          req
                            .on('data', (chunk) => {
                              try {
                                body.push(chunk); // Cada chunk de datos recibidos se agrega a un array llamado 'body'.
                              } catch (err) {
                                // En caso de error un 500 (erorr del servidor) y terminamos la operación.
                                res.statusCode = 500;
                                res.setHeader('Content-Type', 'application/json');
                                res.end(`{ "mensaje": "Ocurrió un problema al leer los datos de la solicitud" }`);
                              }
                            })
                            // Cuando recibe el evento 'end' significa que se han recibido todos los datos. En este punto el servidor ya tiene todos los datos del cuerpo de la solicitud POST. Usa req.on para esuchar este evento.
                            .on('end', async () => {
                              try {
                                // Concatena todos los chunks de datos recibidos utilizando buffer.concat() luego lo conviente en una cadena de texto con toString()
                                body = Buffer.concat(body).toString();
                                // Intenta analizar la cadena para crear un objeto usando JSON. parse
                                body = JSON.parse(body);

                                /**
                                 * @param {function} result Ejecuta una función async (create) que contiene información sobre el resultado de la operación. Código de estado, mensaje de texto de error u éxito y demás datos relevantes.
                                 */
                                const result = await internship.update({ json, body, id, fileName });

                                res.statusCode = result.code; // Código de respuesta recibido de nuestro objeto result.
                                res.setHeader('Content-Type', 'application/json');
                                res.end(`{ "mensaje": "${result.message}" }`); // Objeto que regresamos. Con éxito o fallo de la ejecución de nuestra función
                              } catch (err) {
                                console.log(err);
                                res.statusCode = 500;
                                res.setHeader('Content-Type', 'application/json');
                                res.end(`{ "mensaje": "Ocurrió un problema al obtener los datos de la solicitud" }`);
                              }
                            })
                            .on('error', (err) => {
                              // Maneja el evento de 'error' se estable el código en 500 y se envia mensaje de erorr.
                              console.log(err);
                              res.statusCode = 500;
                              res.setHeader('Content-Type', 'application/json');
                              res.end(`{ "mensaje": "Ocurrió un problema al procesar la solicitud" }`);
                            });
                        }
                        break;

                      default:
                        res.statusCode = 202;
                        res.setHeader('Content-Type', 'application/json');
                        return res.end(`{ "mensaje": "El recurso solicitado no existe" }`);
                        break;
                    }
                  }
                  return;
                default:
                  res.statusCode = 202;
                  res.setHeader('Content-Type', 'application/json');
                  res.end(`{ "mensaje": "Building..." }`);
                  break;
              }
            }
            return;

          default:
            res.statusCode = 202;
            res.setHeader('Content-Type', 'application/json');
            res.end(`{ "mensaje": "Building..." }`);
            break;
        }
      }
      case 'PUT': {
        const [, type, ...arr_pathname] = pathname.split('/');

        switch (type) {
          case 'pasantias':
            {
              const [action, id] = arr_pathname;

              switch (action) {
                case 'finalizar':
                  {
                    req
                      .on('data', (chunk) => {
                        try {
                          body.push(chunk); // Cada chunk de datos recibidos se agrega a un array llamado 'body'.
                        } catch (err) {
                          // En caso de error un 500 (erorr del servidor) y terminamos la operación.
                          res.statusCode = 500;
                          res.setHeader('Content-Type', 'application/json');
                          res.end(`{ "mensaje": "Ocurrió un problema al leer los datos de la solicitud" }`);
                        }
                      })
                      // Cuando recibe el evento 'end' significa que se han recibido todos los datos. En este punto el servidor ya tiene todos los datos del cuerpo de la solicitud POST. Usa req.on para esuchar este evento.
                      .on('end', async () => {
                        try {
                          // Concatena todos los chunks de datos recibidos utilizando buffer.concat() luego lo conviente en una cadena de texto con toString()
                          body = Buffer.concat(body).toString();
                          // Intenta analizar la cadena para crear un objeto usando JSON. parse
                          body = JSON.parse(body);

                          /**
                           * @param {function} result Ejecuta una función async (create) que contiene información sobre el resultado de la operación. Código de estado, mensaje de texto de error u éxito y demás datos relevantes.
                           */
                          const result = await internship.end({ json, body, id, fileName });

                          res.statusCode = result.code; // Código de respuesta recibido de nuestro objeto result.
                          res.setHeader('Content-Type', 'application/json');
                          res.end(`{ "mensaje": "${result.message}" }`); // Objeto que regresamos. Con éxito o fallo de la ejecución de nuestra función
                        } catch (err) {
                          console.log(err);
                          res.statusCode = 500;
                          res.setHeader('Content-Type', 'application/json');
                          res.end(`{ "mensaje": Ocurrió un problema al obtener los datos de la solicitud }`);
                        }
                      })
                      .on('error', (err) => {
                        // Maneja el evento de 'error' se estable el código en 500 y se envia mensaje de erorr.
                        console.log(err);
                        res.statusCode = 500;
                        res.setHeader('Content-Type', 'application/json');
                        res.end(`{ "mensaje": Ocurrió un problema al procesar la solicitud }`);
                      });
                  }
                  break;

                default:
                  res.statusCode = 202;
                  res.setHeader('Content-Type', 'application/json');
                  res.end(`{ "mensaje": "Building..." }`);
                  break;
              }
            }
            return;

          default:
            res.statusCode = 202;
            res.setHeader('Content-Type', 'application/json');
            res.end(`{ "mensaje": "Building..." }`);
            break;
        }
      }
      case 'DELETE':
        {
          const [, type, ...arr_pathname] = pathname.split('/');

          switch (type) {
            case 'becarios': {
              const [action, id] = arr_pathname;

              switch (action) {
                case 'cambiar-estado': {
                  const result = await intern.changeStatus({ json, id });

                  res.statusCode = result.code;
                  res.setHeader('Content-Type', 'application/json');
                  return res.end(`{ "mensaje": ${result.message} }`);
                }
                default:
                  res.statusCode = 202;
                  res.setHeader('Content-Type', 'application/json');
                  return res.end(`{ "mensaje": "El recurso solicitado no existe" }`);
              }
            }
            case 'programas':
              {
                const [action, id] = arr_pathname;
                switch (action) {
                  case 'cambiar estatus':
                    const result = await program.changeStatus({ json, id });
                    es.statusCode = result.code;
                    res.setHeader('Content-Type', 'application/json');
                    return res.end(`{ "mensaje": ${result.message} }`);

                  case 'eliminar': {
                    const result = await program.delete({ json, id });
                    es.statusCode = result.code;
                    res.setHeader('Content-Type', 'application/json');
                    return res.end(`{ "mensaje": ${result.message} }`);
                  }
                  default:
                    res.statusCode = 202;
                    res.setHeader('Content-Type', 'application/json');
                    return res.end(`{ "mensaje": "El recurso solicitado no existe" }`);
                    break;
                }
              }
              return;

            default:
              res.statusCode = 202;
              res.setHeader('Content-Type', 'application/json');
              return res.end(`{ "mensaje": "El recurso solicitado no existe" }`);
          }
        }
        break;
      default:
        res.statusCode = 501;
        res.setHeader('Content-Type', 'application/json');
        return res.end(`{ "mensaje": "Método no permitido" }`);
    }
  } catch (error) {
    console.log(error);
    res.statusCode = 500;
    res.setHeader('Content-Type', 'application/json');
    return res.end(`{ "mensaje": "Ocurrió un problema al procesar la solicitud" }`);
  }
}

const server = createServer(handler);

server.listen(port, hostname, () => {
  console.log(`Server running at http://${hostname}:${port}/`);
});

/**
 * * get the data of a file
 * @param {string} fileName
 * Recibe un archivo que quiere leer. La función join contruye la ruta completa del archivo apartir apartir de la ruta de la carpeta donde se encuentran los archivos y el nombre del archivo proporcionado como argumento.
 * @returns json(Nuestros datos en JSON) o null

 */

const read = async (fileName) => {
  try {
    const folder = join(__dirname, '/assets/ej5-becarios');
    const filePath = join(folder, fileName);

    if (!existsSync(filePath)) {
      console.log(`The file ${fileName} doesn't exist`);
      return null;
    }

    // En caso de que el archivo exista
    const data = await readFile(filePath, { encoding: 'utf-8' });

    return JSON.parse(data);
  } catch (error) {
    console.log(error);
    return null;
  }
};

/**
 * * add or update the data of a file
 * @param {json} params
 * @return boolean (T if se pudo escribir) (else F no se pudo escribir)
 */
const write = async (params) => {
  try {
    const folder = resolve('./assets/ej5-becarios'); // del módulo path, obtiene la ruta absoluta de la carpeta donde se van almacenar los archivos.
    const filePath = join(folder, params.fileName); // del módulo path para construir la ruta completa del archivo apartir de la ruta de la carpeta y el nombre del archivo proporcionado en `params.filename`

    if (!existsSync(filePath)) {
      console.log(`The file ${params.fileName} doesn't exist`);
      return false;
    }

    // En caso de que el archivo exista:
    await writeFile(filePath, JSON.stringify(params.data), { encoding: 'utf-8' }); //del modulo fs/promises para escribir los datos en el archivo de forma asíncrona. Se utiliza Stringy para convenrir el objeto params.data a una cadena JSON antes de escribirlo en el archivo. Se especifica el enconding

    console.log(`Data saved at ${params.fileName}`);
    return true;
  } catch (error) {
    console.log(error);
    return false;
  }
};

/**
 * * Managing interns
 */
const intern = {
  get: async (querys) => {
    const result = {
      code: 200,
      message: '',
      data: null,
    };

    try {
      const { json, query } = params;

      let data = [...json.becarios];

      if (query.curp) {
        data = data.filter((becario) => becario.curp === query.curp);
      }

      if (query.rfc) {
        data = data.filter((becario) => (becario.rfc = query.rfc));
      }

      if (query.nombre) {
        data = data.filter((becario) => (becario.nombre = query.nombre));
      }
      if (query.primerApellido) {
        data = data.filter((becario) => (becario.primerApellido = query.primerApellido));
      }
      if (query.segundoApellido) {
        data = data.filter((becario) => (becario.segundoApellido = query.segundoApellido));
      }

      result.message =
        data.length > 0
          ? `Actualmente se tiene una plantilla de ${data.length} becario(s) registrados`
          : `No se encontraron becarios registrados`;
      result.data = data;
      return result;
    } catch (err) {
      console.log(err);
      result.code = 500;
      result.message = 'Ocurrio un problema al obtener los datos de los becarios';
      return result;
    }
  },
  create: async (params) => {
    const result = {
      code: 201,
      message: '',
    };

    try {
      const { body, json, fileName } = params;

      // REGEX_CURP
      const regex_curp = new RegExp(/^[A-Z]{4}[0-9]{6}(H|M)[A-Z]{2}[A-Z]{3}[0-9]{2}$/);

      const regex_rfc = new RegExp(/^[A-Z]{4}[0-9]{6}[A-Z]{2}[0-9][0-9]*/);

      const regex_email = new RegExp(/^([a-z][0-9]|_|.)+@([a-z][0-9])+((.[a-z]{2,3})|(.[a-z]{2,3}.[a-z]{2,3}))$/);

      // uuid
      let uuid = randomUUID();
      // Validaciones
      if (!body.curp) {
        result.code = 400;
        result.message = `El CURP es requerido para continuar`;
        return result;
      }
      if (!regex_curp.test(body.curp)) {
        result.code = 400;
        result.message = `El CURP es invalido`;
        return result;
      }
      if (!body.rfc) {
        result.code = 400;
        result.message = `El rfc es requerido para continuar`;
        return result;
      }
      if (!regex_rfc.test(body.rfc)) {
        result.code = 400;
        result.message = `El rfc es invalido`;
        return result;
      }

      if (!body.nombre) {
        result.code = 400;
        result.message = `El nombre es requerido para continuar`;
        return result;
      }

      if (!body.primerApellido) {
        result.code = 400;
        result.message = `El primer apellido es requerido para continuar`;
        return result;
      }

      if (!body.segundoApellido) {
        result.code = 400;
        result.message = `El segundo apellido s requerido para continuar`;
        return result;
      }

      if (!body.fechaNacimiento) {
        result.code = 400;
        result.message = `La fecha de nacimiento es requerido para continuar`;
        return result;
      }

      if (!body.telefono) {
        result.code = 400;
        result.message = `El telefono es requerido para continuar`;
        return result;
      }

      if (!body.email) {
        result.code = 400;
        result.message = `El email es requerido para continuar`;
        return result;
      }

      if (!regex_email.test(body.email)) {
        result.code = 400;
        result.message = `El email es invalido`;
        return result;
      }

      //

      if (json.becarios.some((becario) => becario.curp === body.curp)) {
        result.code = 400;
        result.message = `El email ya está registrado`;
        return result;
      }
      if (json.becarios.some((becario) => becario.rfc === body.rfc)) {
        result.code = 400;
        result.message = `El rfc ya está registrado`;
        return result;
      }
      if (json.becarios.some((becario) => becario.email === body.email)) {
        result.code = 400;
        result.message = `El email ya está registrado`;
        return result;
      }
      while (json.becario.some((becario) => becario.id === u)) {
        uuid = randomUUID();
      }

      //

      /**
       * Que el curp, el rfc y el email sean unicos
       */
      json.becarios.push({
        id: uuid,
        curp: body.curp,
        rfc: body.rfc,
        nombre: body.nombre,
        primerApellido: body.primerApellido,
        segundoApellido: body.segundoApellido,
        fechaNacimiento: body.fechaNacimiento,
        telefono: body.telefono,
        email: body.email,
        estatus: true,
      });

      //
      const saved = await write({ fileName, data: json });
      if (!saved) {
        result.code = 500;
        result.message = `No fue posible almacenar los datos del becario ${body.nombre}`;
        return result;
      }

      result.message = `Se ha registrado el becario ${body.nombre} correctamente`;
      return result;
    } catch (err) {
      console.log(err);
      result.code = 500;
      result.message = `Ocurrió un problema al registrar al becario`;
      return result;
    }
  },

  update: async (params) => {
    const result = {
      code: 200,
      message: '',
      data: null,
    };

    try {
      const { body, json, id, fileName } = params;

      // REGEX_CURP
      const regex_curp = new RegExp(/^[A-Z]{4}[0-9]{6}(H|M)[A-Z]{2}[A-Z]{3}[0-9]{2}$/);

      const regex_rfc = new RegExp(/^[A-Z]{4}[0-9]{6}[A-Z]{2}[0-9][0-9]*/);

      const regex_email = new RegExp(/^([a-z][0-9]|_|.)+@([a-z][0-9])+((.[a-z]{2,3})|(.[a-z]{2,3}.[a-z]{2,3}))$/);

      // Validaciones

      if (!id) {
        result.code = 400;
        result.message = `El ID es requerido para continuar`;
        return result;
      }
      if (!body.curp) {
        result.code = 400;
        result.message = `El CURP es requerido para continuar`;
        return result;
      }
      if (!regex_curp.test(body.curp)) {
        result.code = 400;
        result.message = `El CURP es invalido`;
        return result;
      }
      if (!body.rfc) {
        result.code = 400;
        result.message = `El rfc es requerido para continuar`;
        return result;
      }
      if (!regex_rfc.test(body.rfc)) {
        result.code = 400;
        result.message = `El rfc es invalido`;
        return result;
      }

      if (!body.nombre) {
        result.code = 400;
        result.message = `El nombre es requerido para continuar`;
        return result;
      }

      if (!body.primerApellido) {
        result.code = 400;
        result.message = `El primer apellido es requerido para continuar`;
        return result;
      }

      if (!body.segundoApellido) {
        result.code = 400;
        result.message = `El segundo apellido s requerido para continuar`;
        return result;
      }

      if (!body.fechaNacimiento) {
        result.code = 400;
        result.message = `La fecha de nacimiento es requerido para continuar`;
        return result;
      }

      if (!body.telefono) {
        result.code = 400;
        result.message = `El telefono es requerido para continuar`;
        return result;
      }

      if (!body.email) {
        result.code = 400;
        result.message = `El email es requerido para continuar`;
        return result;
      }

      if (!regex_email.test(body.email)) {
        result.code = 400;
        result.message = `El email es invalido`;
        return result;
      }
      //
      // find intern
      const becarioIndex = json.becarios.findIndex((becario) => becario.id === becario.id);
      if (becarioIndex < 0) {
        result.code = 400;
        result.message = `El becario no se encuentra registrado`;
        return result;
      }

      //

      for (const [index, becario] of json.becarios.entries()) {
        if (becario.curp === body.curp) {
          if (index !== becarioIndex) {
            result.code = 400;
            result.message = `El curp ya se encuentra registrado`;
            return result;
          }
        } else if (becario.rfc === body.rfc) {
          if (index !== becarioIndex) {
            result.code = 400;
            result.message = `El rfc ya se encuentra registrado`;
            return result;
          }
        } else if (becario.email === body.email) {
          if (index !== becarioIndex) {
            result.code = 400;
            result.message = `El rfc ya se encuentra registrado`;
            return result;
          }
        }
      }
      // update data
      const row = json.becarios[becarioIndex];
      row.curp = body.curp;
      row.rfc = body.rfc;
      row.nombre = body.nombre;
      row.primerApellido = body.primerApellido;
      row.segundoApellido = body.segundoApellido;
      row.fechaNacimiento = body.fechaNacimiento;
      row.telefono = body.telefono;
      row.email = body.email;

      //
      const updated = await write({ fileName, data: json });
      if (!updated) {
        result.code = 500;
        result.message = `No fue posible actualizar los datos del becario ${body.nombre}`;
        return result;
      }

      result.message = `Se ha actualizado los datos del becario ${body.nombre} correctamente`;
      return result;
    } catch (err) {
      console.log(err);
      result.code = 500;
      result.message = `Ocurrió un problema al actualizar del becario`;
      return result;
    }
  },

  changeStatus: async (params) => {
    const result = {
      code: 200,
      message: '',
    };
    try {
      const { json, id } = params;

      //
      const row = json.becarios.find((becario) => becario.id == id);
      if (!row) {
        result.code = 400;
        result.message = `El becario no se encuentra registrado`;
        return result;
      }

      const tx1 = row.status ? `desabilitadar` : `habilitar`;
      const tx2 = row.status ? `desabilitado` : `habilitado`;

      //
      row.estatus = !row.estatus;

      const updated = await write({ fileName, data: json });
      if (!updated) {
        result.code = 500;
        result.message = `No fue posible ${tx1} los datos del becario ${row.nombre}`;
        return result;
      }
      result.message = `Se ha ${tx2} al becario ${row.nombre} correctamente`;
      return result;
    } catch (err) {
      console.log(err);
      result.code = 500;
      result.message = `Ocurrió un problema al eliminar al becario`;
      return result;
    }
  },
};

/**
 * * Managing programs
 */
const program = {
  get: (params) => {
    const result = {
      code: 201,
      message: '',
      data: null,
    };
    try {
      const { json, query } = params;

      let data = [...json.programas];

      if (query.clave) {
        data = data.filter((programa) => programa.clave === query.clave);
      }
      if (query.descripcion) {
        data = data.filter((programa) => programa.descripcion === query.descripcion);
      }
      if (query.anio) {
        data = data.filter((programa) => programa.anio === query.anio);
      }
      if (query.area) {
        data = data.filter((programa) => programa.area === query.area);
      }
      if (query.hasOwnProperty('estatus')) {
        data = data.filter((programa) => programa.estatus === (query.status == 'true'));
      }

      result.message = `Actualmente se tienen ${data.programas.length} programa(s) registrados`;
      result.data = data;
      return result;
    } catch (error) {
      console.log(err);
      result.code = 500;
      result.message = `Ocurrió un problema al obtener los programas`;
      return result;
    }
  },
  create: async (params) => {
    const result = {
      code: 201,
      message: '',
    };

    try {
      const { json, body, fileName } = params;

      //regex
      const regex_clave = new RegExp(/^[A-Z]{4}-[0-9]{2}$/);
      const regex_anio = new RegExp(/^(1|2)[0-9]{3}$/);

      // Validaciones
      if (!body.clave) {
        result.code = 400;
        result.message = `La clave es requerida para continuar`;
        return result;
      }

      if (!body.descripcion) {
        result.code = 400;
        result.message = `La descripción es requerida para continuar`;
        return result;
      }

      if (!body.anio) {
        result.code = 400;
        result.message = `El anio es requerido para continuar`;
        return result;
      }

      if (!body.area) {
        result.code = 400;
        result.message = `La area es requerida para continuar`;
        return result;
      }

      if (!body.actividad) {
        result.code = 400;
        result.message = `La actividad es requerida para continuar`;
        return result;
      }

      //
      if (!regex_clave.test(body.clave)) {
        result.code = 400;
        result.message = `La clave es invalida`;
        return result;
      }
      if (!regex_anio.test(body.anio)) {
        result.code = 400;
        result.message = `La clave ya fue registrada `;
        return result;
      }

      if (json.programas.some((programa) => programa.clave === body.clave)) {
        result.code = 400;
        result.message = `El año es invalido`;
        return result;
      }

      //
      json.push({
        clave: body.clave,
        descripcion: body.descripcion,
        anio: body.anio,
        area: body.area,
        actividad: body.actividad,
        estatus: true,
      });

      //
      const saved = await write({ fileName, data: json });
      if (!saved) {
        result.code = 500;
        result.message = `No fue posible almacenar los datos del programa ${body.descripcion}`;
        return result;
      }

      result.message = `Se ha registrado el programa ${body.descripcion} correctamente`;
      return result;
    } catch (err) {
      console.log(err);
      result.code = 500;
      result.message = `Ocurrió un problema al registrar el programa`;
      return result;
    }
  },
  update: async (params) => {
    const result = {
      code: 201,
      message: '',
    };

    try {
      const { json, body, id, fileName } = params;

      //regex
      const regex_clave = new RegExp(/^[A-Z]{4}-[0-9]{2}$/);
      const regex_anio = new RegExp(/^(1|2)[0-9]{3}$/);

      // Validaciones
      if (!body.clave) {
        result.code = 400;
        result.message = `La clave es requerida para continuar`;
        return result;
      }

      if (!body.descripcion) {
        result.code = 400;
        result.message = `La descripción es requerida para continuar`;
        return result;
      }

      if (!body.anio) {
        result.code = 400;
        result.message = `El anio es requerido para continuar`;
        return result;
      }

      if (!body.area) {
        result.code = 400;
        result.message = `La area es requerida para continuar`;
        return result;
      }

      if (!body.actividad) {
        result.code = 400;
        result.message = `La actividad es requerida para continuar`;
        return result;
      }

      //
      if (!regex_clave.test(body.clave)) {
        result.code = 400;
        result.message = `La clave es invalida`;
        return result;
      }
      if (!regex_anio.test(body.anio)) {
        result.code = 400;
        result.message = `La clave ya fue registrada `;
        return result;
      }

      //
      const row = json.programas.find((programas) => programas.clave == id);
      if (!row) {
        result.code = 400;
        result.message = `El programa no se encuentra  registrado `;
        return result;
      }

      //

      //UPDATE DATA
      row.descripcion = body.descripcion;
      row.anio = body.descripcion;
      row.area = body.area;
      row.actividad = body.actividad;

      const updated = await write({ fileName, data: json });
      if (!updated) {
        result.code = 500;
        result.message = `No fue posible actualizar los datos del programa ${row.descripcion}`;
        return result;
      }

      result.message = `Se ha actualizado los datos del prorgrama ${row.descripcion} correctamente`;
      return result;
    } catch (error) {
      console.log(error);
      result.code = 500;
      result.message = `Ocurrió un problema al actualizar el programa`;
      return result;
    }
  },
  delete: async (params) => {
    const result = {
      code: 201,
      message: '',
    };

    try {
      const { json, id, fileName } = params;
      //
      const programasIndex = json.programas.findIndex((programas) => programas.clave == id);
      if (!programasIndex < 0) {
        result.code = 400;
        result.message = `El becario no se encuentra registrado`;
        return result;
      }

      const isUsed = json.pasantias.some((pasantias) => pasantias.programas === id);
      if (!isUsed) {
        result.code = 400;
        result.message = `El programa no se puede eliminar ya que se encuentra relacionado con al menos un becario`;
        return result;
      }

      const removed = json.programas.splice(programasIndex, 1);
      if (removed.length !== 1) {
        result.code = 400;
        result.message = `No fue posible remover el programa ${id}`;
        return result;
      }

      const updated = await write({ fileName, data: json });
      if (!updated) {
        result.code = 500;
        result.message = `No fue posible remover el programa de ${row.descripcion}`;
        return result;
      }

      result.message = `Se ah eliminado el programa ${id} correctamente`;
    } catch (error) {
      console.log(error);
      result.code = 500;
      result.message = `Ocurrió un problema al actualizar el programa`;
      return result;
    }
  },
};

/**
 * * Managing scoolarship
 */

const internship = {
  get: async (params) => {
    const result = {
      code: 201,
      message: '',
      data: null,
    };

    try {
      const { json, query } = params;

      const regexClave = new RegExp(/^[A-Z]{4}-[0-9]{2}$/);

      const regexFolio = new RegExp(/^FP\d{7}$/);

      const regexCurp = new RegExp(/^[A-Z]{4}[0-9]{6}(H|M)[A-Z]{2}[A-Z]{3}[0-9]{2}$/);

      const regexRfc = new RegExp(/^[A-Z]{4}[0-9]{6}[A-Z]{2}[0-9][0-9]*/);

      const regexEmail = new RegExp(/^([a-z][0-9]|_|.)+@([a-z][0-9])+((.[a-z]{2,3})|(.[a-z]{2,3}.[a-z]{2,3}))$/);

      const regexFecha = new RegExp(
        /^([1-9][0-9]{3})\u002D((0[1-9]+)|(1[0-2]+))\u002D((0[1-9]+)|([1-2][0-9]+|3[0-1]+))$/
      );

      let data = [...json.pasantias];

      if (query.folio) {
        if (regexFolio.test(query.folio)) {
          data = data.filter((pasantias) => pasantias.folio === query.folio);
        } else {
          data = [];
        }
      }

      if (query.curp) {
        if (regexCurp.test(query.curp)) {
          const becarioEncontrado = json.find((becario) => becario.curp === query.curp);
          if (becarioEncontrado) {
            data = data.filter((pasantia) => pasantia.idBecario === becarioEncontrado.id);
          } else {
            data = [];
          }
        } else {
          data = [];
        }
      }

      if (query.rfc) {
        if (regexRfc.test(query.rfc)) {
          const becarioEncontrado = becario.find((becario) => becario.rfc === query.rfc);
          if (becarioEncontrado) {
            data = data.filter((pasantia) => pasantia.idBecario === becarioEncontrado.id);
          } else {
            data = [];
          }
        } else {
          data = [];
        }
      }

      if (query.nombre) {
        const becarioEncontrado = json.bearios.find((becario) => becario.nombre === query.nombre);
        if (becarioEncontrado) {
          data = data.filter((pasantia) => pasantia.idBecario === becarioEncontrado.nombre);
        }
      }

      if (query.programaClave) {
        if (regexClave.test(query.programaClave)) {
          data = data.filter((pasantias) => pasantias.idPrograma === query.idPrograma);
        }
      }

      if (query.programaDescripcion) {
        const programaEncontrado = json.programas.find((programa) => programa.descripcion === query.descripcion);
        if (programaEncontrado) {
          data = data.filter((pasantia) => pasantia.idPrograma === programaEncontrado.clave);
        } else {
          data = [];
        }
      }

      if (query.fechaInicio) {
        if (regexFecha.test(query.fechaInicio)) {
          data = data.filter((pasantia) => pasantia.fechaInicio === query.fechaInicio);
        } else {
          data = [];
        }
      }
      if (query.turno) {
        if (['Matutino', 'Vespertino'].includes(query.turno)) {
          data = data.filter((pasantia) => pasantia.turno === query.turno);
        } else {
          data = [];
        }
      }
      if (query.estatus) {
        if (['Activa', 'Baja temporal', 'Baja', 'Finalizada']) {
          data = data.filter((pasantia) => pasantia.estatus === query.estatus);
        } else {
          data = [];
        }
      }
      //

      result.message = `Se han encontrado ${data.length}`;
      result.data = data;
      return data;
    } catch (error) {
      console.log(error);
      result.code = 500;
      result.message = `Ocurrió un problema al obtener los becarios relacionados a los programas  `;
      return result;
    }
  },

  create: async (params) => {
    const result = {
      code: 201,
      message: '',
    };
    try {
      const { json, body, fileName } = params;
      let sequense = 0;

      const regexFecha = new RegExp(
        /^([1-9][0-9]{3})\u002D((0[1-9]+)|(1[0-2]+))\u002D((0[1-9]+)|([1-2][0-9]+|3[0-1]+))$/
      );

      const regexClave = new RegExp(/^[A-Z]{4}-[0-9]{2}$/);

      // Validaciones
      if (!body.becario) {
        result.code = 400;
        result.message = 'Es requerido el idintificador del becario para continuar';
        return result;
      }
      if (!body.idPrograma || !regexClave.test(body.idPrograma)) {
        result.code = 400;
        result.message = 'Es requerido el identificador del programa para continuar';
        return result;
      }
      if (!body.fechaInicio) {
        result.code = 400;
        result.message = 'Es requerida la fecha de inicio para continuar';
        return result;
      }
      if (!body.turno || !['Matutino', 'Vespertino'].includes(body.turno)) {
        result.code = 400;
        result.message = ''; /** *! agregar */
        return result;
      }
      //
      if (regexFecha.test(body.fechaInicio)) {
        result.code = 400;
        result.message = 'Se espera una fecha de inicio con el formato de YY-MM-DD';
        return result;
      }

      const becario = json.becario.some((becario) => becario.id === body.id);
      if (!becario) {
        result.code = 400;
        result.message = 'El becario no se encuentra registrado.';
        return result;
      }
      if (!becario.estatus) {
        result.code = 400;
        result.message = 'No es posible continuar ya que el becario encuentra deshabilitado.';
        return result;
      }

      const programa = json.programa.some((programa) => programa.id === body.id);
      if (!programa) {
        result.code = 400;
        result.message = 'El programa no se encuentra registrado.';
        return result;
      }
      if (!programa.estatus) {
        result.code = 400;
        result.message = 'No es posible continuar ya que el programa se encuentra deshabilitado.';
        return result;
      }

      //
      const isRelated = json.pasantias.some((pasantias) => pasantias.id === body.id);
      if (isRelated) {
        result.code = 400;
        result.message = 'No es posible continuar ya que el becario ya se encuentra relacionado a otro programa.';
        return result;
      }

      const [anio, mes, dia] = body.fechaInicio.split('-');
    } catch (error) {
      console.log(error);
      result.code = 500;
      result.message = `Ocurrió un problema al relacionar el becario con el programa`;
      return result;
    }
  },

  update: async (params) => {
    const result = {
      code: 201,
      message: '',
    };

    try {
      const { json, body, id, fileName } = params;

      const regexClave = new RegExp(/^[A-Z]{4}-[0-9]{2}$/);
      const regexFecha = new RegExp(
        /^([1-9][0-9]{3})\u002D((0[1-9]+)|(1[0-2]+))\u002D((0[1-9]+)|([1-2][0-9]+|3[0-1]+))$/
      );

      if (!id) {
        result.code = 404;
        result.message = 'Es requerido el folio de la pasantia para continuar ';
        return result;
      }

      if (!body.idPrograma || !regexClave.test(body.idPrograma)) {
        result.code = 404;
        result.message = 'Es requerido la clave de la pasantia para continuar ';
        return result;
      }
      if (!body.fechaInicio || !regexFecha.test(body.fechaInicio)) {
        result.code = 404;
        result.message = 'Es requerida la fecha de inicio para continuar ';
        return result;
      }
      if (!body.turno || !['Matutino', 'Vespertino'].includes(body.turno)) {
        result.code = 404;
        result.message = 'Es requerida el turno para continuar ';
        return result;
      }
      //
      const pasantia = json.pasantias.find((pasantias) => pasantias.folio === id);
      if (!pasantia) {
        result.code = 404;
        result.message = 'La pasantia solicitada no se encuentra registrada ';
        return result;
      }
      if (pasantia.estatus !== 'Activo') {
        result.code = 404;
        result.message = 'No es posible la pasantia ya que su estatus cambio';
        return result;
      }

      //
      let programa = null;
      if (pasantia.idPrograma !== body.idPrograma) {
        programa = json.programas.find((programa) => programa.clave === body.idPrograma);
        if (!programa.estatus) {
          result.code = 404;
          result.message = 'No es posible la pasantia ya que su estatus cambio';
          return result;
        }
      }

      //
      const becarioActive = json.becarios.some((becario) => becario.id === pasantia.idBecario && becario.estatus);
      if (!becarioActive) {
        result.code = 404;
        result.message = 'No es posible la pasantia ya que el becario se encuentra inactivo';
        return result;
      }
      //
      let = fechaFin = null;
      if (pasantia.fechaInicio !== body.fechaInicio) {
        const assistenciaExist = json.asistencia.some((asistencia) => asistencia.folio === pasantia.folio);
        if (assistenciaExist) {
          result.code = 404;
          result.message = 'No es posible cambiar la fecha de inicio ya que el becario tiene al menos una asistencia';
          return result;
        }
      }

      //
      const [anio, mes, dia] = body.fechaInicio.split('-');
      fechaFin = `${parseInt(anio) + 1}-${mes}-${dia}`;

      //
      if (programa) {
        pasantia.idPrograma = programa.clave;
      }

      if (fechaFin) {
        {
          pasantia.fechaFin = fechaFin;
        }
      }

      pasantia.turno = body.turno;
      if (body.observaciones && body.observaciones.trim().length > 0) {
        pasantia.observaciones = body.observaciones.trim();
      }
      const updated = await write({ fileName, data: json });
      if (!updated) {
        result.code = 500;
        result.message = `No fue posible actualizar los datos dela pasantia con el folio ${id}`;
        return result;
      }

      result.message = `Se ha actualizado los datos de la pasantia con el folio ${id} correctamente`;
      return result;
    } catch (error) {
      console.log(error);
      result.code = 500;
      result.message = `Ocurrió un problema al actualizar la relación entre el becario y el programa`;
      return result;
    }
  },

  end: async (params) => {
    const result = {
      code: 200,
      message: '',
    };
    try {
      const { json, body, id, fileName } = params;

      if (!id) {
        result.code = 400;
        result.message = `Es necesario el folio de la pasantia para finalizar la pasantia`;
        return result;
      }

      const rowPasantia = json.pasantias.find((pasantia) => pasantia.folio === id);
      if (!rowPasantia) {
        result.code = 400;
        result.message = `No se encontro la pasantia con el folio ${id}`;
        return result;
      }

      const rowBecario = json.becarios.find((becario) => becario.id === rowPasantia.idBecario);
      if (!rowBecario) {
        result.code = 400;
        result.message = `No se encontro el becario relacionado a la pasantia con el folio`;
        return result;
      }

      if (pasantia.estatus === 'Activa') {
        const today = new Date();
        const fechaFinPasantia = new Date(rowPasantia.fechaFin);

        if (fechaFinPasantia >= today) {
          result.code = 400;
          result.message = `No se puede finalizar la pasantia, aun no se supera la fecha de termino ${rowPasantia.fechaFin}`;
          return result;
        }
        rowPasantia.estatus = 'Finalizada';
        rowBecario.estatus = false;

        if (body.observaciones && body.observaciones.trim().length > 0) {
          rowPasantia.observaciones = body.observaciones.trim();
        }

        const updated = await write({ fileName, data: json });
        if (!updated) {
          result.code = 400;
          result.message = `No fue posible finalizar la pasantia`;
          return result;
        }
        result.message = `Se ah finalizado la pasantia con el folio ${id} correctamente`;
      } else {
        result.message = `La pasantia relacionada al folio ${id} no es posible darla de baja ya que ${
          pasantia.estatus === 'Baja' ? 'ah sido dada de baja' : 'se realizó este cambio anteriormente'
        }`;
      }

      return result;
    } catch (error) {
      console.log(error);
      result.code = 500;
      result.message = `Ocurrió un problema al actualizar la relación entre el becario y el programa`;
      return result;
    }
  },
  down: async (params) => {
    const result = {
      code: 200,
      message: '',
    };

    try {
      const { json, body, id, fileName } = params;
      const regexFolio = new RegExp(/^FP\d{7}$/);

      if (!id || !regexFolio.test(id)) {
        result.code = 400;
        result.message = `Es id de la pasantia es requerido para continuar`;
        return result;
      }

      if (!body.motivoBaja || body.motivoBaja.trim().length < 1) {
        result.code = 400;
        result.message = `Se necesita un motivo para efectuar la baja`;
        return result;
      }

      //
      const rowPasantia = json.pasantia.find((pasantia) => pasantia.folio === id);
      if (!rowPasantia) {
        result.code = 400;
        result.message = `La pasantia con el folio ${id} no se encuentra registrada`;
        return result;
      }
      const rowBecario = json.becarios.find((becario) => becario.id === rowPasantia.idBecario);
      if (!rowBecario) {
        result.code = 400;
        result.message = `El becario relacionado a la pasantia no se encuentra registrado`;
        return result;
      }

      if (rowPasantia.estatus === 'Activo') {
        const today = new Date();
        const fechaFinPasantia = new Date(rowPasantia.fechaFin);

        if (fechaFinPasantia >= today) {
          result.code = 400;
          result.message = `No se puede finalizar la pasantia, ya que la fecha termino ${rowPasantia.fechaFin} se ah cumplido`;
          return result;
        }
        
        rowPasantia.estatus = 'Baja';
        rowPasantia.motivoBaja = body.motivoBaja;
        rowBecario.estatus = false;

        const baja = await write({ fileName, nada: json });
        if (!baja) {
          result.code = 500;
          result.message = `No fue posible finalizar la pasantia`;
          return result;
        }
      } else {
        result.code = 400;
        result.message = `La pasantia con el folio ${id} no se puede dar de baja ya que ${
          pasantia.estatus === 'Finalizada' ? 'se ah finalizado' : 'fue dada de baja anteriormente'
        }`;
      }
    } catch (error) {
      console.log(error);
      result.code = 500;
      result.message = `Ocurrió un problema al actualizar la relación entre el becario y el programa`;
      return result;
    }
  },
};
