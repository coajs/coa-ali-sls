import { _ } from 'coa-helper'
import { Dayjs } from 'dayjs'
import { AliSlsBin } from '../lib/AliSlsBin'
import { AliSls } from '../typings'

export class AliSlsService {
  private readonly config: AliSls.Config
  private readonly bin: AliSlsBin

  constructor(config: AliSls.Config) {
    this.config = config
    this.bin = new AliSlsBin(config)
  }

  // GetLogs 接口查询指定 Project 下某个 Logstore 中的日志数据
  async getLogsBody<T = AliSls.Dic<any>>(
    name: string,
    from: number,
    to: number,
    param?: {
      query?: string
      topic?: string
      offset?: number
      line?: number
      reverse?: boolean
    }
  ) {
    const params = {
      type: 'log',
      from: _.toInteger(from / 1000),
      to: _.toInteger(to / 1000),
      ...param,
    }
    const url = `/logstores/${name}`

    const result = await this.bin.getBody(url, params)

    return result as T[]
  }

  // GetLogs 接口查询指定 Project 下某个 Logstore 中的日志数据
  async getLogs(
    name: string,
    from: Dayjs,
    to: Dayjs,
    param?: {
      query?: string
      topic?: string
      offset?: number
      line?: number
      reverse?: boolean
    }
  ) {
    const params = {
      type: 'log',
      from: from.unix(),
      to: to.unix(),
      ...param,
    }
    const url = `/logstores/${name}`
    return await this.bin.get(url, params)
  }

  // 查询指定 Project 下某个 Logstore 中日志的分布情况
  async getHistograms(
    name: string,
    from: Dayjs,
    to: Dayjs,
    query?: string,
    topic?: string
  ) {
    const params = {
      type: 'histogram',
      from: from.unix(),
      to: to.unix(),
      query,
      topic,
    }
    const url = `/logstores/${name}`
    return await this.bin.get(url, params)
  }
}
