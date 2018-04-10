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


connection.connect(function(error){
	if(error) throw error;

	console.log("connected as id " + connection.threadId);

	managerDisplay();
});
//initial prompt for the manager 
function managerDisplay(){
	inquirer.prompt([
			{
				type: "list",
				name: "chosenOption",
				message: "What would you like to do?",
				choices: ["View Products for Sale", "View Low Inventory", "Add to Inventory", "Add New Product", "QUIT"]
			}
	]).then(function(managerResponse){

		if(managerResponse.chosenOption === "View Products for Sale"){
			table();
		}else if(managerResponse.chosenOption === "View Low Inventory"){
			lowInventory();
		}else if(managerResponse.chosenOption === "Add New Product"){
			inquirer.prompt([
					{
						type: "input",
						name: "itemName",
						message: "What is the name of the product?"
					},
					{
						type: "input",
						name: "department",
						message: "What department is the product found in?"
					},
					{
						type: "input",
						name: "price",
						message: "What is the price of the product?"
					},
					{
						type: "input",
						name: "stock",
						message: "How many items of the product are in stock?"
					}
			]).then(function(productResponse){
				//passes the managers responses as parameters to the addItem function which inputs them into the database
				addItem(productResponse.itemName, productResponse.department, productResponse.price, productResponse.stock);

			})
		}else if(managerResponse.chosenOption === "Add to Inventory"){

			let optionArray = [];

				connection.query("SELECT * FROM products", function(err, res){
					if(err) throw err;

					console.log("Current Inventory: \n");

					for(var i = 0; i < res.length; i++){

						optionArray.push(res[i].product_name)
					};

					inquirer.prompt([
							{
								type: "list",
								name: "chosenItem",
								message: "What item would you like to stock?",
								choices: optionArray
							},
							{
								type:"input",
								name:"stock",
								message:"How many items do you want to stock?"
							}
					]).then(function(chosen){
						//passes choices as parameters to add the amount of stock to the items inventory in the DB
						addInventory(chosen.chosenItem, chosen.stock)
					})

				})
		}else if(managerResponse.chosenOption === "QUIT"){
			console.log("You are logged out")
		}
	})
}

//propmpts the manager to continue the program
function secondPrompt(){
	inquirer.prompt([
		{
			type: "confirm",
			name: "confirm",
			message: "Would you like to continue?"
		}
	]).then(function(response){
		if(response.confirm){
			managerDisplay()
		}else{
			console.log("You are logged out")
		}
	})
}
//cli display table for the available products
function table(){

	connection.query('SELECT * FROM products', function(err, result){
		if(err) console.log(err);

		var table = new Table({
    		head: ['Item ID', 'Product Name', 'Department', 'Price', 'Stock'],
  			style: {
					head: ['blue'],
					compact: false,
					colAligns: ['center'],
			}
		});

		for(var i = 0; i < result.length; i++){
			table.push(
				[result[i].id, result[i].product_name, result[i].department_name, result[i].price, result[i].stock_quantity]
			);
		}

		console.log("Items available for sale include: \n");

		productArray = [];

		for(var i = 0; i < result.length; i++){
			productArray.push(result[i].product_name);
		};
	console.log(table.toString());
	
	secondPrompt();
	})
}
//displays the products with a stock less than or equal to 5
function lowInventory(){
	connection.query("SELECT * FROM products", function(err, res){
		if(err) throw err;

		var table = new Table({
    		head: ['Item ID', 'Product Name', 'Department', 'Price', 'Stock'],
  			style: {
					head: ['blue'],
					compact: false,
					colAligns: ['center'],
			}
		});

		console.log("Stock is low on these items: \n");

		for(var i = 0; i < res.length; i++){
			var stock = res[i].stock_quantity;

			if(stock <= 5){

			table.push(
				[result[i].id, result[i].product_name, result[i].department_name, result[i].price, result[i].stock_quantity]
			);			
			};
		};
		console.log(table.toString());
		secondPrompt();
	})
}
//allows the manager to add an item to the database
function addItem(name, department, price, stock){
	connection.query("INSERT INTO products SET ?",
	{
		product_name: name,
		department_name: department,
		price: price,
		stock_quantity: stock
	},
	 function(err, res){
	 	if(err) throw err;

	 	console.log("Item was added!")
	 	table();
	})

}
//adds to the inventory to any item in the database
function addInventory(item, stock){
	console.log("addinventory function")
	console.log(item, stock)

	let currentStock;
	connection.query("SELECT * FROM products WHERE ?", {product_name: item},
	function(err, res){
		if(err) throw err;
		console.log("currnet stock " + res[0].stock_quantity)
		currentStock = res[0].stock_quantity
		console.log("stock " + stock)

		let updateStock = parseInt(currentStock) + parseInt(stock)
		console.log("update stock " + updateStock)

		connection.query("UPDATE products SET ? WHERE ?", [{
		stock_quantity: updateStock
		}, {
		product_name: item
		}],
		function(err, res){
		if(err) throw err;

		console.log(res)
		table();
		})
	})
}




