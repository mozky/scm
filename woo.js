import fetch, { Headers } from 'node-fetch'
import Categories from './categories.js'

class Woo {
  constructor({ url, username, password }) {
    this.url = url
    this.username = username
    this.password = password
  }

  async sendRequest(path) {
    const requestUrl = `${this.url}/v3/${path}`

    const response = await fetch(requestUrl, {
      headers: new Headers({
        'Authorization': `Basic ${btoa(`${this.username}:${this.password}`)}`
      })
    })
    
    if (!response.ok) {
      throw new Error('Not ok response ' + response)
    }

    return await response.json()
  }

  async getAllLists() {
    const response = await this.sendRequest('orders?status=processing&per_page=50')

    console.log(`TOTAL # OF ORDERS: ${response.length}`)

    const itemsMap = response.reduce((acc, curr) => {
      const items = curr.line_items.map(i => ({...i, order: curr.number}))
      return acc.concat(items)
    }, []).reduce((acc, curr) => {
      const idType = curr.variation_id ? 'variation_id' : 'product_id'
      const obj = {
        ...curr,
        count: acc[curr[idType]] ? acc[curr[idType]].count + curr.quantity : curr.quantity,
        material: curr.sku ? 
          (curr.sku.includes('925') ? 'plata' :
          (curr.sku.includes('INX') ? 'acero' :
          (curr.sku.includes('EARCUFF') ? 'chapa' :
          'oro'))) : '',
        tipo: curr.sku ? 
          (curr.sku.includes('ANI') ? 'anillo' :
          (curr.sku.includes('BRO') ? 'broquel' :
          (curr.sku.includes('EARCUFF') ? 'cuff' :
          (curr.sku.includes('HOOP') ? 'hoop' :
          'aro')))) : '',
        orders: acc[curr[idType]] ? acc[curr[idType]].orders.concat(curr.order) : [curr.order]
      }
      return  {...acc, [curr[idType]]: obj }
    }, {})
  
    const compare = (a, b) => a.sku >= b.sku ? 1 : -1
  
    const sortedItems = Object.values(itemsMap).sort(compare)
  
    console.table(sortedItems, ['count', 'sku', 'tipo', 'material', 'name', 'orders'])
  }

  async getNextAvailableSKU(category) {
    let response, key, i = 0
    if (category === Categories.BRO10) i = 129 // jump to latest known
    do {
      if (category === Categories.BRO10 || category === Categories.ARO10) {
        key = category + (++i < 10 ? '00' + i : (i < 100 ? '0' + i : i))
      } else {
        key = category + (++i < 10 ? '0' + i : i)
      }
      console.log(`Searching for SKU: ${key}...`)
      response = await this.sendRequest(`products?sku=${key}`)
      if (response.length > 1) console.log(`DUPLICATED SKU!!!1 ${key}`)
    } while (response.length)

    console.log(`Item with SKU ${key} doesn´t exist`)
  }

  async getProductBySKU(sku) {
    const response = await this.sendRequest(`products?sku=${sku}`)
    console.log(response)

    return
  }

  async getOrderByNumber(number) {
    const response = await this.sendRequest(`orders/${number}`)
    console.log(response)

    return
  }
}

export default Woo