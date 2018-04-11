DROP DATABASE if exists bamazon_db;
CREATE DATABASE bamazon_db;
USE bamazon_db;

CREATE TABLE products (
  	id INT(11) AUTO_INCREMENT NOT NULL,
  	product_name VARCHAR(255) NOT NULL,
	department_name VARCHAR(255) NOT NULL,
	price DECIMAL(12, 2) NOT NULL,
  	stock_quantity INT(5),
  	product_sales DECIMAL(12, 2) DEFAULT 0,
	PRIMARY KEY (id) 
);


CREATE TABLE departments (
	department_id INT(11) AUTO_INCREMENT NOT NULL,
	department_name VARCHAR( 255 ) NOT NULL,
	over_head_costs DECIMAL(12, 2),
	PRIMARY KEY (department_id)
);


INSERT INTO products (product_name, department_name, price, stock_quantity)
VALUES ('Sweatshirt', 'Clothing', 19.99, 20);

INSERT INTO products (product_name, department_name, price, stock_quantity)
VALUES ('Trek Bike', 'Outdoor', 999.99, 2);

INSERT INTO products (product_name, department_name, price, stock_quantity)
VALUES ('Lotion', "Health and Beauty", 9.99, 20);

INSERT INTO products (product_name, department_name, price, stock_quantity)
VALUES ('Blanket', 'Bedding', 14.99, 15);

INSERT INTO products (product_name, department_name, price, stock_quantity)
VALUES ('MacBook Pro', 'Electronics', 1200, 20);

INSERT INTO products (product_name, department_name, price, stock_quantity)
VALUES ('Notebook', 'Office Supplies', 5.99, 30);

INSERT INTO products (product_name, department_name, price, stock_quantity)
VALUES ('FItbit', 'Electronics', 100.99, 25);


INSERT INTO departments (department_name, over_head_costs)
VALUES ('Electronics', 30000);

INSERT INTO departments (department_name, over_head_costs)
VALUES ('Clothing', 20000);