var errs = validate.errors.length;
var valid;

{{
  var $breakOnError = !it.opts.allErrors
    , $closingBraces = ''
    , $schemaDeps = {}
    , $propertyDeps = {};

  for ($property in it.schema.dependencies) {
    var $schema = it.schema.dependencies[$property];
    var $deps = Array.isArray($schema) ? $propertyDeps : $schemaDeps;
    $deps[$property] = $schema;
  }
}}

{{ for ($property in $propertyDeps) { }}
  if (data.hasOwnProperty('{{= $property }}')) {
    {{ $deps = $propertyDeps[$property]; }}
    valid = {{~ $deps:$dep:$i }}{{?$i}} && {{?}}data.hasOwnProperty('{{= $dep}}'){{~}};
    if (!valid) {
      validate.errors.push({
        keyword: 'dependencies',
        dataPath: dataPath,
        message: '{{? $deps.length == 1 }}property {{= $deps[0] }} is{{??}}properties {{= $deps.join(",") }} are{{?}} required when property {{= $property }} is present'
        {{? it.opts.verbose }}, schema: validate.schema{{= it.schemaPath + '.dependencies' }}, data: data{{?}}
      });
    }
    {{? $breakOnError }}
      {{ $closingBraces += '}'; }}
      else {
    {{?}}
  }
{{ } }}

{{ var $it = it.copy(it); }}

{{ for ($property in $schemaDeps) { }}
  if (data.hasOwnProperty('{{= $property }}')) {
    {{ 
      var $schema = $schemaDeps[$property];
      $it.schema = $schema;
      $it.schemaPath = it.schemaPath + '.dependencies["' + it.escapeQuotes($property) + '"]';
    }}

    {{? $breakOnError }} valid = {{?}}
      ({{= it.validate($it) }})(data, dataPath);
  }

  {{? $breakOnError }}
    {{ $closingBraces += '}'; }}
    if (valid) {
  {{?}}
{{ } }}

{{? $breakOnError }}{{= $closingBraces }}{{?}}

valid = errs == validate.errors.length;