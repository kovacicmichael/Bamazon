var mysql = require("mysql");
var inquirer = require("inquirer");
var Table = require('cli-table');


var connection = mysql.createConnection({
	host: "localhost",
	port: 8889,
	user: "root",
	password: "root",
	database: "bamazon_db"
});

var productArray = [];

connection.connect(function(error){
	if(error) throw error;

	console.log("connected as id " + connection.threadId);
	table();
});

function table(){

	connection.query('SELECT id, product_name, price FROM products', function(err, result){
		if(err) console.log(err);

		var table = new Table({
    		head: ['Item ID', 'Product Name', 'Price'],
  			style: {
					head: ['blue'],
					compact: false,
					colAligns: ['center'],
			}
		});

		for(var i = 0; i < result.length; i++){
			table.push(
				[result[i].id, result[i].product_name, result[i].price]
			);
		}

		console.log("Items available for sale include: \n");

		productArray = [];

		for(var i = 0; i < result.length; i++){
			productArray.push(result[i].product_name);
		};
	console.log(table.toString());
	//itemDisplay();
	orderItem();

	})
}


function itemDisplay(){
	connection.query("SELECT * FROM products", function(err, res){
		if(err) throw err;

		console.log("Items available for sale include: \n");

		productArray = [];

		for(var i = 0; i < res.length; i++){
			console.log(res[i].id + " | " + res[i].product_name + " | " + res[i].department_name + " | " + res[i].price + " | " + res[i].stock_quantity)
			productArray.push(res[i].product_name);
		};

		orderItem();
	})
};

function orderItem(){

	inquirer.prompt([
			{
				type: "confirm",
				name: "confirm",
				default: true,
				message: "Would you like to make a purchase?"
			}
	]).then(function(confirmResponse){
		if(confirmResponse.confirm){
			inquirer.prompt([
				{
					type: "list",
					name: "chosenProduct",
					message: "Which product would you like to buy?",
					choices: productArray
				},
				{
					type: "input",
					name: "amountProduct",
					message: "What quantity of the item would you like?"
				}
			]).then(function(productResponse){
				//console.log("this is working")
				connection.query("SELECT * FROM products WHERE ?", {product_name: productResponse.chosenProduct}, function(err, res){

					//console.log(res)
					if(productResponse.amountProduct <= res[0].stock_quantity){
						console.log("-------------------------------");
						console.log("Thank you for your order!");
						console.log("Your order has been recieved and will be processed shortly...");
						updateInventory(productResponse.amountProduct, productResponse.chosenProduct);
					}else{
						console.log("I am sorry, but that item does not have enough in stock for this transaction...")
						orderAnotherItem();
					}
				})


			})
		}else{
			console.log("Thank you for your business!  Come back soon!");
			return;
		}
	})
}

function orderAnotherItem(){
	inquirer.prompt([
			{
				type: "confirm",
				name: "confirm",
				default: true,
				message: "Would you like to make another purchase?"
			}
	]).then(function(confirmResponse){
		if(confirmResponse.confirm){
			inquirer.prompt([
				{
					type: "list",
					name: "chosenProduct",
					message: "Which product would you like to buy?",
					choices: productArray
				},
				{
					type: "input",
					name: "amountProduct",
					message: "What quantity of the item would you like?"
				}
			]).then(function(productResponse){
				//console.log("this is working")
				connection.query("SELECT * FROM products WHERE ?", {product_name: productResponse.chosenProduct}, function(err, res){

					//console.log(res)
					if(productResponse.amountProduct <= res[0].stock_quantity){
						console.log("-------------------------------");
						console.log("Thank you for your order!");
						console.log("Your order has been recieved and will be processed shortly...");
						updateInventory(productResponse.amountProduct, productResponse.chosenProduct);

					}else{
						console.log("I am sorry, but that item does not have enough in stock for this transaction...")
						orderAnotherItem();
					}
				})


			})
		}else{
			console.log("Thank you for your business!  Come back soon!");
			return;
		}
	})
}



function updateInventory(quantity, userResponse){

	connection.query("SELECT * FROM products WHERE ?", {product_name: userResponse}, function(err, res){
			//console.log(res);
					var currentStock = res[0].stock_quantity
					var currentPrice = res[0].price;
					var total = currentPrice * quantity;

					console.log("Your total cost will be: \n" + total)
					console.log("------------------")
	

		connection.query("UPDATE products SET ? WHERE ?",
			[
				{
					stock_quantity: currentStock - quantity
				},
				{
					product_name: userResponse
				}
			],
			function(err, res){
				if(err) throw err;

				//console.log("Inventory Updated!\n");
				displayInventory();
				//orderAnotherItem();
			}

		);
	})
}


function displayInventory(){
	connection.query("SELECT * FROM products", function(err, result){
		if(err) throw err;

		console.log("Current inventory and prices: \n");

		var table = new Table({
    		head: ['Item ID', 'Product Name', 'Price', "Quantity"],
  			style: {
					head: ['blue'],
					compact: false,
					colAligns: ['center'],
			}
		});

		for(var i = 0; i < result.length; i++){
			table.push(
				[result[i].id, result[i].product_name, result[i].price, result[i].stock_quantity]
			);
		}
		console.log(table.toString());

		productArray = [];

		for(var i = 0; i < result.length; i++){
			productArray.push(result[i].product_name);
		};

		orderAnotherItem();
	})
}

