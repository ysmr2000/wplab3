const { Client } = require("../models/entities");

const loginControl = (request, response) => {
  const clientServices = require("../services/clientServices");

  let username = request.body.username;
  let password = request.body.password;
  if (!username || !password) {
    response.render('loginfail', { username: `Login failed, please try again` });
  } else {
    if (request.session && request.session.user) {
      response.render('postLogin', { username: username }); 
    } else {
      clientServices.loginService(
        username,
        password,
        function (err, dberr, client) {
          console.log("Client from login service :" + JSON.stringify(client));
          if (client === null) {
            console.log("Authentication problem!");
            response.render('loginfail', { username: `Login failed, please try again` });
          } else {
            console.log("User from login service :" + client[0].num_client);
            //add to session
            request.session.user = username;
            request.session.num_client = client[0].num_client;
            request.session.admin = false;
            response.render('postLogin', { username: username }); 
          }
        }
      );
    }
  }
};

const registerControl = (request, response) => {
  const clientServices = require("../services/clientServices");

  let username = request.body.username;
  let password = request.body.password;
  let society = request.body.society;
  let contact = request.body.contact;
  let addres = request.body.addres;
  let zipcode = request.body.zipcode;
  let city = request.body.city;
  let phone = request.body.phone;
  let fax = request.body.fax;
  let max_outstanding = request.body.max_outstanding;
  let client = new Client(
    username,
    password,
    0,
    society,
    contact,
    addres,
    zipcode,
    city,
    phone,
    fax,
    max_outstanding
  );

  clientServices.registerService(client, function (err, exists, insertedID) {
    console.log("User from register service :" + insertedID);
    if (exists) {
      console.log("Username taken!");
      response.render('postRegister', { message: `Registration failed. Username "${username}" already taken!` });
    } else {
      client.num_client = insertedID;
      console.log(`Registration (${username}, ${insertedID}) successful!`);
      console.log('Please to continue to login now');
      //response.render('postRegister', { message: `Successful registration ${username}!` });
      response.render('login');
      /*response.send(
        `Successful registration ${client.contact} (ID.${client.num_client})!`
      );
     }
     response.end();*/
    }
  });
};

const getClients = (request, response) => {
  const clientServices = require("../services/clientServices");
  clientServices.searchService(function (err, rows) {
    response.json(rows);
    response.end();
  });
};

const getClientByNumclient = (request, response) => {
  const clientServices = require("../services/clientServices");
  let num_client = request.params.num_client;
  clientServices.searchNumclientService(num_client, function (err, rows) {
    response.json(rows);
    response.end();
  });
};

const getClient = (request, response) => {
  const clientServices = require('../services/clientServices');
  let username = request.params.username;
  let num_client;

  clientServices.searchUsername(username, function(err, rows) {
      num_client = rows[0].num_client
      clientServices.searchNumclientService(num_client, function(err, rows) {
          console.log(rows[0])
          response.render('clientDetails', {
              username: username,
              num_client: rows[0].num_client,
              society: rows[0].society,
              contact: rows[0].contact,
              address: rows[0].addres,
              zipcode: rows[0].zipcode,
              city: rows[0].city,
              phone: rows[0].phone,
              fax: rows[0].fax,
              maxOutstanding: rows[0].max_outstanding,
          });
      });
  });

};

module.exports = {
  loginControl,
  registerControl,
  getClients,
  getClientByNumclient,
  getClient,
};