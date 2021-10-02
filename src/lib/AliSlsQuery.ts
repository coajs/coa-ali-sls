import { echo } from 'coa-echo'
import { die } from 'coa-error'
import { _ } from 'coa-helper'

// SLS 极简的SLS SQLBuilder
export class AliSlsQuery {
  private readonly _column = [] as string[]
  private readonly _where = [] as string[]
  private readonly _groupBy = [] as string[]
  private readonly _orderBy = [] as string[]
  private _limit = 0 as number

  constructor() {
    return this
  }

  /**
   * 数据列
   * @param field 列名
   * @param alias 输出别名
   */
  column(field: string, alias?: string) {
    if (alias) field += ' as ' + alias
    this._column.push(field)
    return this
  }

  /**
   * 查询时间列
   * @param field 列名
   * @param format 格式化
   * @param alias 输出别名
   */
  dateFormat(field: string, format: string, alias?: string) {
    return this.column(`date_format(${field},'${format}')`, alias)
  }

  /**
   * 估算field列的唯一值的个数
   * @param field 列名
   * @param alias 输出别名
   */
  approxDistinct(field: string, alias?: string) {
    const stmt = `approx_distinct(${field})`
    return this.column(stmt, alias)
  }

  /**
   * 时序函数
   * @param grainSize 时间粒度，比如1m,1d
   * @param format 时间格式化
   * @param padding 补全的数据
   * @param field 列名
   * @param alias 输出别名
   */
  timeSeries(
    field: string,
    alias: string,
    grainSize: string,
    format = '%Y-%m-%d %H:%i',
    padding = 0
  ) {
    return this.column(
      `time_series(${field}, '${grainSize}', '${format}', '${padding}')`,
      alias
    )
  }

  /**
   * 等于
   * @param field 字段名
   * @param value 值
   * @param checkEmpty true进行空值检查，为空的不查询 false 不进行空值检查
   */
  eq(field: string, value: string, checkEmpty = false) {
    return this.where(field, '=', value, true, checkEmpty)
  }

  /**
   * 不等于
   * @param field 字段名
   * @param value 值
   * @param checkEmpty true进行空值检查，为空的不查询 false 不进行空值检查
   */
  ne(field: string, value: string, checkEmpty = false) {
    return this.where(field, '<>', value, true, checkEmpty)
  }

  /**
   * 不在当前数组中
   * @param field 字段名
   * @param values 字符串数组
   */
  notIn(field: string, values: string[]) {
    if (!values.length) return this

    _.forEach(values, (value, i) => {
      values[i] = `'${value}'`
    })
    const strArray = values.join(',')
    return this.where(field, 'not in', `(${strArray})`, false, false)
  }

  /**
   * 不相似
   * @param field 字段名
   * @param likes 带%的数据库语句
   * @param checkEmpty true进行空值检查，为空的不查询 false 不进行空值检查
   */
  notLike(field: string, likes: string, checkEmpty = false) {
    return this.where(field, 'not like', likes, true, checkEmpty)
  }

  /**
   * 根据字段分组
   * @param fields 字段名
   */
  groupBy(...fields: string[]) {
    this._groupBy.push(...fields)
    return this
  }

  /**
   * 根据字段排序
   * @param fields 字段名
   */
  orderBy(...fields: string[]) {
    this._orderBy.push(...fields)
    return this
  }

  /**
   * 获取前n条记录
   * @param count 前n项记录
   */
  limit(count: number) {
    this._limit = count
    return this
  }

  /**
   * 获取sql语句
   */
  toQuery() {
    let sql = '* | '

    this._column.length || die.hint('缺少column')
    sql += 'select ' + this._column.join(', ')

    if (this._where.length) sql += ' where ' + this._where.join(' and ')

    if (this._groupBy.length) sql += ' group by ' + this._groupBy.join(',')

    if (this._orderBy.length) sql += ' order by ' + this._orderBy.join(',')

    if (this._limit > 0) sql += ' limit ' + this._limit
    else echo.warn('SLS查询的结果行数默认为')
    return sql
  }

  /**
   * 计数方法
   * @param field  字段名
   * @param alias 输出别名
   */
  count(field = '*', alias?: string) {
    return this.column(`count(${field})`, alias)
  }

  /**
   *
   * @param field  字段名
   * @param operate 操作符
   * @param value 对比的值
   * @param wrapValue 是否把值当作字符串处理 是：在查询值两边添加单引号 否：不添加单引号
   * @param checkEmpty true进行空值检查，false不进行空值检查
   */
  private where(
    field: string,
    operate: string,
    value: string,
    wrapValue: boolean,
    checkEmpty: boolean
  ) {
    // 当开启空值检查 并且当前值为空的时候跳过该值
    if (checkEmpty && !value) return this
    const str = wrapValue
      ? `"${field}" ${operate} '${value}'`
      : `"${field}" ${operate} ${value}`
    this._where.push(str)
    return this
  }
}
