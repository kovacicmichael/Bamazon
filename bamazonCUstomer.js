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

var productArray = [];

connection.connect(function(error){
	if(error) throw error;

	console.log("connected as id " + connection.threadId);
	table();
});
//function to render the available items to the console in a cli table
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
		//the for loop pushes all of the product names into the productArray which is used for the choices in the prompts below
		for(var i = 0; i < result.length; i++){
			productArray.push(result[i].product_name);
		};
		console.log(table.toString());
		orderItem();
	})
}

//begins prompt to determine what the user wants to do
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
				//query to database based off of user responses
				connection.query("SELECT * FROM products WHERE ?", {product_name: productResponse.chosenProduct}, function(err, res){
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
//function to be called after the initiial start of the application, prompts the user with a different question than the first
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
//called after the user decides which product they want, parameters detrermined in order item function
function updateInventory(quantity, userResponse){
	connection.query("SELECT * FROM products WHERE ?", {product_name: userResponse}, function(err, res){
		let currentStock = res[0].stock_quantity;
		let currentPrice = res[0].price;
		let currentSales = res[0].product_sales;
		let total = currentPrice * quantity;
		//will print out the total cost to the second decimal point
		console.log("Your total cost will be: \n" + parseFloat(total).toFixed(2))
		console.log("------------------")
		//updates the stock quantity and adds to the products sales
		connection.query("UPDATE products SET ? WHERE ?",
			[
				{
					stock_quantity: currentStock - quantity,
					product_sales: currentSales + total
				},
				{
					product_name: userResponse
				}
			],
			function(err, res){
				if(err) throw err;

				orderItem()
			}
		);
	})
}
//this function is only needed if you want the "order another item" prompt
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

