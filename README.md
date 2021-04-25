# coa-ali-sls

[![GitHub license](https://img.shields.io/badge/license-MIT-green.svg?style=flat-square)](LICENSE)
[![npm version](https://img.shields.io/npm/v/coa-ali-sls.svg?style=flat-square)](https://www.npmjs.org/package/coa-ali-sls)
[![npm downloads](https://img.shields.io/npm/dm/coa-ali-sls.svg?style=flat-square)](http://npm-stat.com/charts.html?package=coa-ali-sls)
[![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen.svg?style=flat-square)](https://github.com/coajs/coa-ali-sls/pulls)

轻量的阿里云日志服务SDK for Node.js

来源于一个实际生产项目，将用到的API和业务解耦后封装成此库。

后续会根据实际使用情况优化和扩充新的服务。如果急需用到其他接口，可以直接使用阿里云官方SDK [aliyun-sdk/sls](https://github.com/aliyun-UED/aliyun-sdk-js/tree/master/samples/sls) 或查看阿里云官方 [帮助文档](https://help.aliyun.com/document_detail/141789.html)。

## 特征

- 覆盖了绝大多数使用场景
- 相对于官方的SDK，无任何第三方依赖，更轻量简洁
- 统一了异步表现形式，全部返回 Promise
- 内置类型引用，无需额外查看文档，开箱即用，IDE友好

## 快速开始

### 安装

```shell
yarn add coa-ali-sls
```

### 基本用法

```typescript
import { dayjs } from 'coa-helper'
import { AliSlsService } from 'coa-ali-sls'

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
service.getLogs('project-name', from, to)

// 查询指定 Project 下某个 Logstore 中日志的分布情况
service.getHistograms('project-name', from, to)
```

### 条件查询

可以使用 `AliSlsQuery` 构造查询条件进行查询

```typescript
import { dayjs } from 'coa-helper'
import { AliSlsQuery, AliSlsService } from 'coa-ali-sls'

// 创建service实例
const service = new AliSlsService({ /* ... */})

// 定义查询的开始时间和结束时间
const from = dayjs('2020-01-01'), to = dayjs('2020-01-02')

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
```