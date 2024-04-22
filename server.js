'use strict';
const { parse } = require('node:url');

const { createServer } = require('node:http');
const url = require('node:url');
const hostname = 'localhost';
const port = 8080;

function handler(request, response) {

  console.log('url', request.url)
  const req = url.parse(request.url, true)

  if (req.query && req.query.recurso) {
    const recurso = req.query.recurso;

    switch (recurso) {
      case 'text':
        response.statusCode = 200;
        response.setHeader('Content-Type', 'text/plain');
        response.end(`
          -nombre = 'carlos',
          -edad =  25,
          -tipoSangre = 'O-'
        `);
        break;
      case 'html':
        response.statusCode = 200;
        response.setHeader('Content-Type', 'text/html; charset=utf-8');
        response.end(
          `<div>
            <h1 style="text-aling=center;">Carlos</h1>
            <h2 style="text-aling=center;">25 años</h2>
            <h3 style="text-aling=center;">Tipo de sangre: O-</h3>
          </div>`
      );
        break;
      case 'json':
        response.statusCode = 200;
        response.setHeader('Content-Type', 'application/json');
        response.end({
          nombre: 'carlos',
          edad: 25,
          tipoSangre: 'O-'
        });
        break;
      case 'csv':
        response.statusCode = 200;
        response.setHeader('Content-Type', 'text/csv');
        response.setHeader('')
        response.end(
          `nombre,edad,Tipo Sangre,\nCarlos,25,o-`
        );
        break;
      default:
        response.statusCode = 404;
        response.setHeader('Content-Type', 'text/html');
        response.end(`<div style='width:100%;height:100%;background-color:green'><h1 style="text-align:center;color:red;">Not Found Error 404</h1></div>`);
        break;
    }
  } else {
    response.statusCode = 200;
    response.setHeader('Content-Type', 'text/html');
    response.end('<h1>Hola</h1>')
  }

}

const server = createServer(handler);

server.listen(port, hostname, () => {
  console.log(`-->Server corriendo en http://${hostname}:${port}/`);
});
