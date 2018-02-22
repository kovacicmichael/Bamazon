var mysql = require("mysql");
var inquirer = require("inquirer");


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
	itemDisplay();
});


function itemDisplay(){
	connection.query("SELECT * FROM products", function(err, res){
		if(err) throw err;

		console.log("Items available for sale include: \n");

		productArray = [];

		for(var i = 0; i < res.length; i++){
			console.log(res[i].product_id + " | " + res[i].product_name + " | " + res[i].department_name + " | " + res[i].price + " | " + res[i].stock_quantity)
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
					type: "rawlist",
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
				console.log("this is working")
				connection.query("SELECT * FROM products WHERE ?", {product_name: productResponse.chosenProduct}, function(err, res){

					console.log(res)
					if(productResponse.amountProduct <= res[0].stock_quantity){
						console.log("-------------------------------");
						console.log("Your order has been recieved and will be processed shortly...");
						updateInventory(productResponse.amountProduct, productResponse.chosenProduct);
					}
				})


			})
		}else{
			return;
		}
	})
}



function updateInventory(quantity, userResponse){

	connection.query("SELECT * FROM products WHERE ?", {product_name: userResponse}, function(err, res){

					var currentStock = res[0].stock_quantity
	

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

				console.log("Inventory Updated!\n");
				itemDisplay();
			}

		);
	})
}

