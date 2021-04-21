import { die } from 'coa-error'
import { axios, _ } from 'coa-helper'
import { secure } from 'coa-secure'
import { AliSls } from '../typings'

export class AliSlsBin {

  private readonly config: AliSls.Config

  constructor (config: AliSls.Config) {
    this.config = config
  }

  async get (url: string, params: AliSls.Dic) {

    const path = url + '?' + this.getSortQueryString(params)

    const headers = this.getHeaders('GET', path)
    const baseURL = `https://${this.config.project}.${this.config.endpoint}`

    const result = await axios.get(url, { params, headers, baseURL }).catch(this.resultError)

    return this.resultResponse(result)
  }

  async getBody (url: string, params: AliSls.Dic) {
    const { body } = await this.get(url, params)
    return body
  }

  protected resultError (e: any) {
    const data = e.response.data
    die.hint(data.errorMessage, 400, data.errorCode)
  }

  private resultResponse (result: any) {
    const body = result.data as AliSls.Dic[]
    const info = {} as AliSls.Dic<string>
    _.forEach(result.headers, (v, k) => {
      if (k.startsWith('x-log-')) info[_.camelCase(k.substr(6))] = v
    })
    _.forEach(body, v => {
      delete v['__time__']
      delete v['__source__']
    })
    return { body, info }
  }

  private getSortQueryString (params: AliSls.Dic<string | number | boolean | undefined>) {
    const list = [] as string[]
    _.forEach(params, (v, k) => {
      list.push(k + '=' + v)
    })
    return list.sort().join('&')
  }

  private getHeaders (method: string, path: string, headers: AliSls.Dic<string> = {}) {

    _.defaults(headers, {
      'x-log-bodyrawsize': '0',
      'x-log-apiversion': '0.6.0',
      'x-log-signaturemethod': 'hmac-sha1',
    })

    headers['Date'] = new Date().toUTCString()
    headers['Content-MD5'] = ''
    headers['Content-Type'] = ''
    headers['Authorization'] = this.signature(method, path, headers)

    return headers
  }

  private signature (method: string, path: string, headers: AliSls.Dic<string>) {

    const x_list = [] as string[], signs = [] as string[]

    _.forEach(headers, (v, k) => {
      k.startsWith('x-log') && x_list.push(k + ':' + v)
    })

    signs.push(method || '')
    signs.push(headers['Content-Md5'] || '')
    signs.push(headers['Content-Type'] || '')
    signs.push(headers['Date'] || '')
    signs.push(...x_list.sort())
    signs.push(path)

    const signature = secure.sha1_hmac(signs.join('\n'), this.config.accessKeySecret, 'base64')

    return `LOG ${this.config.accessKeyId}:${signature}`
  }

}