import { $ } from 'coa-helper'
import { AliSlsPageService } from '..'

$.run(async () => {
  const pageService = new AliSlsPageService()

  const url = pageService.getLogSearchConsolePageUrl('xxx-project-xxx', 'xxx-logstore-xx', { isShare: 'true' })

  console.log(url)
})
