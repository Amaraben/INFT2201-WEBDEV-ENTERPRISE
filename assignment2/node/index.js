import http from "http";
import fs from "fs";
import jwt from "jsonwebtoken";

const JWT_SECRET = "heoldmgbyfdpinvkfdvbdsfurgefrrs";

http
  .createServer((req, res) => {
    if (req.method === "GET") {
      res.writeHead(200, { "Content-Type": "text/plain" });
      res.end("Hello Apache!\n");

      return;
    }

    if (req.method === "POST") {
      if (req.url === "/login") {
        let body = "";
        req.on("data", (chunk) => {
          body += chunk;
        });
        req.on("end", () => {
          try {
            body = JSON.parse(body);

            // handle a login attempt
            
            // open up our "database" (actually a flat file called ./users.txt)
            // to see if there is a username/password combination that matches
            // body.username and body.password
            const users = fs.readFileSync("./users.txt", "utf-8").split("\n");

            let foundUser = null
            
            for (let line of users) {
              const [fileUsername, filePassword, userID, role] = line.trim().split(",");
                
                if (fileUsername === body.username)  {
                  foundUser = {filePassword, userID, role} ;
                  break;
                }
            }
            
            
            // return a 404 error if the username isn't found
            if (!foundUser) {
              res.writeHead(404, { "Content-Type": "text/plain" });
              res.end(`${body.username} not found\n`);
              return;
            }

            
            // return a 401 error if the username is found but the password doesn't match
            if (foundUser.filePassword !== body.password) {
              res.writeHead(404, { "Content-Type": "text/plain" });
              res.end("Error: Username and password do not match");
              return;
            }
            
            // on success, return an encoded userId and role using your JWT_SECRET.
            // https://www.npmjs.com/package/jsonwebtoken
            const token = jwt.sign(
              { userId: parseInt(foundUser.userID), role: foundUser.role},
              JWT_SECRET,
              { expiresIn: "2h"}
            );

          
            res.writeHead(200, { "Content-Type": "application/json" });
            res.end(JSON.stringify({ token: token }));

          }catch (err)

        {
        res.writeHead(500, { "Content-Type": "text/plain"});
        res.end("Server error\n")
        }  
      });
      return;
    }
  }
  res.writeHead(404, { "Content-Type": "text/plain" });
  res.end("Not found\n");
  })
  .listen(8000);

console.log("listening on port 8000");
