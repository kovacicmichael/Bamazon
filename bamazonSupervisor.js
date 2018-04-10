var mysql = require("mysql");
var inquirer = require("inquirer");
var Table = require('cli-table');

//connect with local sql database
var connection = mysql.createConnection({
	host: "localhost",
	port: 8889,
	user: "root",
	password: "root",
	database: "bamazon_db"
});