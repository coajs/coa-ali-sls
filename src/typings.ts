const config = {
  endpoint: '',
  project: '',
  accessKeyId: '',
  accessKeySecret: '',
}

export declare namespace AliSls {
  type Config = typeof config
  interface Dic<T = any> {
    [key: string]: T
  }
}
