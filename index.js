import { Command, Argument } from 'commander/esm.mjs'
import Woo from './woo.js'
import Categories from './categories.js'
import 'dotenv/config'

const program = new Command()
program.version('1.0.0')

const config = process.env

program
  .option('-d, --debug', 'output extra debugging', false)
  .option('-u --url <url>', 'Woocommerce API url', config.API_URL)
  .option('-u, --username <username>', 'Woocommerce API username', config.API_USERNAME)
  .option('-p, --password <password>', 'Woocommerce API password', config.API_PASSWORD)

const options = program.opts()

const woo = new Woo(options)

const runGetAllProducts = async () => {
  await woo.getAllLists()
}

const runGetProductBySKU = async (sku) => {
  await woo.getProductBySKU(sku)
}

const runGetNextAvailableSKU = async (category) => {
  console.log('Searching items for: ' + category)
  await woo.getNextAvailableSKU(category)
}

const runGetOrderbyNumber = async (number) => {
  console.log('Searching order #' + number)
  await woo.getOrderByNumber(number)
}

program
  .command('products')
  .description('prints the list of products for all processing orders')
  .action(runGetAllProducts)

program
  .command('product')
  .argument('<sku>', 'the SKU of the product')
  .description('searches a product by SKU')
  .action(runGetProductBySKU)

program
  .command('order')
  .argument('<number>', 'the order number')
  .description('searches an order by number')
  .action(runGetOrderbyNumber)

program
  .command('sku')
  .addArgument(new Argument('<category>', 'prefix of the category').choices(Object.keys(Categories)))
  .description('gets the next available SKU number for a given category')
  .action(runGetNextAvailableSKU)

await program.parseAsync(process.argv)