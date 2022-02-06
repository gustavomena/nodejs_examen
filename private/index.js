const http = require("http");
const url = require("url");
const fs = require("fs");
const dbAction= require("../db/db");



http.createServer(
async (req, res) =>{
    
    if (req.url == "/" && req.method === "GET") {
        try {
          res.setHeader("Content-Type", "text/html");
          const html = fs.readFileSync("public/index.html", "utf-8");
          res.statusCode = 200;
          res.end(html);
          
        } catch (error) {
          console.log("catch error:", error.code);
          const html = fs.readFileSync("errors/404.html", "utf-8");
          res.statusCode = 404;
          res.end(html);          
        }
      }
//leer usuarios
      if (req.url == "/usuarios" && req.method === "GET") {
        try {
          const req = await dbAction.getUsers();
          res.statusCode = 200
          res.end(JSON.stringify(req.rows))
          
        } catch (error) {
          const html = fs.readFileSync("errors/404.html", "utf-8");
          res.statusCode = 404;
          res.end(html);      
        }
      }

 //crear usuario     
      if (req.url == "/usuario" && req.method === "POST") {
        try {
          let body = ""
          req.on("data", (chunk) => {
            body += chunk
          })
          req.on("end", async () => {
            const data = Object.values(JSON.parse(body))
            const dbResponse = await dbAction.setUser(data);
            res.statusCode = 201;
            res.end(JSON.stringify(dbResponse));
          });
          
        } catch (error) {
          const html = fs.readFileSync("errors/error.html", "utf-8");
          res.statusCode = 400;
          res.end(html);
          
        }
      }

//editar usuario
      if (req.url.startsWith("/usuario") && req.method === "PUT") {
        const { id } = url.parse(req.url, true).query;
  
        try {
          let body = ""
          req.on("data", (chunk) => {
            body += chunk
          })
    
          req.on("end", async () => {
            const data = Object.values(JSON.parse(body))
            const dbResponse = await dbAction.updateUser(data, id);
            res.statusCode = 201;
            res.end(JSON.stringify(dbResponse));
          });
          
        } catch (error) {
          const html = fs.readFileSync("errors/error.html", "utf-8");
          res.statusCode = 400;
          res.end(html);
        }
      }

      if (req.url.startsWith("/usuario") && req.method === "DELETE") {
        const { id } = url.parse(req.url, true).query;
        try {
          const dbResponse = await dbAction.deleteUser(id);
          res.statusCode = 202;
          res.end(JSON.stringify(dbResponse));
          
        } catch (error) {
          const html = fs.readFileSync("errors/error.html", "utf-8");
          res.statusCode = 400;
          res.end(html);
        }
      }

      if (req.url == "/transferencia" && req.method === "POST") {
        try {
          let body = ""
          req.on("data", (chunk) => {
            body += chunk
          })
    
          req.on("end", async () => {
            const data = Object.values(JSON.parse(body))
            console.log(data);
            const dbResponse = await dbAction.setTransfer(data);
            res.statusCode = 201;
            res.end(JSON.stringify(dbResponse));
          })
          
        } catch (error) {
          const html = fs.readFileSync("errors/error.html", "utf-8");
          res.statusCode = 400;
          res.end(html);
        }
      }


      if (req.url == "/transferencias" && req.method === "GET") {
        try {
          const dbResponse = await dbAction.getTransfers();
          res.statusCode = 200;
          
          res.end(JSON.stringify(dbResponse.rows));
          
        } catch (error) {
          const html = fs.readFileSync("errors/404.html", "utf-8");
          res.statusCode = 404;
          res.end(html);
          
        }
      }
  

}


).listen(3000,()=>console.log('UP! no errors'));

