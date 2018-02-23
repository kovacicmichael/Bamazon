var mysql = require("mysql");
var inquirer = require("inquirer");


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
			//console.log("it works")
			itemDisplay();
		}else if(managerResponse.chosenOption === "View Low Inventory"){
			console.log("inventory")
			lowInventory();
		}else if(managerResponse.chosenOption === "Add to Inventory"){
			console.log("here")
			inquirer.prompt([
					{
						type: "input",
						name: "itemName",
						message: "What is the name of the product?"
					}
					{
						type: "input",
						name: "department",
						message: "What department is the product found in?"
					}
					{
						type: "input",
						name: "price",
						message: "What is the price of the product?"
					}
					{
						type: "input",
						name: "stock",
						message: "How many items of the product are in stock?"
					}
			]).then(function(productResponse){

				addInventory(productResponse.itemName, productResponse.department, productResponse.price, productResponse.stock);

			})
		}
	})
}


// function chooseAnother(){
// 	inquirer.prompt([
// 			{
// 				type: "rawlist",
// 				name: "chosenOption",
// 				message: "Would you like to?",
// 				choices: ["View Products for Sale", "View Low Inventory", "Add to Inventory", "Add New Product"]
// 			}
// 	]).then(function(managerResponse){

// 		if(managerResponse.chosenOption === "View Products for Sale"){
// 			console.log("it works")
// 			itemDisplay();
// 		}else if(managerResponse.chosenOption === "View Low Inventory"){
// 			console.log("inventory")
// 			lowInventory();
// 		}else if(managerResponse.chosenOption === "Add to Inventory"){
// 			console.log("here")
// 		}
// 	})
// }


function itemDisplay(){
	connection.query("SELECT * FROM products", function(err, res){
		if(err) throw err;

		console.log("Items available for sale include: \n");

		for(var i = 0; i < res.length; i++){

			console.log(res[i].id + " | " + res[i].product_name + " | " + res[i].department_name + " | " + res[i].price + " | " + res[i].stock_quantity)
		
		};
	})
};

function lowInventory(){
	connection.query("SELECT * FROM products", function(err, res){
		if(err) throw err;

		console.log("Stock is low on these items: \n");

		for(var i = 0; i < res.length; i++){
			var stock = res[i].stock_quantity;

			if(stock <= 5){

			console.log(res[i].id + " | " + res[i].product_name + " | " + res[i].department_name + " | " + res[i].price + " | " + res[i].stock_quantity)
			
			};
		};
	})
}

function addInventory(name, department, price, stock){
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
	 	itemDisplay();
	})

}






// 	productArray.push(res[i].product_name);
// productArray = [];


