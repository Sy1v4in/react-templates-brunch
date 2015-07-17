react_templates = require 'react-templates'

module.exports = class ReactTemplateCompiler
  brunchPlugin: yes
  type: 'template'
  extension: 'rt'
  pattern: /\.rt/

  constructor: (@config) ->
    options = @config?.plugins?.reactTemplates || {}
    @options = options || {}

  compile: (params, callback) ->
    source= params.data

    try
        output = react_templates.convertTemplateToReact(source, @options)

    catch err
      console.log "ERROR", err
      return callback err.toString()

    callback null, data: output
