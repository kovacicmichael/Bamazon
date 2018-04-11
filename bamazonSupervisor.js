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

connection.connect(function(error){
	if(error) throw error;

	console.log("connected as id " + connection.threadId);

	supervisorOptions();
});
//prompts the supervisor to view product sales by department, create department, or quit
function supervisorOptions(){

	inquirer.prompt([
		{
			type: "list",
			name: "chosenOption",
			message: "What would you like to do?",
			choices: ["View Product Sales by Department", "Create New Department", "QUIT"]
		}
	]).then(function(response){
		if(response.chosenOption === 'View Product Sales by Department'){
			viewSales();
		}else if(response.chosenOption === 'Create New Department'){
			inquirer.prompt([
				{
					type: "input",
					name: "departmentName",
					message: "What is the name of the department?"
				},
				{
					type: "input",
					name: "departmentCost",
					message: "What are the overhead costs of the department?"
				}
			]).then(function(response){
				createDepartment(response.departmentName, response.departmentCost);
			})
		}else if(response.chosenOption === 'QUIT'){
			console.log("You are logged out.")
		}
	})
}
//joins the department and product tables and displays the data in a cli table
function viewSales(){
	connection.query("SELECT departments.department_id, departments.department_name, departments.over_head_costs, products.product_sales " + 
		"FROM departments " + 
		"LEFT JOIN products ON departments.department_name=products.department_name " + 
		"GROUP BY departments.department_name " +
		"ORDER BY departments.department_id", 
		function(err, result){
			var table = new Table({
	    		head: ['Department ID', 'Department Name', 'Over Head Costs', 'Product Sales', 'Total Profits'],
	  			style: {
						head: ['blue'],
						compact: false,
						colAligns: ['center'],
				}
			});

			for(var i = 0; i < result.length; i++){
				let totalProfit = result[i].product_sales - result[i].over_head_costs;

				table.push(
					[result[i].department_id, result[i].department_name, result[i].over_head_costs, result[i].product_sales, totalProfit]
				);
			}

			console.log(table.toString());
			secondPrompt();
	})
}
//receives parameters from supervisor prompt and then creates a new department
function createDepartment(name, cost){
	connection.query("INSERT into departments SET ?",
		{
			department_name: name,
			over_head_costs: cost
		},
		function(err, result){
			if(err) throw err

			console.log("Department was added")
			secondPrompt();
		})
}
//after each functionality this will revisit what the supervisor wants to do
function secondPrompt(){
	inquirer.prompt([
		{
			type: "confirm",
			name: "confirm",
			message: "Would you like to continue?"
		}
	]).then(function(response){
		if(response.confirm){
			supervisorOptions()
		}else{
			console.log("You are logged out.")
		}
	})
}




