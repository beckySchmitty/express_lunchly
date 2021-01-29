// Customer for Lunchly
const db = require("../db");
const Reservation = require("./reservation");

// Custome of the restuarant
class Customer {
  constructor({ id, firstName, lastName, phone, notes }) {
    this.id = id;
    this.firstName = firstName;
    this.lastName = lastName;
    this.phone = phone;
    this.notes = notes;
  }

// find all customers
  static async all() {
    const results = await db.query(
      `SELECT id, 
         first_name AS "firstName",  
         last_name AS "lastName", 
         phone, 
         notes
       FROM customers
       ORDER BY last_name, first_name`
    );
    return results.rows.map(c => new Customer(c));
  }

  // get a customer by ID
  static async get(id) {
    const results = await db.query(
      `SELECT id, 
         first_name AS "firstName",  
         last_name AS "lastName", 
         phone, 
         notes 
        FROM customers WHERE id = $1`,
      [id]
    );

    const customer = results.rows[0];

    if (customer === undefined) {
      const err = new Error(`No such customer: ${id}`);
      err.status = 404;
      throw err;
    }

    return new Customer(customer);
  }

// return top ten customers based on most reservations 
  static async getTopTen() {
    const resp = await db.query(
          `SELECT customer_id, COUNT(*) FROM reservations GROUP BY customer_id ORDER BY COUNT(*) DESC LIMIT 10;`);

    return resp.rows.map(c => Customer.get(c.id))
  }


// get all reservations for this customer
  async getReservations() {
    return await Reservation.getReservationsForCustomer(this.id);
  }

  // property to get full name
  get fullName() {
    return `${this.firstName} ${this.lastName}`;
  }


// save this customer
  async save() {
    if (this.id === undefined) {
      const result = await db.query(
        `INSERT INTO customers (first_name, last_name, phone, notes)
             VALUES ($1, $2, $3, $4)
             RETURNING id`,
        [this.firstName, this.lastName, this.phone, this.notes]
      );
      this.id = result.rows[0].id;
    } else {
      await db.query(
        `UPDATE customers SET first_name=$1, last_name=$2, phone=$3, notes=$4
             WHERE id=$5`,
        [this.firstName, this.lastName, this.phone, this.notes, this.id]
      );
    }
  }
}

module.exports = Customer;
