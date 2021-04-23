// @ts-nocheck
import { dayjs } from 'coa-helper'
import { AliSlsQuery, AliSlsService } from '..'

// SLS配置
const config = {
  endpoint: 'cn-shanghai-intranet.log.aliyuncs.com',
  project: 'project-name',
  accessKeyId: 'LTAI4XXXXXXXXXXXXXqTgH',
  accessKeySecret: 'Eg02rdV23XXXXXXXXXXXXXXXXXwgw8Pk',
}

// 创建service实例
const service = new AliSlsService(config)

// 定义查询的开始时间和结束时间
const from = dayjs('2020-01-01'), to = dayjs('2020-01-02')

// 查询指定 Project 下某个 Logstore 中的日志数据
await service.getLogs('project-name', from, to)

// 查询指定 Project 下某个 Logstore 中日志的分布情况
await service.getHistograms('project-name', from, to)


// 定义查询条件(全部用法如下)
const query = new AliSlsQuery()
  .dateFormat('__time__', '%m-%d %H:%i:%s', 'time')
  .timeSeries('__time__', 'time', `5m`)
  .column('userId')
  .column('sceneId', 'sceneId')
  .count('*', 'pv')
  .approxDistinct('userId', 'uv')
  .ne('event', 'device-visit')
  .eq('from', 'wxa')
  .notIn('path', ['', 'null'])
  .notLike(field, likes)
  .limit(2000)
  .groupBy('sceneId')
  .orderBy('pv desc')
  .toQuery()

// 按照查询条件查询指定 Project 下某个 Logstore 中的日志数据
await service.getLogs('project-name', from, to, { query })
