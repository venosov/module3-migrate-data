const MongoClient = require('mongodb').MongoClient
const url = 'mongodb://localhost:27017'
const customers = require('./m3-customer-data.json')
const customerAddresses = require('./m3-customer-address-data.json')
const async = require('async')

let tasks = []
const limit = parseInt(process.argv[2])

var toType = function(obj) {
  return ({}).toString.call(obj).match(/\s([a-zA-Z]+)/)[1].toLowerCase()
}

MongoClient.connect(url, (error, db) => {
  customers.forEach((customer, index, list) => {
    customers[index] = Object.assign(customer, customerAddresses[index])

    if (index % limit == 0) {
      const start = index
      const end = (start+limit > customers.length) ? customers.length-1 : start+limit
      tasks.push((done) => {
        db.db("edx-course-db").collection('customers').insert(customers.slice(start, end), (error, results) => {
          done(error, results)
        })
      })
    } 
  })
  const startTime = Date.now()
  async.parallel(tasks, (error, results) => {
    const endTime = Date.now()
    db.close()
  })
})